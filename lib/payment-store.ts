import 'server-only';
import {database} from './database';
import {defaultPaymentSettings, type PaymentSettings} from './payment-settings';

export async function readPaymentSettings(): Promise<{settings: PaymentSettings; revision: number}> {
  try {
    const row = await database()
      .prepare('SELECT value, revision FROM homepage_content WHERE id=?')
      .bind('payment_settings')
      .first<{value: string; revision: number}>();
    if (!row) return {settings: defaultPaymentSettings, revision: 0};
    const parsed = JSON.parse(row.value) as Partial<PaymentSettings>;
    return {
      settings: {
        merchantName: typeof parsed.merchantName === 'string' && parsed.merchantName.trim() ? parsed.merchantName.trim() : defaultPaymentSettings.merchantName,
        merchantNumber: typeof parsed.merchantNumber === 'string' ? parsed.merchantNumber.trim() : defaultPaymentSettings.merchantNumber,
        qrImage: typeof parsed.qrImage === 'string' ? parsed.qrImage.trim() : '',
        noteBn: typeof parsed.noteBn === 'string' && parsed.noteBn.trim() ? parsed.noteBn.trim() : defaultPaymentSettings.noteBn,
        noteEn: typeof parsed.noteEn === 'string' && parsed.noteEn.trim() ? parsed.noteEn.trim() : defaultPaymentSettings.noteEn,
      },
      revision: row.revision || 0,
    };
  } catch {
    return {settings: defaultPaymentSettings, revision: 0};
  }
}
