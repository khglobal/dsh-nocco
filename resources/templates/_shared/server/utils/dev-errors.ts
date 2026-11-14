export interface BrowserError {
  message: string;
  /** The page the error happened on. */
  page: string;
  /** Milliseconds since the epoch. */
  time: number;
}

const LIMIT = 20;
const errors: BrowserError[] = [];

/** Errors pages reported while the app runs in development, newest last. */
export const devErrors = {
  add(error: BrowserError): void {
    // The same error repeating on every render would crowd out the others.
    if (errors.some((known) => known.message === error.message && known.page === error.page)) return;
    errors.push(error);
    errors.splice(0, Math.max(0, errors.length - LIMIT));
  },
  /** Return the reported errors and forget them. */
  take(): BrowserError[] {
    return errors.splice(0, errors.length);
  },
};
