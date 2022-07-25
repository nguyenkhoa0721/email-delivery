import nodemailer from 'nodemailer';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import globby from 'globby';
import _ from 'lodash';
import * as async from 'async';


let templates: any = {}
let validTemplates: Array<string> = [];

const init = async () => {
  const paths = await globby(['./templates/*.hbs']);
  for (let path of paths) {
    const lastPath = _.last(path.split('/'));
    if (!lastPath)
      continue
    const templateName = _.camelCase(lastPath.split('.')[0]);
    const source = (fs.readFileSync(path)).toString();
    templates[templateName] = Handlebars.compile(source);
    validTemplates.push(templateName);
  }
};
init();

let smtpConfig: Object = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
};

if (process.env.ENABLE_API_PROXY)
  smtpConfig = Object.assign(smtpConfig, {
    proxy: `${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`
  })

let helloEmail: Object = {},
  sourcingEmail: Object = {};

helloEmail = Object.assign(
  {
    user: process.env.HELLO_MAIL_USERNAME,
    pass: process.env.HELLO_MAIL_PASSWORD,
  },
  smtpConfig);

sourcingEmail = Object.assign(
  {
    user: process.env.SRC_MAIL_USERNAME,
    pass: process.env.SRC_MAIL_PASSWORD,
  },
  smtpConfig
);

const helloTransporter = nodemailer.createTransport(helloEmail);
const srcTransporter = nodemailer.createTransport(sourcingEmail);

const sendEmail = async (emailInfo: any, cb: any) => {
  const {
    emailTo,
    format,
    info
  } = emailInfo;
  const ccEmail = emailInfo.ccEmail ? emailInfo.ccEmail : '';

  let template: any;
  if (validTemplates.includes(format)) {
    template = templates[format];
  }

  if (format == 'rfqNoti') {
    await srcTransporter.sendMail({
      from: '"debiON.vn" <sourcing@debion.vn>',
      to: emailTo,
      cc: ccEmail,
      subject: info.subject,
      html: template(info.content),
    });
  } else {
    await helloTransporter.sendMail({
      from: '"debiON.vn" <hello@debion.vn>',
      to: emailTo,
      cc: ccEmail,
      subject: info.subject,
      html: template(info.content),
    });
  }
  console.log(`${Date().toLocaleString()} - Send email to ${emailTo} with template ${format} successfully`);
};

const sendListEmails = async (emailList: Array<any>) => {
  async.each(emailList, sendEmail).then(() => {
    //pass
  }).catch((err: any) => {
    console.log(err)
  })
}

export default sendListEmails;

