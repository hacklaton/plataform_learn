import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#090d16] flex text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main page container */}
      <div className="flex-1 flex flex-col pl-68">
        {/* Top bar with server status */}
        <TopBar />

        {/* Main page rendering area */}
        <main className="flex-1 p-6 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
