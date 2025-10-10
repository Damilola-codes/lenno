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
        user: { 
          uid: string;
          username?: string;
          email?: string;
        };
      }>;
      createPayment: (
        paymentData: {
          amount: number;
          memo: string;
          metadata: Record<string, string | number | boolean>;
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, paymentId: string) => void;
        }
      ) => void;
    }
  }
}

export {};