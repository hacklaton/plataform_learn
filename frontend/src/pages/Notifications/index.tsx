import { useState, useEffect } from 'react';
import { useNotificationsStore } from '../../store/notifications.store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Bell,
  Mail,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Info,
  CheckCheck,
  Send,
  Plus
} from 'lucide-react';

export default function Notifications() {
  const {
    alerts,
    isLoading,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
    addNewAlert
  } = useNotificationsStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  // Alert simulation states
  const [showSimulateForm, setShowSimulateForm] = useState(false);
  const [simTitle, setSimTitle] = useState('');
  const [simDesc, setSimDesc] = useState('');
  const [simLevel, setSimLevel] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('WARNING');
  const [simType, setSimType] = useState<'ATTENDANCE' | 'ACADEMIC' | 'SYSTEM'>('ATTENDANCE');

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Set default selected alert on load
  useEffect(() => {
    if (alerts.length > 0 && !selectedAlert) {
      setSelectedAlert(alerts[0]);
    }
  }, [alerts, selectedAlert]);

  const handleSelectAlert = (alert: any) => {
    setSelectedAlert(alert);
    if (!alert.isRead) {
      markAsRead(alert.id);
    }
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTitle || !simDesc) return;

    addNewAlert({
      title: simTitle,
      description: simDesc,
      level: simLevel,
      type: simType as any,
      studentName: 'Mateo Vasquez'
    });

    setShowSimulateForm(false);
    setSimTitle('');
    setSimDesc('');
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === 'unread') return !a.isRead;
    return true;
  });

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertTriangle className="w-5 h-5 text-rose-450" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getChannelBadge = (status: string | undefined) => {
    switch (status) {
      case 'SENT':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold">ENVIADO</span>;
      case 'PENDING':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-bold">PENDIENTE</span>;
      default:
        return <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold">N/A</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0 flex items-center gap-2">
            Notificaciones y Alertas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centro de notificaciones centralizado. Inspeccione canales de comunicación y estados de entrega.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowSimulateForm(true)} className="py-2 px-4 text-xs font-semibold">
            <Plus className="w-4 h-4 text-indigo-400" />
            Simular Broker Event
          </Button>
          <Button variant="ghost" onClick={markAllAsRead} className="py-2 px-3 text-xs font-semibold">
            <CheckCheck className="w-4 h-4" />
            Marcar todo leído
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-0">
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/30 flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'unread'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                No leídas
              </button>
            </div>

            <div className="divide-y divide-slate-850/60 max-h-[500px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="py-6"><LoadingSpinner /></div>
              ) : filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => handleSelectAlert(alert)}
                    className={`p-4 cursor-pointer transition-colors flex gap-3 text-xs items-start ${
                      selectedAlert?.id === alert.id
                        ? 'bg-indigo-600/5'
                        : 'hover:bg-slate-900/10'
                    } ${!alert.isRead ? 'border-l-2 border-indigo-500' : ''}`}
                  >
                    <div className="mt-0.5 shrink-0">{getAlertIcon(alert.level)}</div>
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <Badge variant={alert.level.toLowerCase() as any} className="text-[9px]">
                          {alert.level}
                        </Badge>
                        <span className="text-[10px] text-slate-500">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className={`font-semibold truncate ${!alert.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {alert.title}
                      </h4>
                      <p className="text-slate-500 truncate">{alert.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-12">No hay notificaciones disponibles.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Detailed context view */}
        <div className="lg:col-span-2">
          {selectedAlert ? (
            <Card className="space-y-6" glow={selectedAlert.level === 'CRITICAL' ? 'rose' : 'none'}>
              {/* Alert head details */}
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedAlert.level.toLowerCase() as any}>{selectedAlert.level}</Badge>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Agente: {selectedAlert.type}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white font-display mt-2">{selectedAlert.title}</h2>
                  <p className="text-xs text-slate-400">
                    Registrado: {new Date(selectedAlert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Context text */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descripción del Incidente</h4>
                <p className="text-sm text-slate-200 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 leading-relaxed">
                  {selectedAlert.description}
                </p>
              </div>

              {/* Delivery channels statuses */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Canales de Notificación Emitidos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      <span>Notificación por Correo (Acudiente)</span>
                    </div>
                    {getChannelBadge(selectedAlert.channels.email)}
                  </div>

                  <div className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Smartphone className="w-4 h-4 text-indigo-400" />
                      <span>Mensaje Push Movil (App Docente)</span>
                    </div>
                    {getChannelBadge(selectedAlert.channels.push)}
                  </div>
                </div>
              </div>

              {/* Recommendation AI action plan */}
              <div className="p-4 bg-indigo-950/15 border border-indigo-500/20 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-indigo-300 font-display flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Plan de Acción Recomendado por Agente AI
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  {selectedAlert.level === 'CRITICAL'
                    ? '1. Agende una reunión presencial urgente con el acudiente.\n2. Involucre al departamento de psicología escolar para revisar el caso.\n3. Repase de manera prioritaria los temas evaluados en tutorías extracurriculares.'
                    : '1. Supervise la entrega de talleres de recuperación asignados.\n2. Monitoree la asistencia en las siguientes 3 sesiones.'}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="h-64 flex items-center justify-center text-slate-500 text-xs">
              Seleccione una alerta para visualizar los detalles y el plan de acción sugerido.
            </Card>
          )}
        </div>
      </div>

      {/* Simulate Broker Event Dialog */}
      {showSimulateForm ? (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 glass-panel relative" glow="primary">
            <h3 className="text-base font-bold text-white font-display mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-450" />
              Simular Broker Event
            </h3>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-2">Título de la Alerta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Abandono Inminente Detectado"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-2">Contenido/Descripción</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ej. El estudiante no asistió y el promedio se desplomó..."
                  value={simDesc}
                  onChange={(e) => setSimDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Urgencia (Level)</label>
                  <select
                    value={simLevel}
                    onChange={(e) => setSimLevel(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl glass-input text-sm"
                  >
                    <option value="INFO">Información</option>
                    <option value="WARNING">Advertencia (Warning)</option>
                    <option value="CRITICAL">Crítica (Critical)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Tipo de Agente</label>
                  <select
                    value={simType}
                    onChange={(e) => setSimType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl glass-input text-sm"
                  >
                    <option value="ATTENDANCE">Percepción (Asistencia)</option>
                    <option value="ACADEMIC">Académico (Notas)</option>
                    <option value="SYSTEM">Sistema (Broker/DB)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowSimulateForm(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Lanzar Evento
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
