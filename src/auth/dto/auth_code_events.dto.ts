export enum AuthLogPending {
  Pending = 'pending',
  Failed = 'failed',
  Success = 'success',
}

export type AuthLog = {
  deviceUid: string;
  phone: string;
  notifyType: string;
  eventType: string;
  status: AuthLogPending;
};
