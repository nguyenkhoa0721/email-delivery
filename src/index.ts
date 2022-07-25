import 'dotenv/config';
import Yargs, { describe } from 'yargs'
import client, { Connection, Channel, ConsumeMessage } from 'amqplib'
import sendListEmail from './mailer';
const amqpUrl = `amqp://${process.env.MQ_USERNAME}:${process.env.MQ_PASSWORD}@${process.env.MQ_HOST}:${process.env.MQ_PORT}`;

let flag: boolean = true;
let count = 0;
let buffer: Array<any> = [];
let messageCount: number = 0;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const main = async (bufferSize: number = 100, bufferDelay: number = 300) => {
  const connection: Connection = await client.connect(amqpUrl);
  const channel: Channel = await connection.createChannel();
  const queue = 'email.queue';

  await channel.assertQueue(queue);
  channel.prefetch(1);
  console.log('Connect RabbitMQ consume successfully');
  await channel.consume(
    queue, async (msg: ConsumeMessage | null) => {
      if (!msg) {
        return
      }
      if (flag) {
        flag = false;
        const queueMessage: any = await channel.checkQueue(queue);
        messageCount = queueMessage.messageCount;
        messageCount += 1;
      }

      count += 1;
      buffer.push(JSON.parse(msg.content.toString()));

      if (count % Math.min(bufferSize, messageCount) == 0) {
        await sendListEmail(buffer);
        await sleep(bufferDelay);
        channel.ack(msg);
        buffer = [];
        flag = true;
        count = 0;
      }
      else {
        channel.ack(msg);
      }
    })
}


Yargs.version('1.0.0')
Yargs.command({
  command: 'run',
  builder: {
    size: {
      alias: 's',
      describe: "Buffer Size",
      demandOption: true,
      type: 'number'
    },
    delay: {
      alias: 'd',
      describe: "Delay (milsec)",
      demandOption: true,
      type: 'number'
    }
  },
  handler(argv) {
    main(argv.bufferSize as number, argv.bufferDelay as number);
  }
})
Yargs.parse();


