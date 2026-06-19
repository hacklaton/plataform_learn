export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-indigo-500/40 animate-spin"></div>
      </div>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Sincronizando con Agentes...
      </span>
    </div>
  );
}
