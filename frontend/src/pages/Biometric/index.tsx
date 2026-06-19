import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Camera,
  VideoOff,
  UserCheck,
  Zap,
  Activity,
  History,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function Biometric() {
  const queryClient = useQueryClient();
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [scanResult, setScanResult] = useState<any>(null);

  // Indicators quality mocks
  const [lighting, setLighting] = useState<'GOOD' | 'LOW'>('GOOD');
  const [focus, setFocus] = useState<'SHARP' | 'BLURRY'>('SHARP');

  // Fetch attendees list and biometric logs
  const { data: records, isLoading: loadingRecords } = useQuery({
    queryKey: ['attendance-records'],
    queryFn: () => attendanceApi.getAttendanceRecords(),
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['biometric-logs'],
    queryFn: () => attendanceApi.getLiveLogs(),
  });

  // Face scanning mutation
  const scanMutation = useMutation({
    mutationFn: (base64: string) => attendanceApi.scanFace(base64),
    onSuccess: (data) => {
      setScanResult(data);
      // Re-fetch data lists
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['biometric-logs'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });

      // Change indicators randomly for realism
      setLighting(Math.random() > 0.2 ? 'GOOD' : 'LOW');
      setFocus(Math.random() > 0.1 ? 'SHARP' : 'BLURRY');
    },
  });

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      if (imageSrc) {
        scanMutation.mutate(imageSrc);
      }
    }
  }, [webcamRef, scanMutation]);

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    setImgSrc(null);
    setScanResult(null);
  };

  const handleManualMark = async (studentId: string) => {
    await attendanceApi.manuallyMarkAttendance(studentId, 'PRESENT');
    queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
    queryClient.invalidateQueries({ queryKey: ['students'] });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0">
          Percepción Biométrica
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Escaneo facial en tiempo real para registro de asistencia libre de fraudes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera panel column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden p-0 relative" glow={scanMutation.isPending ? 'primary' : 'none'}>
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/30 flex justify-between items-center">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Camera className="w-4 h-4 text-indigo-400" />
                Cámara de Reconocimiento
              </span>
              <Button variant="secondary" onClick={toggleCamera} className="py-1 px-3 text-xs">
                {cameraActive ? 'Apagar Cámara' : 'Encender Cámara'}
              </Button>
            </div>

            {/* Camera View */}
            <div className="relative bg-slate-950 aspect-video flex items-center justify-center">
              {cameraActive ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'user' }}
                    className="w-full h-full object-cover"
                  />
                  {/* Face outline grid overlay */}
                  <div className="absolute inset-0 border-[2px] border-indigo-500/20 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-72 border-2 border-dashed border-indigo-500/50 rounded-[60px] relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#090d16] px-3 text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
                        Alinear Rostro
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2 text-slate-500">
                  <VideoOff className="w-12 h-12 mx-auto opacity-50" />
                  <p className="text-sm">La cámara del dispositivo está inactiva.</p>
                </div>
              )}

              {scanMutation.isPending ? (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <LoadingSpinner />
                  <span className="text-xs text-indigo-400 font-semibold animate-pulse">
                    ANALIZANDO RASGOS FACIALES...
                  </span>
                </div>
              ) : null}
            </div>

            {cameraActive ? (
              <div className="p-4 bg-slate-900/20 flex gap-4 justify-between items-center">
                <div className="flex gap-4 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Activity className={`w-3.5 h-3.5 ${lighting === 'GOOD' ? 'text-emerald-400' : 'text-amber-400'}`} />
                    Iluminación: <strong className="text-slate-200">{lighting}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Activity className={`w-3.5 h-3.5 ${focus === 'SHARP' ? 'text-emerald-400' : 'text-amber-400'}`} />
                    Enfoque: <strong className="text-slate-200">{focus}</strong>
                  </span>
                </div>
                <Button variant="primary" onClick={capture} disabled={scanMutation.isPending}>
                  <Zap className="w-4 h-4 text-white" />
                  Escanear Rostro
                </Button>
              </div>
            ) : null}
          </Card>

          {/* Recognition Scan Result Banner */}
          {scanResult ? (
            <Card
              className={`border ${
                scanResult.status === 'SUCCESS'
                  ? 'bg-emerald-950/15 border-emerald-500/30'
                  : 'bg-rose-950/15 border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    scanResult.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-450'
                  }`}
                >
                  {scanResult.status === 'SUCCESS' ? (
                    <UserCheck className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">
                    {scanResult.status === 'SUCCESS' ? 'Rostro Identificado' : 'Rostro Desconocido'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {scanResult.status === 'SUCCESS'
                      ? `Estudiante ${scanResult.studentName} (${scanResult.studentCode}) marcado Presente con ${scanResult.confidence}% confianza.`
                      : 'La red neuronal no pudo asociar este rostro con ningún registro académico activo.'}
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Live attendance log per session */}
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <History className="w-4 h-4 text-indigo-400" />
                Asistencia de la Sesión
              </span>
              <Badge variant="info">Sesión de Hoy</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-450 font-semibold">
                    <th className="pb-3 pl-2">Estudiante</th>
                    <th className="pb-3">Código</th>
                    <th className="pb-3">Hora de Registro</th>
                    <th className="pb-3">Método</th>
                    <th className="pb-3 pr-2 text-right">Confianza</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {loadingRecords ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : records && records.length > 0 ? (
                    records.map((rec) => (
                      <tr key={rec.id} className="text-slate-300 hover:bg-slate-900/20">
                        <td className="py-3 pl-2 font-medium text-slate-200">{rec.studentName}</td>
                        <td>{rec.studentCode}</td>
                        <td>{new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <Badge variant={rec.method === 'BIOMETRIC' ? 'success' : 'info'}>
                            {rec.method}
                          </Badge>
                        </td>
                        <td className="pr-2 text-right font-mono font-semibold text-slate-400">
                          {rec.confidence ? `${rec.confidence}%` : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No hay alumnos registrados en la sesión actual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Live scanner feed logs column */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Feed en Vivo de Percepción
            </h3>
            <p className="text-xs text-slate-500">
              Historial bruto de lecturas de la red neuronal en el punto de acceso.
            </p>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {loadingLogs ? (
                <LoadingSpinner />
              ) : logs && logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">Escaneo facial</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        ></span>
                        <span className="text-slate-200">
                          {log.status === 'SUCCESS' ? log.studentName : 'No identificado'}
                        </span>
                      </div>
                      <Badge variant={log.status === 'SUCCESS' ? 'success' : 'error'}>
                        {log.status}
                      </Badge>
                    </div>

                    {log.confidence ? (
                      <div className="w-full flex items-center gap-2 text-[10px] text-slate-500">
                        <span>Precisión:</span>
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${log.confidence}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-slate-400">{log.confidence}%</span>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No hay lecturas disponibles.</p>
              )}
            </div>
          </Card>

          {/* Quick actions for demo */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Controles de Pruebas
            </h3>
            <p className="text-xs text-slate-500">
              Registra manualmente la asistencia de estudiantes para simular inasistencias críticas.
            </p>

            <div className="space-y-2">
              <Button
                variant="secondary"
                onClick={() => handleManualMark('std-3')}
                className="w-full justify-start text-xs"
              >
                Marcar a: Camila Torres
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleManualMark('std-4')}
                className="w-full justify-start text-xs"
              >
                Marcar a: Mateo Vasquez
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleManualMark('std-7')}
                className="w-full justify-start text-xs"
              >
                Marcar a: Lucía Pineda
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
