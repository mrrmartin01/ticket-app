export interface PaystackTransactionInitializeArgs {
  name: string;
  amount: number;
  reference: string;
  callback_url: string;
}

export interface PaystackTransactionVerifyArgs {
  reference: string;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    customer: {
      email: string;
      id: number;
    };
  };
}

export interface PaystackTransactionApi {
  initialize(
    args: PaystackTransactionInitializeArgs,
  ): Promise<PaystackInitResponse>;
  verify(args: PaystackTransactionVerifyArgs): Promise<PaystackVerifyResponse>;
}

export interface PaystackClient {
  transaction: PaystackTransactionApi;
}

export type PaystackFactory = (secretKey: string) => PaystackClient;
