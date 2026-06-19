import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationsStore } from '../../store/notifications.store';
import { iaApi } from '../../api/ia.api';
import { UserRole } from '../../api/auth.api';
import {
  LayoutDashboard,
  Video,
  GraduationCap,
  TrendingUp,
  Bell,
  LogOut,
  ShieldAlert,
  ChevronDown,
  DoorOpen,
  Sparkles,
  Lightbulb,
  BookOpen,
  Users,
  UserCog,
  CalendarDays,
  LucideIcon,
} from 'lucide-react';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);

  const [isSalonesOpen, setIsSalonesOpen] = useState(true);

  const role: UserRole = user?.role ?? 'STUDENT';
  const isAdmin = role === 'ADMIN';
  const isTeacher = role === 'TEACHER';
  const isStudent = role === 'STUDENT';

  // El dropdown de salones aplica a docentes (y admin, para pruebas locales)
  const showSalones = isTeacher || isAdmin;

  const { data: classrooms } = useQuery({
    queryKey: ['ia-classrooms'],
    queryFn: () => iaApi.getClassrooms(),
    enabled: showSalones,
  });

  // --- Construcción del menú según rol (ADMIN ve todo) ---
  const teacherItems: MenuItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Planificación IA', path: '/teacher', icon: Sparkles },
    { name: 'Análisis Predictivo', path: '/analytics', icon: TrendingUp },
    { name: 'Gestión Académica', path: '/academic', icon: GraduationCap },
    { name: 'Control Biométrico', path: '/attendance', icon: Video },
    { name: 'Asistencia Mensual', path: '/attendance/monthly', icon: CalendarDays },
  ];

  const studentItems: MenuItem[] = [
    { name: 'Mi Académico e Historial', path: '/student/academic', icon: BookOpen },
    { name: 'Predicción de Rutina', path: '/student/routine', icon: Sparkles },
    { name: 'Refuerzo Inteligente', path: '/student/reinforcement', icon: Lightbulb },
    { name: 'Mi Asistencia', path: '/student/attendance', icon: CalendarDays },
  ];

  // CRUDs administrativos (solo ADMIN)
  const adminItems: MenuItem[] = [
    { name: 'Alumnos (CRUD)', path: '/admin/students', icon: Users },
    { name: 'Profesores (CRUD)', path: '/admin/teachers', icon: UserCog },
    { name: 'Salones (CRUD)', path: '/admin/classrooms', icon: DoorOpen },
  ];

  const commonItems: MenuItem[] = [
    { name: 'Notificaciones', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  let primaryItems: MenuItem[] = [];
  if (isAdmin) primaryItems = [...teacherItems, ...studentItems, ...adminItems];
  else if (isTeacher) primaryItems = teacherItems;
  else if (isStudent) primaryItems = studentItems;

  const isSalonActive = (id: string) =>
    location.pathname === '/dashboard' && new URLSearchParams(location.search).get('classroom') === id;

  const renderItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = location.pathname.startsWith(item.path) && !location.search.includes('classroom');
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
  };

  return (
    <aside className="w-68 h-screen glass-panel fixed left-0 top-0 flex flex-col justify-between py-6 px-4 z-40 border-r border-slate-800">
      <div className="flex flex-col gap-8 overflow-y-auto">
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
          {/* Dashboard + dropdown de salones (docente / admin) */}
          {primaryItems
            .filter((i) => i.path === '/dashboard')
            .map((item) => (
              <div key={item.path}>
                {renderItem(item)}
                {showSalones && classrooms && classrooms.length > 0 ? (
                  <div className="mt-1">
                    <button
                      onClick={() => setIsSalonesOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <DoorOpen className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
                        <span className="text-[13px]">Mis Salones</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isSalonesOpen ? 'rotate-180 text-indigo-400' : 'text-slate-500'
                        }`}
                      />
                    </button>

                    {isSalonesOpen ? (
                      <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-slate-700/60 pl-3">
                        {classrooms.map((cls) => {
                          const active = isSalonActive(cls.id);
                          return (
                            <Link
                              key={cls.id}
                              to={`/dashboard?classroom=${cls.id}`}
                              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                                active
                                  ? 'bg-indigo-600/10 text-indigo-300 font-medium'
                                  : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300'
                              }`}
                            >
                              <span className="text-[12px] truncate">{cls.name}</span>
                              <span className="text-[10px] text-slate-600 shrink-0">{cls.studentCount}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}

          {/* Resto de módulos del rol */}
          {primaryItems.filter((i) => i.path !== '/dashboard').map(renderItem)}

          {/* Separador + comunes */}
          {commonItems.length > 0 ? (
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-col gap-1.5">
              {commonItems.map(renderItem)}
            </div>
          ) : null}
        </nav>
      </div>

      {/* User Info / Logout */}
      <div className="flex flex-col gap-4">
        <div className="p-3.5 bg-slate-800/20 border border-slate-800/40 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-200 truncate">
              {user?.name || 'Usuario'}
            </h4>
            <span className="text-[11px] text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {role}
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
