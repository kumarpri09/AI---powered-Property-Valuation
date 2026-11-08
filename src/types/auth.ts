export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export interface UserAddress {
  line1: string;
  locality: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  address: UserAddress;
  mobileNumber: string;
  email?: string;
  isOtpVerified: boolean;
  registeredAt: string;
  role: 'Chartered Valuer' | 'Real Estate Investor' | 'Property Buyer/Seller' | 'Broker / Consultant';
}

export interface SmsDeliveryReceipt {
  messageId: string;
  senderId: string;
  mobileNumber: string;
  smsText: string;
  deliveredAt: string;
  carrier: string;
  otpCode: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeOtpCode: string | null;
  otpCountdown: number;
  isPendingOtp: boolean;
  pendingMobile: string | null;
  pendingRegistrationData: Partial<UserProfile> | null;
  smsReceipt: SmsDeliveryReceipt | null;
}
