'use client';
import {QrCode, ShieldCheck, Copy, Check} from 'lucide-react';
import {useState} from 'react';
import type {PaymentSettings} from '@/lib/payment-settings';

function DefaultBanglaQrSvg({merchantName}: {merchantName: string}) {
  // Deterministic 21x21 QR-like matrix with standard finder patterns + timing + data modules
  const size = 21;
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

  let seed = 0;
  for (let i = 0; i < merchantName.length; i++) {
    seed = (seed * 31 + merchantName.charCodeAt(i)) >>> 0;
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinderTL = r < 8 && c < 8;
      const inFinderTR = r < 8 && c >= size - 8;
      const inFinderBL = r >= size - 8 && c < 8;
      const inCenterLogo = r >= 8 && r <= 12 && c >= 8 && c <= 12;
      if (inFinderTL || inFinderTR || inFinderBL || inCenterLogo || r === 6 || c === 6) continue;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      cells[r][c] = (seed & 3) !== 0;
    }
  }

  return (
    <svg viewBox="0 0 250 250" className="bangla-qr-svg" role="img" aria-label="Bangla QR Code">
      <rect width="250" height="250" rx="14" fill="#ffffff" />
      <g transform="translate(20, 20)">
        {cells.map((row, r) =>
          row.map((on, c) =>
            on ? (
              <rect
                key={`${r}-${c}`}
                x={c * 10}
                y={r * 10}
                width="9.2"
                height="9.2"
                rx="1.8"
                fill="#1d181f"
              />
            ) : null
          )
        )}
        <rect x="78" y="78" width="54" height="54" rx="10" fill="#ffffff" stroke="#e52673" strokeWidth="2.5" />
        <rect x="83" y="83" width="44" height="44" rx="8" fill="#006a4e" />
        <circle cx="105" cy="105" r="12" fill="#f42a41" />
        <text x="105" y="109" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="800" fontFamily="Inter, sans-serif">
          QR
        </text>
      </g>
    </svg>
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
      <div className="bangla-qr-header">
        <div className="bangla-qr-brand">
          <span className="bangla-qr-flag" aria-hidden="true">
            <i />
          </span>
          <div>
            <strong>BANGLA QR · বাংলা কিউআর</strong>
            <small>{tr('জাতীয় কিউআর পেমেন্ট গেটওয়ে', 'National QR Payment Standard')}</small>
          </div>
        </div>
        <span className="bangla-qr-amount-chip">
          {tr('পরিশোধযোগ্য:', 'Payable:')} <b>{amountFormatted}</b>
        </span>
      </div>

      <div className="bangla-qr-apps" aria-label="Supported payment apps">
        <span className="qr-app-pill bkash">bKash</span>
        <span className="qr-app-pill nagad">Nagad</span>
        <span className="qr-app-pill rocket">Rocket</span>
        <span className="qr-app-pill upay">Upay</span>
        <span className="qr-app-pill bank">{tr('সকল ব্যাংক অ্যাপ', 'All Bank Apps')}</span>
      </div>

      <div className="bangla-qr-body">
        <div className="bangla-qr-frame">
          {settings.qrImage ? (
            <img src={settings.qrImage} alt="Bangla QR Code" className="bangla-qr-custom-img" />
          ) : (
            <DefaultBanglaQrSvg merchantName={settings.merchantName} />
          )}
          <span className="bangla-qr-merchant-name">{settings.merchantName}</span>
          {settings.merchantNumber && (
            <div className="bangla-qr-merchant-num">
              <span>{settings.merchantNumber}</span>
              <button type="button" onClick={copyNumber} title={tr('নম্বর কপি করুন', 'Copy number')}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? tr('কপি হয়েছে', 'Copied') : tr('কপি', 'Copy')}
              </button>
            </div>
          )}
        </div>

        <div className="bangla-qr-instructions">
          <h4>
            <QrCode size={17} />
            {tr('কিভাবে পেমেন্ট করবেন:', 'How to complete payment:')}
          </h4>
          <ol>
            <li>
              {tr(
                'আপনার bKash, Nagad, Rocket বা যেকোনো ব্যাংক অ্যাপ খুলে "Scan QR" / "Bangla QR" অপশনে যান।',
                'Open bKash, Nagad, Rocket, or any banking app and tap "Scan QR" / "Bangla QR".'
              )}
            </li>
            <li>
              {tr(
                `উপরের QR কোডটি স্ক্যান করে মোট ${amountFormatted} পরিশোধ করুন।`,
                `Scan the QR code above and pay the exact total of ${amountFormatted}.`
              )}
            </li>
            <li>
              {tr(
                'পেমেন্ট সম্পন্ন হলে রিসিট বা SMS থেকে পাওয়া Transaction ID (TrxID) নিচের ঘরে লিখুন।',
                'Once paid, enter the Transaction ID (TrxID) from your receipt or SMS below.'
              )}
            </li>
          </ol>
          {(settings.noteBn || settings.noteEn) && (
            <p className="bangla-qr-note">{tr(settings.noteBn, settings.noteEn)}</p>
          )}

          <label className="form-label bangla-qr-trx-label">
            <span>
              {tr('ট্রানজেকশন আইডি (TrxID)', 'Transaction ID (TrxID)')} <em>*</em>
            </span>
            <input
              name="trxId"
              type="text"
              required
              minLength={4}
              maxLength={40}
              pattern="[A-Za-z0-9_-]{4,40}"
              value={trxId}
              onChange={e => onTrxIdChange(e.target.value.toUpperCase())}
              placeholder={tr('যেমন: BKS9823K1L বা TXN104829', 'e.g. BKS9823K1L or TXN104829')}
              autoComplete="off"
            />
            <small>
              <ShieldCheck size={13} />
              {tr(
                'অ্যাডমিন আপনার TrxID যাচাই করার সাথে সাথেই পেমেন্ট সফল হিসেবে নিশ্চিত হবে।',
                'Your payment will be marked verified as soon as the admin confirms your TrxID.'
              )}
            </small>
          </label>
        </div>
      </div>
    </div>
  );
}
