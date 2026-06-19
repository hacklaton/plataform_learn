import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationsStore } from '../../store/notifications.store';
import {
  LayoutDashboard,
  Video,
  GraduationCap,
  TrendingUp,
  Bell,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Control Biométrico', path: '/attendance', icon: Video },
    { name: 'Gestión Académica', path: '/academic', icon: GraduationCap },
    { name: 'Análisis Predictivo', path: '/analytics', icon: TrendingUp },
    { name: 'Notificaciones', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <aside className="w-68 h-screen glass-panel fixed left-0 top-0 flex flex-col justify-between py-6 px-4 z-40 border-r border-slate-800">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 bg-indigo-600 rounded-xl glow-primary flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">
              Aegis <span className="text-indigo-400">Academia</span>
            </h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
              AI Multi-Agent
            </span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border-l-4 border-indigo-500 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="text-[14px]">{item.name}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full ring-2 ring-rose-500/20 animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info / Logout */}
      <div className="flex flex-col gap-4">
        <div className="p-3.5 bg-slate-800/20 border border-slate-800/40 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
            {user?.name?.substring(0, 2) || 'PR'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-200 truncate">
              {user?.name || 'Profesor Demo'}
            </h4>
            <span className="text-[11px] text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {user?.role || 'TEACHER'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 transition-all duration-200 text-[14px]"
        >
          <LogOut className="w-5 h-5 text-slate-400 hover:text-rose-400" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
