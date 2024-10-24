export const logger = {
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${message}`);
  },
  info: (message: string) => {
    console.info(`[INFO] ${message}`);
  },
  debug: (message: string) => {
    console.debug(`[DEBUG] ${message}`);
  },
};
