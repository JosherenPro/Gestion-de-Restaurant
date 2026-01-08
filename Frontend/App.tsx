

import React, { useState } from 'react';
import { UserRole } from './types';
import { ClientView } from './components/ClientView';
import { ServerView } from './components/ServerView';
import { ChefView } from './components/ChefView';
import { AdminView } from './components/AdminView';
import { User, ShieldCheck, Soup, Monitor, Tablet } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);

  const renderView = () => {
    switch (role) {
      case UserRole.CLIENT: return <ClientView />;
      case UserRole.SERVEUR: return <ServerView />;
      case UserRole.CUISINIER: return <ChefView />;
      case UserRole.GERANT: return <AdminView />;
      default: return <ClientView />;
    }
  };

  return (
    <AuthProvider>
      <div className="relative font-sans antialiased text-[#03081F] selection:bg-[#FC8A06] selection:text-white">
      {/* Role Switcher Floating for Demo - Better design */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 z-[100]">
        <div className="group relative">
          <button className="flex items-center gap-3 bg-[#03081F] text-white px-6 py-4 rounded-3xl shadow-2xl hover:bg-[#FC8A06] transition-all border-2 border-white/10">
            <Monitor className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Choisir un Rôle</span>
          </button>
          
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 mb-4 opacity-0 scale-90 translate-y-4 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 bg-white p-3 rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col gap-1 w-64">
            <div className="px-4 py-2 border-b border-gray-50 mb-2">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accès simulateur</p>
            </div>
            {[
              { role: UserRole.CLIENT, label: 'Client (Mobile)', icon: Tablet },
              { role: UserRole.SERVEUR, label: 'Équipe Service', icon: User },
              { role: UserRole.CUISINIER, label: 'Équipe Cuisine', icon: Soup },
              { role: UserRole.GERANT, label: 'Dashboard Gérant', icon: ShieldCheck },
            ].map((item) => (
              <button 
                key={item.role}
                onClick={() => setRole(item.role)} 
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${role === item.role ? 'bg-[#FC8A06] text-white shadow-lg shadow-[#FC8A06]/20' : 'text-gray-500 hover:bg-gray-50 hover:text-[#03081F]'}`}
              >
                <item.icon size={18} className={role === item.role ? 'text-white' : 'text-[#FC8A06]'} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main View Container */}
      <div className="min-h-screen transition-all duration-500">
        {renderView()}
      </div>
    </div>
    </AuthProvider>
  );
};

export default App;

