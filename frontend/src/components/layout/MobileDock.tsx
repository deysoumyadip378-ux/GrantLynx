import React from 'react';
import { LayoutDashboard, CheckCircle2, PlusCircle, Database } from 'lucide-react';

interface MobileDockProps {
  activeTab: 'dashboard' | 'create' | 'verify' | 'audit';
  onTabChange: (tab: 'dashboard' | 'create' | 'verify' | 'audit') => void;
}

export const MobileDock: React.FC<MobileDockProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
      <div className="flex items-center justify-around py-2.5 px-3 rounded-2xl bg-midnight-950/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'dashboard' ? 'text-lynx-amber font-semibold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-display font-medium">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('verify')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'verify' ? 'text-lynx-amber font-semibold' : 'text-slate-400'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px] font-display font-medium">Verify</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('create')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'create' ? 'text-lynx-amber font-semibold' : 'text-slate-400'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-display font-medium">Create</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('audit')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'audit' ? 'text-lynx-amber font-semibold' : 'text-slate-400'
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="text-[10px] font-display font-medium">Audit</span>
        </button>
      </div>
    </div>
  );
};

