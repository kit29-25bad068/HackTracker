import React, { useState } from 'react';
import {
  Upload,
  X,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Project } from '../types';

interface CertificateModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProject: Project) => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { refreshUser } = useAuth();
  const { addToast } = useNotification();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setOcrResult(null);

      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUploadAndVerify = async () => {
    if (!file) {
      setError('Please select a certificate file (PNG, JPG, PDF).');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const formData = new FormData();
      formData.append('certificate', file);

      const res = await api.post(`/projects/${project.id}/certificate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { project: updated, ocrResult: ocrData, unlockedBadges } = res.data;

      setOcrResult(ocrData);
      setIsProcessing(false);

      if (ocrData.status === 'VERIFIED') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        addToast(
          'badge',
          'Certificate OCR Verified!',
          `+8 Trust Score awarded for ${project.title}!`
        );

        if (unlockedBadges && unlockedBadges.length > 0) {
          addToast('badge', 'New Badge Unlocked!', `Earned badge: ${unlockedBadges.join(', ')}`);
        }

        await refreshUser();
        onSuccess(updated);
      } else {
        setError(ocrData.rejectionReason || 'Certificate could not be verified automatically.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.response?.data?.error || 'OCR processing failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Certificate OCR Verification
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Project: {project.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!ocrResult ? (
            <>
              {/* File Dropzone */}
              <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-800/30">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-teal-500 mb-2" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {file ? file.name : 'Click to select or drag & drop certificate'}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Supported: PNG, JPG, WebP, PDF (Max 10MB)
                </span>
              </label>

              {previewUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-48 flex items-center justify-center bg-black/20">
                  <img src={previewUrl} alt="Certificate preview" className="object-contain max-h-48 w-full" />
                </div>
              )}

              {/* Instructions banner */}
              <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                  <ShieldCheck className="w-4 h-4" /> How OCR Verification Works:
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Tesseract OCR scans your certificate pixels to verify your name, hackathon name, and achievement tier.
                </p>
                <p className="font-semibold text-teal-600 dark:text-teal-400">
                  Reward: +8 Trust Score &bull; +200 Points for Winner awards &bull; Unlock verification badges
                </p>
              </div>
            </>
          ) : (
            /* OCR Results Breakdown */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  ocrResult.status === 'VERIFIED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/50 text-amber-900 dark:text-amber-200'
                }`}
              >
                {ocrResult.status === 'VERIFIED' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {ocrResult.status === 'VERIFIED' ? 'Certificate Authenticated Successfully!' : 'Verification Incomplete'}
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90">
                    OCR Confidence Score: <strong>{ocrResult.confidenceScore}%</strong>
                  </p>
                </div>
              </div>

              {/* Extracted Fields Table */}
              <div className="bg-gray-50 dark:bg-[#0D131F] rounded-xl p-4 border border-gray-200 dark:border-gray-800 space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-gray-200/60 dark:border-gray-800 pb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Student Name:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{ocrResult.extractedName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/60 dark:border-gray-800 pb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Hackathon:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{ocrResult.extractedHackathon}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/60 dark:border-gray-800 pb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Achievement Detected:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{ocrResult.extractedAchievement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Issued Date:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{ocrResult.extractedDate}</span>
                </div>
              </div>

              {ocrResult.status === 'VERIFIED' && (
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center justify-between">
                  <span>Trust Score Recalculated</span>
                  <span className="text-emerald-500 font-extrabold">+8.0% Boost</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3 bg-gray-50 dark:bg-[#0D131F]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            {ocrResult ? 'Done' : 'Cancel'}
          </button>
          {!ocrResult && (
            <button
              onClick={handleUploadAndVerify}
              disabled={!file || isProcessing}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 rounded-xl shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Tesseract OCR...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Verify with OCR
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
