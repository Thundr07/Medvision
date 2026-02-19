import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Stethoscope, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'radiologist' | 'physician' | 'admin'>('radiologist');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would authenticate against the backend
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl mb-4 shadow-lg shadow-indigo-500/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MedVision AI</h1>
          <p className="text-zinc-500 text-sm mt-1">Secure Medical Imaging Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'radiologist', icon: Activity, label: 'Radiologist' },
                { id: 'physician', icon: Stethoscope, label: 'Physician' },
                { id: 'admin', icon: ShieldCheck, label: 'Admin' },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                    selectedRole === role.id
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 ring-1 ring-indigo-500"
                      : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  )}
                >
                  <role.icon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Username</label>
              <input 
                type="text" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                placeholder="Enter your username"
                defaultValue="dr_chen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                placeholder="••••••••"
                defaultValue="password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-600">
            Protected by MedVision Secure Access. <br/>
            Unauthorized access is prohibited and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
