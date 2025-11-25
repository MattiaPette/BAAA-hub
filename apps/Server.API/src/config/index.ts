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
};

export default config;
