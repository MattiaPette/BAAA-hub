declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: string;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
