export type PaymentSettings = {
  merchantName: string;
  merchantNumber: string;
  qrImage: string;
  noteBn: string;
  noteEn: string;
};

export const defaultPaymentSettings: PaymentSettings = {
  merchantName: 'মাসের বাজার (Masher Bazar)',
  merchantNumber: '01700-000000',
  qrImage: '',
  noteBn: 'যেকোনো ব্যাংক অ্যাপ, bKash, Nagad, Rocket বা Upay থেকে উপরের Bangla QR স্ক্যান করে পেমেন্ট সম্পন্ন করুন এবং মেসেজে পাওয়া TrxID নিচে লিখুন।',
  noteEn: 'Scan the Bangla QR above using bKash, Nagad, Rocket, Upay, or any banking app, complete the payment, and enter your Transaction ID (TrxID) below.',
};
