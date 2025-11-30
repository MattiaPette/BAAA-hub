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
  keycloak: {
    /** Keycloak server URL (e.g., https://keycloak.example.com) */
    url: string;
    /** Keycloak realm name */
    realm: string;
    /** Expected audience (client ID) for token validation */
    clientId: string;
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
    /** Secret for Keycloak event listener webhook authentication */
    secret: string;
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
  keycloak: {
    url: process.env.KEYCLOAK_URL || '',
    realm: process.env.KEYCLOAK_REALM || '',
    clientId: process.env.KEYCLOAK_CLIENT_ID || '',
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
    secret: process.env.KEYCLOAK_WEBHOOK_SECRET || '',
  },
};

export default config;
