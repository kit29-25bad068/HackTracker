import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Copy,
  Check,
  QrCode,
  KeyRound,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { refreshUser } = useAuth();
  const { addToast } = useNotification();

  const [step, setStep] = useState<'qr' | 'backup'>('qr');
  const [secret, setSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('qr');
      setCode('');
      setError(null);
      fetchSetupData();
    }
  }, [isOpen]);

  const fetchSetupData = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/2fa/generate');
      setSecret(res.data.secret);
      setQrCodeDataUrl(res.data.qrCodeDataUrl);
    } catch (err: any) {
      setError('Failed to generate 2FA setup details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'hacktracker_backup_codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError('Please enter the 6-digit verification code from your authenticator app.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await api.post('/auth/2fa/enable', {
        secret,
        code: code.trim(),
      });

      setBackupCodes(res.data.backupCodes || []);
      setStep('backup');
      await refreshUser();
      addToast('success', 'Two-Factor Authentication Enabled', 'Your account is now guarded with standard TOTP 2FA.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid 2FA code. Please verify the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Two-Factor Authentication Setup
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {step === 'qr' ? 'Scan QR Code with Google Authenticator or Authy' : 'Save your emergency backup codes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'qr' ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                1. Open <strong>Google Authenticator</strong>, <strong>Apple Passwords</strong>, or <strong>Authy</strong> on your phone and scan the QR code below:
              </p>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-200 shadow-inner w-fit mx-auto">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  </div>
                )}
              </div>

              {/* Manual Secret Key */}
              <div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">
                  Cannot scan? Enter manual secret code:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={secret}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="px-3 py-2 text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1"
                  >
                    {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSecret ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Code Verification Input */}
              <form onSubmit={handleVerifyAndEnable} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    2. Enter 6-digit Authenticator Code:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#131B2A] text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={code.length < 6 || isLoading}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 rounded-xl shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Verify and Activate 2FA
                </button>
              </form>
            </div>
          ) : (
            /* Step 2: Backup Codes */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <strong>Important:</strong> Save these 10 one-time recovery backup codes. If you lose access to your phone or authenticator app, you can use these codes to regain access to your account.
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-[#0D131F] rounded-2xl border border-gray-200 dark:border-gray-800 font-mono text-xs text-gray-900 dark:text-white">
                {backupCodes.map((bCode, idx) => (
                  <div key={idx} className="p-1.5 bg-white dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700/60 text-center font-bold">
                    {bCode}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="flex-1 py-2 px-3 text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-800 dark:text-gray-200 flex items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-700"
                >
                  {copiedBackup ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copiedBackup ? 'Codes Copied!' : 'Copy All Codes'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 py-2 px-3 text-xs font-bold bg-teal-600 hover:bg-teal-700 rounded-xl text-white flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20"
                >
                  <Download className="w-4 h-4" />
                  Download TXT
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl"
                >
                  I Have Safely Saved My Backup Codes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetupModal;
