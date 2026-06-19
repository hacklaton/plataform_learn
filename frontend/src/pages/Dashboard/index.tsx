import { useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Webcam from 'react-webcam';
import { academicApi } from '../../api/academic.api';
import { notificationsApi } from '../../api/notifications.api';
import { attendanceApi } from '../../api/attendance.api';
import { iaApi } from '../../api/ia.api';
import { userApi, UserListItem } from '../../api/user.api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  Clock,
  DoorOpen,
  Camera,
  Zap,
  Activity,
  VideoOff,
  UserPlus,
  Trash2,
  Search,
  Filter,
  UserCheck,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CHART_DATA = [
  { name: 'Lun', asistencia: 92.4 },
  { name: 'Mar', asistencia: 94.1 },
  { name: 'Mie', asistencia: 89.8 },
  { name: 'Jue', asistencia: 95.3 },
  { name: 'Vie', asistencia: 91.2 },
];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const selectedClassroomId = searchParams.get('classroom');

  // Tab switching state: 'general' or 'users'
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');

  // Webcam states
  const webcamRef = useRef<Webcam>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Register Modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    role: 'STUDENT',
    firstName: '',
    lastName: '',
    department: '',
    enrollmentCode: '',
    grade: '',
    phone: ''
  });
  const [registerError, setRegisterError] = useState<string | null>(null);

  // API Queries
  const { data: classrooms } = useQuery({
    queryKey: ['ia-classrooms'],
    queryFn: () => iaApi.getClassrooms(),
  });

  const { data: dropoutProjections } = useQuery({
    queryKey: ['dropout-projections', selectedClassroomId ?? 'all'],
    queryFn: () => iaApi.getDropoutProjections(selectedClassroomId ?? undefined),
  });

  const selectedClassroom = classrooms?.find((c) => c.id === selectedClassroomId) ?? null;

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => academicApi.getStudents(),
    refetchInterval: 30000,
  });

  const { data: alerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => notificationsApi.getAlerts(),
    refetchInterval: 30000,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => academicApi.getCourses(),
  });

  const { data: biometricLogs } = useQuery({
    queryKey: ['biometric-logs'],
    queryFn: () => attendanceApi.getLiveLogs(),
    refetchInterval: 5000, // Refresh logs every 5s for high fidelity
  });

  // Query for backend users
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userApi.getAllUsers(),
    enabled: activeTab === 'users',
  });

  // Mutations
  const scanMutation = useMutation({
    mutationFn: (base64: string) => attendanceApi.scanFace(base64),
    onSuccess: (data) => {
      setScanResult(data);
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['biometric-logs'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => userApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => userApi.registerUser(data),
    onSuccess: () => {
      setShowAddUserModal(false);
      setRegisterError(null);
      setRegisterForm({
        email: '',
        password: '',
        role: 'STUDENT',
        firstName: '',
        lastName: '',
        department: '',
        enrollmentCode: '',
        grade: '',
        phone: ''
      });
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Error al registrar el usuario';
      setRegisterError(msg);
    }
  });

  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      if (imageSrc) {
        scanMutation.mutate(imageSrc);
      }
    }
  }, [webcamRef, scanMutation]);

  const handleManualMark = async (studentId: string) => {
    await attendanceApi.manuallyMarkAttendance(studentId, 'PRESENT');
    queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    // Map inputs correctly
    const payload: any = {
      email: registerForm.email,
      password: registerForm.password,
      role: registerForm.role,
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
    };

    if (registerForm.role === 'STUDENT') {
      payload.enrollmentCode = registerForm.enrollmentCode || `STU-${Math.floor(100 + Math.random() * 900)}`;
      payload.grade = registerForm.grade || '10A';
    } else if (registerForm.role === 'TEACHER') {
      payload.department = registerForm.department || 'General';
    } else if (registerForm.role === 'GUARDIAN') {
      payload.phone = registerForm.phone;
    }

    registerMutation.mutate(payload);
  };

  if (loadingStudents || loadingAlerts || loadingCourses) {
    return <LoadingSpinner />;
  }

  // Calculate statistics
  const totalStudents = students?.length || 0;
  const avgAttendance = students
    ? Math.round(students.reduce((acc, curr) => acc + curr.attendanceRate, 0) / totalStudents)
    : 0;
  const criticalRiskCount = students?.filter((s) => s.riskStatus === 'CRITICAL').length || 0;
  const coursesCount = courses?.length || 0;

  const recentAlerts = alerts?.slice(0, 3) || [];
  const recentBioLogs = biometricLogs?.slice(0, 5) || [];

  // Filter users list
  const filteredUsers = users?.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0">
            {selectedClassroom ? selectedClassroom.name : 'Panel General'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {selectedClassroom
              ? `Datos filtrados del salón · ${selectedClassroom.courseCode} · ${selectedClassroom.studentCount} alumnos`
              : 'Supervisión automatizada de inasistencias y riesgos mediante agentes inteligentes.'}
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-450 bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          Actualizado: Hace unos instantes
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800/80 gap-6 text-sm">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'general'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-450 hover:text-slate-200'
          }`}
        >
          Vista General
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'users'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-450 hover:text-slate-200'
          }`}
        >
          Gestión de Usuarios y Biometría
        </button>
      </div>

      {activeTab === 'general' ? (
        <>
          {/* Banner de salón seleccionado */}
          {selectedClassroom ? (
            <Card className="flex items-center justify-between flex-wrap gap-4 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/15 rounded-xl text-indigo-300">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{selectedClassroom.name}</h3>
                  <span className="text-[11px] text-slate-500">
                    Asistencia promedio {selectedClassroom.avgAttendance}% · Promedio {selectedClassroom.avgGpa}
                  </span>
                </div>
              </div>
              <Badge variant={selectedClassroom.avgAttendance < 80 ? 'warning' : 'success'}>
                {selectedClassroom.avgAttendance < 80 ? 'Requiere atención' : 'Salón estable'}
              </Badge>
            </Card>
          ) : null}

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Alumnos"
              value={totalStudents}
              icon={Users}
              description="Matriculados en periodo activo"
              trend={{ value: "+2.1%", type: "up" }}
            />
            <StatCard
              title="Asistencia Promedio"
              value={`${avgAttendance}%`}
              icon={CalendarCheck}
              description="Porcentaje semanal global"
              trend={{ value: "-0.5%", type: "down" }}
              glow={avgAttendance < 80 ? "rose" : avgAttendance > 90 ? "emerald" : "none"}
            />
            <StatCard
              title="Casos Críticos"
              value={criticalRiskCount}
              icon={AlertTriangle}
              description="Alumnos con riesgo crítico"
              trend={{ value: criticalRiskCount > 0 ? "Atención" : "Limpio", type: criticalRiskCount > 0 ? "down" : "neutral" }}
              glow={criticalRiskCount > 0 ? "rose" : "none"}
            />
            <StatCard
              title="Materias Activas"
              value={coursesCount}
              icon={BookOpen}
              description="Cursos asignados al docente"
              trend={{ value: "Ok", type: "neutral" }}
            />
          </div>

          {/* Main visual sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance chart */}
            <Card className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-100 font-display">
                  Tendencia de Asistencia Semanal
                </h3>
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  Filtro: {selectedClassroom ? selectedClassroom.name : 'General'}
                </span>
              </div>

              <div className="h-64 w-full text-slate-400 text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" domain={[80, 100]} fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        color: '#f3f4f6',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="asistencia"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#attendanceGlow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Live biometric logs */}
            <Card className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-100 font-display">
                  Monitoreo Facial En Vivo
                </h3>
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  En Vivo
                </span>
              </div>

              <div className="space-y-3">
                {recentBioLogs.length > 0 ? (
                  recentBioLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500'
                              : log.status === 'UNKNOWN'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        ></div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-200 truncate">
                            {log.studentName || 'Rostro No Reconocido'}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            {log.studentCode ? `Código: ${log.studentCode}` : 'Identidad Anónima'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-slate-300">
                          {log.confidence ? `${log.confidence}%` : 'N/A'}
                        </span>
                        <p className="text-[9px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No hay logs de escaneo facial hoy.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Alerts and Academics lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest Active Alerts */}
            <Card className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-100 font-display">
                  Últimas Alertas Emitidas
                </h3>
                <Badge variant="critical">{recentAlerts.filter((a) => !a.isRead).length} Nuevas</Badge>
              </div>

              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.level.toLowerCase() as any}>{alert.level}</Badge>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">
                          {alert.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">{alert.title}</h4>
                      <p className="text-xs text-slate-400">{alert.description}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Course Milestones list */}
            <Card className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-100 font-display">
                  Progreso Curricular de Materias
                </h3>
                <span className="text-xs text-slate-455 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Sincronizado
                </span>
              </div>

              <div className="space-y-4">
                {courses?.slice(0, 3).map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{course.name}</span>
                        <span className="text-slate-500 text-[10px] ml-2">({course.code})</span>
                      </div>
                      <span className="font-bold text-indigo-400">{course.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Proyecciones de deserción del Agente de IA */}
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-450" />
                Riesgo de Deserción (Agente Predictivo)
              </h3>
              <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {selectedClassroom ? selectedClassroom.name : 'Todos los salones'}
              </span>
            </div>

            <div className="space-y-3">
              {dropoutProjections && dropoutProjections.length > 0 ? (
                dropoutProjections.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={proj.currentRisk.toLowerCase() as 'low' | 'moderate' | 'critical'}>
                          {proj.currentRisk}
                        </Badge>
                        <span className="font-semibold text-slate-200">{proj.studentName}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{proj.primaryFactor}</p>
                      <p className="text-[11px] text-indigo-300/80">→ {proj.recommendation}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`font-bold font-mono text-lg ${
                          proj.dropoutProbability >= 70
                            ? 'text-rose-450'
                            : proj.dropoutProbability >= 45
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {proj.dropoutProbability}%
                      </span>
                      <p className="text-[9px] text-slate-500 uppercase">prob. deserción</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">
                  El agente no reporta riesgos de deserción para esta selección.
                </p>
              )}
            </div>
          </Card>
        </>
      ) : (
        /* USER MANAGEMENT & BIOMETRICS TAB VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Webcam Scanner Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden p-0 relative" glow={scanMutation.isPending ? 'primary' : 'none'}>
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/30 flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  Terminal Biométrica
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setCameraActive(!cameraActive)}
                  className="py-1 px-3 text-xs"
                >
                  {cameraActive ? 'Apagar' : 'Encender'}
                </Button>
              </div>

              {/* Camera view */}
              <div className="relative bg-slate-950 aspect-square flex items-center justify-center overflow-hidden">
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
                    <div className="absolute inset-0 border-2 border-indigo-500/20 pointer-events-none flex items-center justify-center">
                      <div className="w-44 h-56 border-2 border-dashed border-indigo-500/40 rounded-[50px] relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#090d16] px-2.5 text-[9px] text-indigo-400 font-semibold tracking-wider uppercase">
                          Alinear Rostro
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2 text-slate-500">
                    <VideoOff className="w-10 h-10 mx-auto opacity-50" />
                    <p className="text-xs">Cámara inactiva.</p>
                  </div>
                )}

                {scanMutation.isPending && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <LoadingSpinner />
                    <span className="text-[10px] text-indigo-400 font-semibold animate-pulse tracking-wider">
                      VERIFICANDO BIOMETRÍA...
                    </span>
                  </div>
                )}
              </div>

              {cameraActive && (
                <div className="p-3 bg-slate-900/20 flex justify-end">
                  <Button variant="primary" onClick={handleCapture} disabled={scanMutation.isPending} className="text-xs">
                    <Zap className="w-3.5 h-3.5 text-white" />
                    Registrar Entrada
                  </Button>
                </div>
              )}
            </Card>

            {/* Scan response alert */}
            {scanResult && (
              <Card
                className={`border ${
                  scanResult.status === 'SUCCESS'
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-rose-950/15 border-rose-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      scanResult.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {scanResult.status === 'SUCCESS' ? <UserCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {scanResult.status === 'SUCCESS' ? 'Reconocimiento Exitoso' : 'Error de Biometría'}
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {scanResult.status === 'SUCCESS'
                        ? `Acceso concedido a: ${scanResult.studentName} (${scanResult.studentCode}) - Confianza: ${scanResult.confidence}%`
                        : 'El rostro escaneado no coincide con ningún registro activo.'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Live biometric logs list */}
            <Card className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Feed de Lecturas Recientes
                </span>
                <Badge variant="info">En vivo</Badge>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {recentBioLogs.length > 0 ? (
                  recentBioLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl space-y-1.5 text-[11px]"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-400">Acceso Escaneado</span>
                        <span className="text-[9px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-200 font-medium">{log.studentName || 'Rostro Desconocido'}</span>
                        <Badge variant={log.status === 'SUCCESS' ? 'success' : 'error'}>
                          {log.status === 'SUCCESS' ? 'Verificado' : 'Desconocido'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No hay logs capturados.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: User Directory and Filters */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="space-y-4">
              {/* Directory header and search */}
              <div className="flex flex-wrap justify-between items-center gap-3">
                <h3 className="text-base font-bold text-slate-100 font-display">
                  Directorio de Usuarios de la App
                </h3>
                <Button variant="primary" onClick={() => setShowAddUserModal(true)} className="text-xs py-1.5 px-3">
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Nuevo Usuario
                </Button>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500/80 placeholder-slate-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500/80"
                  >
                    <option value="ALL">Todos los Roles</option>
                    <option value="ADMIN">Administradores</option>
                    <option value="TEACHER">Docentes</option>
                    <option value="STUDENT">Estudiantes</option>
                    <option value="GUARDIAN">Tutores</option>
                  </select>
                </div>
              </div>

              {/* Users table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-500 font-semibold">
                      <th className="pb-3 pl-2">Nombre</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Rol</th>
                      <th className="pb-3">Código/Depto</th>
                      <th className="pb-3">Estado</th>
                      <th className="pb-3 pr-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center">
                          <LoadingSpinner />
                        </td>
                      </tr>
                    ) : filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((u: UserListItem) => (
                        <tr key={u.id} className="text-slate-300 hover:bg-slate-900/10">
                          <td className="py-3 pl-2 font-medium text-slate-250">{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <Badge variant={u.role.toLowerCase() as any}>{u.role}</Badge>
                          </td>
                          <td className="font-mono text-slate-400">{u.code}</td>
                          <td>
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.isActive ? 'bg-emerald-400' : 'bg-slate-600'
                                }`}
                              ></span>
                              {u.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="pr-2 text-right">
                            <div className="flex gap-2 justify-end">
                              {u.role === 'STUDENT' && u.isActive && (
                                <Button
                                  variant="secondary"
                                  onClick={() => handleManualMark(u.id)}
                                  className="py-0.5 px-2 text-[10px]"
                                >
                                  Presente
                                </Button>
                              )}
                              {u.isActive && (
                                <button
                                  onClick={() => deactivateMutation.mutate(u.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                                  title="Desactivar Usuario"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No se encontraron usuarios coincidentes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* QUICK ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md border border-slate-800/80 bg-slate-950 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-slate-450 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white font-display">Registrar Nuevo Usuario</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Crea una cuenta en la aplicación. Podrá ser reconocida por la cámara.
              </p>
            </div>

            {registerError && (
              <div className="p-2.5 bg-rose-950/15 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-semibold uppercase">Nombre</label>
                  <input
                    type="text"
                    required
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-1.5 px-3 focus:outline-hidden focus:border-indigo-500/80"
                    placeholder="Ej. Sofía"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-semibold uppercase">Apellido</label>
                  <input
                    type="text"
                    required
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-1.5 px-3 focus:outline-hidden focus:border-indigo-500/80"
                    placeholder="Ej. Gómez"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-semibold uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-1.5 px-3 focus:outline-hidden focus:border-indigo-500/80"
                  placeholder="sofia.gomez@hacklaton.dev"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-semibold uppercase">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-1.5 px-3 focus:outline-hidden focus:border-indigo-500/80"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-semibold uppercase">Rol del Usuario</label>
                  <select
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-1.5 px-3 focus:outline-hidden focus:border-indigo-500/80"
                  >
                    <option value="STUDENT">Estudiante</option>
                    <option value="TEACHER">Docente</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="GUARDIAN">Tutor/Familiar</option>
                  </select>
                </div>
              </div>

              {/* Conditional fields based on role */}
              {registerForm.role === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-semibold uppercase">Código de Matrícula</label>
                    <input
                      type="text"
                      value={registerForm.enrollmentCode}
                      onChange={(e) => setRegisterForm({ ...registerForm, enrollmentCode: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-1.5 px-3 focus:outline-hidden focus:border-indigo-500/80"
                      placeholder="Ej. STU-001"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-semibold uppercase">Grado / Salón</label>
                    <input
                      type="text"
                      value={registerForm.grade}
                      onChange={(e) => setRegisterForm({ ...registerForm, grade: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-1.5 px-3 focus:outline-hidden focus:border-indigo-500/80"
                      placeholder="Ej. 10A"
                    />
                  </div>
                </div>
              )}

              {registerForm.role === 'TEACHER' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-semibold uppercase">Departamento</label>
                  <input
                    type="text"
                    value={registerForm.department}
                    onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-1.5 px-3 focus:outline-hidden focus:border-indigo-500/80"
                    placeholder="Ej. Matemáticas, Computación"
                  />
                </div>
              )}

              {registerForm.role === 'GUARDIAN' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-semibold uppercase">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-1.5 px-3 focus:outline-hidden focus:border-indigo-500/80"
                    placeholder="Ej. +573123456789"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2.5">
                <Button type="button" variant="secondary" onClick={() => setShowAddUserModal(false)} className="text-xs">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={registerMutation.isPending} className="text-xs">
                  {registerMutation.isPending ? 'Registrando...' : 'Registrar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
