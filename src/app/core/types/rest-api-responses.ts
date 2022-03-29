export interface IApiResponse<T> {
  code: number;
  data: T;
  message?: string;
  error?: string;
}

export interface IPaymentRequestResponse {
  is_kyc_update_required: boolean;
  payment_id: string;
}
