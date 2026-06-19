import { useEffect, useState } from 'react';
import { authApi } from '../../api/auth.api';
import { Activity, Database, Server, RefreshCw } from 'lucide-react';

export default function TopBar() {
  const [health, setHealth] = useState<{ status: string; database: string; redis: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const data = await authApi.checkHealth();
      setHealth(data);
    } catch (e) {
      setHealth({ status: 'Unhealthy', database: 'Disconnected', redis: 'Disconnected' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === 'Healthy';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/20 backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-slate-100 m-0 tracking-wide font-display">
          Centro de Control Inteligente
        </h2>
      </div>

      {/* Health status indicator bar */}
      <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800/50 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300">
        <span className="flex items-center gap-1.5">
          <Server className={`w-3.5 h-3.5 ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`} />
          API: <span className={isHealthy ? 'text-emerald-400' : 'text-rose-400'}>{health?.status || 'Unknown'}</span>
        </span>
        <span className="w-1.5 h-1.5 bg-slate-700/80 rounded-full"></span>
        <span className="flex items-center gap-1.5">
          <Database className={`w-3.5 h-3.5 ${health?.database === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}`} />
          Postgres: <span className={health?.database === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}>{health?.database === 'Connected' ? 'OK' : 'OFFLINE'}</span>
        </span>
        <span className="w-1.5 h-1.5 bg-slate-700/80 rounded-full"></span>
        <span className="flex items-center gap-1.5">
          <Activity className={`w-3.5 h-3.5 ${health?.redis === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}`} />
          Redis: <span className={health?.redis === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}>{health?.redis === 'Connected' ? 'OK' : 'OFFLINE'}</span>
        </span>

        <button
          onClick={fetchHealth}
          disabled={isLoading}
          className="ml-2 p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          title="Forzar revalidación de salud"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
