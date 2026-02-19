import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Files, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Activity,
  Menu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { MOCK_USERS } from '../../lib/types';

export default function Layout() {
  const navigate = useNavigate();
  // Mock logged in user
  const user = MOCK_USERS[0]; 

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">MedVision AI</h1>
            <p className="text-xs text-zinc-500 font-mono">v2.4.0-beta</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink 
            to="/" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              isActive ? "bg-indigo-600/10 text-indigo-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/cases" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              isActive ? "bg-indigo-600/10 text-indigo-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
            )}
          >
            <Files className="w-5 h-5" />
            Patient Cases
          </NavLink>
          <div className="pt-4 mt-4 border-t border-zinc-800">
            <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">System</p>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-indigo-600/10 text-indigo-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              )}
            >
              <Settings className="w-5 h-5" />
              Settings
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate capitalize">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-zinc-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-950 relative">
        <Outlet />
      </main>
    </div>
  );
}
