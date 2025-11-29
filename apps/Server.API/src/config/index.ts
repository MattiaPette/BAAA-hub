import dotenv from 'dotenv';

dotenv.config({
  path: `../../environments/.env.${process.env.ENV || 'dev'}`,
});

interface Config {
  port: number;
  nodeEnv: string;
  debug: boolean;
  mongodb: {
    uri: string;
  };
  cors: {
    origin: string;
  };
  auth0: {
    domain: string;
    audience: string;
  };
  minio: {
    endpoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
  };
  webhook: {
    /** Secret for Auth0 post-login action webhook authentication */
    auth0Secret: string;
  };
}

const config: Config = {
  port: Number(process.env.BACKEND_PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/baaa-hub',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  },
  auth0: {
    domain: process.env.AUTH0_DOMAIN || '',
    audience: process.env.AUTH0_AUDIENCE || '',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: Number(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'baaa-hub-images',
    region: process.env.MINIO_REGION || 'us-east-1',
  },
  webhook: {
    auth0Secret: process.env.AUTH0_WEBHOOK_SECRET || '',
  },
};

export default config;
