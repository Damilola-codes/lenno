// Pi Network SDK Type Definitions
declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox: boolean }) => void;
      authenticate: (
        scopes: string[],
        options?: {
          onIncompletePaymentFound?: (payment: unknown) => void;
        }
      ) => Promise<{
        accessToken: string;
        user: { uid: string };
      }>;
    }
  }
}

export {};