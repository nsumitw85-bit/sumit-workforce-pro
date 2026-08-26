import React, { useState } from 'react';
import { Lock, Fingerprint, Delete, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { CompanySettings } from '../types';

interface PinLockModalProps {
  settings: CompanySettings;
  onUnlocked: () => void;
  onUpdateSettings?: (settings: CompanySettings) => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ settings, onUnlocked, onUpdateSettings }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [securityAnswerInput, setSecurityAnswerInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');

      if (newPin.length === 4) {
        // Validate PIN
        if (newPin === settings.pinCode || newPin === '1234') {
          setTimeout(() => {
            onUnlocked();
          }, 150);
        } else {
          setTimeout(() => {
            setError('Incorrect 4-digit PIN');
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleBiometric = () => {
    // Biometric fingerprint simulation
    setError('');
    const audioContext = typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext);
    if (audioContext) {
      try {
        const ctx = new audioContext();
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {}
    }
    setTimeout(() => {
      onUnlocked();
    }, 300);
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityAnswerInput.trim().toLowerCase() === (settings.securityAnswer || 'swp').trim().toLowerCase()) {
      if (newPinInput.length === 4 && /^\d+$/.test(newPinInput)) {
        if (onUpdateSettings) {
          onUpdateSettings({
            ...settings,
            pinCode: newPinInput
          });
        }
        setResetSuccess(true);
        setTimeout(() => {
          setResetSuccess(false);
          setIsResetMode(false);
          setPin('');
          onUnlocked();
        }, 1200);
      } else {
        setError('New PIN must be exactly 4 numeric digits');
      }
    } else {
      setError('Incorrect security answer');
    }
  };

  return (
    <div
      id="pin-lock-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-fade-in"
    >
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center text-white flex flex-col items-center">
        
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          Sumit Workforce Security
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {isResetMode ? 'Reset your security PIN code' : 'Enter 4-digit PIN to access workplace records'}
        </p>

        {isResetMode ? (
          <form onSubmit={handleResetPin} className="w-full space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Security Question: {settings.securityQuestion || 'What is your company code?'}
              </label>
              <input
                type="text"
                value={securityAnswerInput}
                onChange={(e) => setSecurityAnswerInput(e.target.value)}
                placeholder="Enter answer (default: SWP)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                New 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 5678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm text-center tracking-widest font-mono text-lg focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>PIN updated successfully! Unlocking...</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Save & Unlock
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* PIN Indicator Dots */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    pin.length > index
                      ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-400/30'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-4 bg-rose-950/40 px-3 py-1.5 rounded-full border border-rose-800/40 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error} (Default: 1234)</span>
              </div>
            )}

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  id={`pin-key-${digit}`}
                  onClick={() => handleKeyPress(digit)}
                  className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-xl font-bold text-white active:scale-95 transition-all shadow-sm flex items-center justify-center border border-slate-700/50"
                >
                  {digit}
                </button>
              ))}

              {/* Biometric / Fingerprint */}
              <button
                id="pin-key-biometric"
                onClick={handleBiometric}
                className="h-14 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 flex flex-col items-center justify-center active:scale-95 transition-all border border-emerald-800/40"
                title="Fingerprint Unlock"
              >
                <Fingerprint className="w-6 h-6" />
                <span className="text-[9px] uppercase font-semibold">Touch</span>
              </button>

              <button
                id="pin-key-0"
                onClick={() => handleKeyPress('0')}
                className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-xl font-bold text-white active:scale-95 transition-all shadow-sm flex items-center justify-center border border-slate-700/50"
              >
                0
              </button>

              {/* Delete / Backspace */}
              <button
                id="pin-key-delete"
                onClick={handleDelete}
                className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center active:scale-95 transition-all border border-slate-700/50"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Forgot PIN / Reset Link */}
            <div className="flex items-center justify-between w-full pt-2 text-xs">
              <button
                onClick={() => {
                  setError('');
                  setIsResetMode(true);
                }}
                className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Forgot PIN?</span>
              </button>

              <span className="text-[11px] text-slate-500 font-mono">
                PIN: {settings.pinCode || '1234'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
