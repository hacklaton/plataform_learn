import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useMutation } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance.api';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Camera, CheckCircle, XCircle, ScanFace, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  /** If provided, admin mode — registers for a specific user ID */
  targetUserId?: string;
  targetUserName?: string;
}

export default function BiometricEnrollModal({ onClose, targetUserId, targetUserName }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [step, setStep] = useState<'camera' | 'preview' | 'done'>('camera');

  const registerMutation = useMutation({
    mutationFn: (imageBase64: string) =>
      targetUserId
        ? attendanceApi.registerFaceForUser(targetUserId, imageBase64)
        : attendanceApi.registerMyFace(imageBase64),
    onSuccess: () => setStep('done'),
  });

  const capture = useCallback(() => {
    const img = webcamRef.current?.getScreenshot();
    if (img) {
      setCaptured(img);
      setStep('preview');
    }
  }, []);

  const confirm = () => {
    if (captured) registerMutation.mutate(captured);
  };

  const retake = () => {
    setCaptured(null);
    setStep('camera');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d1424] border border-slate-700/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <ScanFace className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {targetUserName ? `Registrar rostro de ${targetUserName}` : 'Registrar mi Rostro'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Este será tu patrón biométrico para marcar asistencia.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {step === 'camera' && (
            <>
              <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.6}
                  videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                  className="w-full h-full object-cover"
                />
                {/* Oval face guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-52 border-2 border-dashed border-indigo-400/60 rounded-[50%] shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Centra tu rostro dentro del óvalo y mantente quieto.
              </p>
              <Button variant="primary" onClick={capture} className="w-full">
                <Camera className="w-4 h-4" />
                Capturar Rostro
              </Button>
            </>
          )}

          {step === 'preview' && captured && (
            <>
              <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-950">
                <img src={captured} alt="Captured face" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-xl pointer-events-none" />
              </div>
              <p className="text-xs text-slate-400 text-center">
                ¿El rostro se ve bien? Confirma para guardarlo como tu referencia biométrica.
              </p>
              {registerMutation.isPending ? (
                <div className="flex items-center justify-center gap-3 py-3">
                  <LoadingSpinner />
                  <span className="text-xs text-indigo-400 animate-pulse">Guardando datos biométricos…</span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={retake} className="flex-1">
                    <Camera className="w-4 h-4" />
                    Retomar
                  </Button>
                  <Button variant="primary" onClick={confirm} className="flex-1">
                    <CheckCircle className="w-4 h-4" />
                    Confirmar
                  </Button>
                </div>
              )}
              {registerMutation.isError && (
                <p className="text-xs text-rose-400 text-center flex items-center gap-1 justify-center">
                  <XCircle className="w-4 h-4" />
                  Error al guardar. Intenta de nuevo.
                </p>
              )}
            </>
          )}

          {step === 'done' && (
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">¡Rostro Registrado!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tu patrón biométrico fue guardado. A partir de ahora, la cámara te identificará automáticamente.
                </p>
              </div>
              <Button variant="primary" onClick={onClose} className="w-full">
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
