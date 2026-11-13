'use client';
import {ShieldCheck, Copy, Check, Sparkles} from 'lucide-react';
import {useState} from 'react';
import type {PaymentSettings} from '@/lib/payment-settings';

export const BANGLA_QR_LOGO_PATH = '/assets/aistudio/image_d1e05d5c.png';

function DefaultBanglaQrSvg({merchantName}: {merchantName: string}) {
  const size = 25;
  const cells: boolean[][] = Array.from({length: size}, () => Array(size).fill(false));

  function drawFinder(r0: number, c0: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[r0 + r][c0 + c] = border || inner;
      }
    }
  }
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  let seed = 2166136261;
  for (let i = 0; i < merchantName.length; i++) {
    seed ^= merchantName.charCodeAt(i);
    seed = Math.imul(seed, 16777619) >>> 0;
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinderTL = r < 8 && c < 8;
      const inFinderTR = r < 8 && c >= size - 8;
      const inFinderBL = r >= size - 8 && c < 8;
      const inCenterLogo = r >= 9 && r <= 15 && c >= 9 && c <= 15;
      if (inFinderTL || inFinderTR || inFinderBL || inCenterLogo || r === 6 || c === 6) continue;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      cells[r][c] = (seed & 3) !== 0;
    }
  }

  return (
    <div className="bangla-qr-code-canvas">
      <svg viewBox="0 0 280 280" className="bangla-qr-svg" role="img" aria-label="Bangla QR Code">
        <rect width="280" height="280" rx="16" fill="#ffffff" />
        {/* Green corner scanner brackets matching official Bangla QR style */}
        <path d="M14 42 V18 A4 4 0 0 1 18 14 H42" fill="none" stroke="#0d7a3e" strokeWidth="5" strokeLinecap="round" />
        <path d="M238 14 H262 A4 4 0 0 1 266 18 V42" fill="none" stroke="#0d7a3e" strokeWidth="5" strokeLinecap="round" />
        <path d="M14 238 V262 A4 4 0 0 0 18 266 H42" fill="none" stroke="#0d7a3e" strokeWidth="5" strokeLinecap="round" />
        <path d="M238 266 H262 A4 4 0 0 0 266 262 V238" fill="none" stroke="#0d7a3e" strokeWidth="5" strokeLinecap="round" />
        <g transform="translate(27.5, 27.5)">
          {cells.map((row, r) =>
            row.map((on, c) =>
              on ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * 9}
                  y={r * 9}
                  width="8.1"
                  height="8.1"
                  rx="1.5"
                  fill="#17141a"
                />
              ) : null
            )
          )}
        </g>
      </svg>
      <div className="bangla-qr-center-badge">
        <img src={BANGLA_QR_LOGO_PATH} alt="Bangla QR" />
      </div>
    </div>
  );
}

export default function BanglaQrPaymentBox({
  settings,
  amountFormatted,
  trxId,
  onTrxIdChange,
  lang,
}: {
  settings: PaymentSettings;
  amountFormatted: string;
  trxId: string;
  onTrxIdChange: (v: string) => void;
  lang: 'bn' | 'en';
}) {
  const [copied, setCopied] = useState(false);
  const tr = (bn: string, en: string) => (lang === 'bn' ? bn : en);

  function copyNumber() {
    if (!settings.merchantNumber) return;
    navigator.clipboard?.writeText(settings.merchantNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  return (
    <div className="bangla-qr-box">
      {/* Top Header with official Bangla QR Logo and Payable Amount */}
      <div className="bangla-qr-header">
        <div className="bangla-qr-brand">
          <img src={BANGLA_QR_LOGO_PATH} alt="Bangla QR" className="bangla-qr-logo-img" />
          <div>
            <strong>BANGLA QR · বাংলা কিউআর</strong>
            <small>{tr('জাতীয় কিউআর পেমেন্ট গেটওয়ে', 'National QR Payment Gateway')}</small>
          </div>
        </div>
        <div className="bangla-qr-amount-chip">
          <span>{tr('পরিশোধযোগ্য', 'Payable')}</span>
          <b>{amountFormatted}</b>
        </div>
      </div>

      {/* Supported Apps Strip */}
      <div className="bangla-qr-apps" aria-label="Supported payment apps">
        <span className="qr-app-pill bkash">bKash</span>
        <span className="qr-app-pill nagad">Nagad</span>
        <span className="qr-app-pill rocket">Rocket</span>
        <span className="qr-app-pill upay">Upay</span>
        <span className="qr-app-pill bank">{tr('সকল ব্যাংক অ্যাপ', 'All Bank Apps')}</span>
      </div>

      {/* Large Centered QR Code Stage */}
      <div className="bangla-qr-stage">
        <div className="bangla-qr-visual-large">
          {settings.qrImage ? (
            <img src={settings.qrImage} alt="Bangla QR Code" className="bangla-qr-custom-img" />
          ) : (
            <DefaultBanglaQrSvg merchantName={settings.merchantName} />
          )}
        </div>

        <div className="bangla-qr-merchant-bar">
          <div className="bangla-qr-merchant-info">
            <span className="merchant-label">{tr('মার্চেন্ট:', 'Merchant:')}</span>
            <strong>{settings.merchantName}</strong>
          </div>
          {settings.merchantNumber && (
            <div className="bangla-qr-merchant-num">
              <code>{settings.merchantNumber}</code>
              <button type="button" onClick={copyNumber} title={tr('নম্বর কপি করুন', 'Copy number')}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? tr('কপি হয়েছে', 'Copied') : tr('কপি করুন', 'Copy')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full-Width Clear 3-Step Guide */}
      <div className="bangla-qr-guide">
        <div className="bangla-qr-guide-title">
          <Sparkles size={14} />
          <span>{tr('সহজ ৩টি ধাপে পেমেন্ট সম্পন্ন করুন:', 'Complete payment in 3 easy steps:')}</span>
        </div>
        <ol className="bangla-qr-steps">
          <li>
            <b>১</b>
            <span>
              {tr(
                'আপনার bKash, Nagad, Rocket বা যেকোনো ব্যাংক অ্যাপ থেকে উপরের QR কোডটি স্ক্যান করুন।',
                'Open bKash, Nagad, Rocket or any bank app and scan the QR code above.'
              )}
            </span>
          </li>
          <li>
            <b>২</b>
            <span>
              {tr(
                `সর্বমোট ${amountFormatted} টাকা পরিশোধ করুন (অথবা মার্চেন্ট নম্বরে Send Money/Payment করুন)।`,
                `Pay the exact total of ${amountFormatted} to the merchant account.`
              )}
            </span>
          </li>
          <li>
            <b>৩</b>
            <span>
              {tr(
                'পেমেন্ট সফল হলে মেসেজ বা রিসিট থেকে পাওয়া Transaction ID (TrxID) নিচের বক্সে লিখুন।',
                'Copy the Transaction ID (TrxID) from your SMS/receipt and enter it below.'
              )}
            </span>
          </li>
        </ol>
      </div>

      {/* Prominent, Easy-to-Type TrxID Input Section */}
      <div className="bangla-qr-trx-field">
        <label htmlFor="bangla-qr-trxid-input" className="bangla-qr-trx-label-head">
          <span>
            {tr('ট্রানজেকশন আইডি (TrxID) লিখুন', 'Enter Transaction ID (TrxID)')} <em>*</em>
          </span>
          <span className="trx-badge">{tr('আবশ্যক', 'Required')}</span>
        </label>
        <input
          id="bangla-qr-trxid-input"
          name="trxId"
          type="text"
          required
          minLength={4}
          maxLength={40}
          pattern="[A-Za-z0-9_-]{4,40}"
          value={trxId}
          onChange={e => onTrxIdChange(e.target.value.toUpperCase())}
          placeholder={tr('এখানে TrxID লিখুন (যেমন: BKS9823K1L)', 'Type TrxID here (e.g. BKS9823K1L)')}
          autoComplete="off"
        />
        <p className="bangla-qr-verify-hint">
          <ShieldCheck size={15} />
          <span>
            {tr(
              'অ্যাডমিন আপনার TrxID যাচাই করার সাথে সাথেই পেমেন্ট সফল (Verified) হয়ে যাবে।',
              'Your payment will be marked verified as soon as admin confirms your TrxID.'
            )}
          </span>
        </p>
      </div>
    </div>
  );
}
