
namespace NodeJS {
  interface ProcessEnv {
    MAIL_MAILER: string;
    MAIL_HOST: string;
    MAIL_PORT: string;
    HELLO_MAIL_USERNAME: string;
    HELLO_MAIL_PASSWORD: string;
    SRC_MAIL_USERNAME: string;
    SRC_MAIL_PASSWORD: string;
    MAIL_ENCRYPTION: string;
    MAIL_FROM_ADDRESS: string;
    MAIL_FROM_NAME: string;
    ENABLE_API_PROXY: number;
    PROXY_HOST: string;
    PROXY_PORT: string;
    MQ_USERNAME: string;
    MQ_PASSWORD: string;
    MQ_HOST: string;
    MQ_PORT: string;
  }
}

