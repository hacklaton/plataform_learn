import { useState, FormEvent } from 'react';
import { useAuthStore } from '../../store/auth.store';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ShieldAlert, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email);
  };

  return (
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <Card glow="primary" className="w-full max-w-md p-8 glass-panel z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3.5 bg-indigo-600 rounded-2xl glow-primary flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Aegis Academia
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Plataforma Integral de Gestión Educativa con Agentes AI
          </p>
        </div>

        {error ? (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="profesor@hacklaton.edu"
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center text-slate-400 gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-700 bg-slate-900/60 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Recordarme</span>
            </label>
            <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium">
              ¿Olvidó su contraseña?
            </a>
          </div>

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full py-3.5 text-base">
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>La cuenta se sincronizará automáticamente con la base de datos de PostgreSQL y Redis.</p>
        </div>
      </Card>
    </div>
  );
}
