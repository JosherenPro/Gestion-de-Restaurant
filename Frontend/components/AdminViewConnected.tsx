import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Users, Utensils, Table as TableIcon, FileText, Settings, TrendingUp, DollarSign, ShoppingBag, Plus, Loader, RefreshCcw, LogOut, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, Button } from './UI';
import { apiService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../mockData';

const COLORS = ['#FC8A06', '#03081F', '#10B981', '#3B82F6', '#F59E0B'];

export const AdminViewConnected: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'MENU' | 'STAFF' | 'TABLES'>('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [stats, setStats] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [plats, setPlats] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [token, currentView]);

  const loadData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      if (currentView === 'DASHBOARD') {
        const [statsData, dashboardData] = await Promise.all([
          apiService.getStatsGlobal(token),
          apiService.getDashboard(token)
        ]);
        setStats(statsData);
        setDashboard(dashboardData);
      } else if (currentView === 'MENU') {
        const platsData = await apiService.getPlats(token);
        setPlats(platsData);
      } else if (currentView === 'STAFF') {
        const personnelData = await apiService.getPersonnel(token);
        setPersonnel(personnelData);
      } else if (currentView === 'TABLES') {
        const tablesData = await apiService.getTables(token);
        setTables(tablesData);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats && !plats.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#FC8A06] mx-auto" />
          <p className="mt-4 text-gray-500">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="w-72 bg-[#03081F] text-white hidden md:flex flex-col p-8 sticky top-0 h-screen shadow-2xl z-50">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-[#FC8A06] rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-[#FC8A06]/20">
            R!
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter">RestoPro</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Administration</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', id: 'DASHBOARD' },
            { icon: Utensils, label: 'Gestion Menu', id: 'MENU' },
            { icon: Users, label: 'Équipe & Staff', id: 'STAFF' },
            { icon: TableIcon, label: 'Plan de Salle', id: 'TABLES' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentView(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                currentView === item.id 
                  ? 'bg-[#FC8A06] text-white shadow-xl shadow-[#FC8A06]/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-white' : 'group-hover:text-[#FC8A06]'} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10 space-y-4">
          {user && (
            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 bg-[#FC8A06] rounded-xl flex items-center justify-center font-bold text-white">
                {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold">{user.prenom} {user.nom}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">{user.role}</span>
              </div>
            </div>
          )}
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-5 py-4 text-gray-500 hover:text-white transition-all rounded-2xl hover:bg-white/5"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#03081F] tracking-tight">
              {currentView === 'DASHBOARD' ? 'Dashboard' : 
               currentView === 'MENU' ? 'Catalogue Menu' : 
               currentView === 'STAFF' ? 'Équipe' : 'Tables'}
            </h1>
            <p className="text-gray-400 font-medium mt-1">Gérez votre établissement en toute simplicité.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={loadData}
              className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCcw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {currentView === 'DASHBOARD' && stats && (
          <div className="space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  label: 'Chiffre d\'affaires', 
                  value: `€${formatPrice(stats.chiffre_affaires_total || 0)}`, 
                  icon: DollarSign, 
                  color: 'bg-green-100 text-green-600'
                },
                { 
                  label: 'Commandes totales', 
                  value: stats.nombre_commandes || 0, 
                  icon: ShoppingBag, 
                  color: 'bg-blue-100 text-blue-600'
                },
                { 
                  label: 'Note moyenne', 
                  value: `${(stats.note_moyenne || 0).toFixed(1)}/5`, 
                  icon: TrendingUp, 
                  color: 'bg-orange-100 text-orange-600'
                },
                { 
                  label: 'Clients', 
                  value: stats.nombre_clients || 0, 
                  icon: Users, 
                  color: 'bg-purple-100 text-purple-600'
                },
              ].map((stat, idx) => (
                <Card key={idx} className="p-8 border-none bg-white shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-[1.2rem] ${stat.color} transition-transform group-hover:scale-110`}>
                      <stat.icon size={24} />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black text-[#03081F] mt-2">{stat.value}</h3>
                </Card>
              ))}
            </div>

            {/* Top Plats */}
            {dashboard?.top_plats && dashboard.top_plats.length > 0 && (
              <Card className="p-10 bg-white border-none shadow-sm rounded-[2.5rem]">
                <h3 className="text-xl font-black text-[#03081F] mb-8">Meilleures Ventes</h3>
                <div className="space-y-4">
                  {dashboard.top_plats.slice(0, 5).map((plat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#FC8A06] rounded-xl flex items-center justify-center font-black text-white">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-[#03081F]">{plat.nom_plat}</p>
                          <p className="text-xs text-gray-400">{plat.quantite_vendue} vendus</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#FC8A06]">€{formatPrice(plat.chiffre_affaires)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {currentView === 'MENU' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Plat</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Catégorie</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Prix</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {plats.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img 
                              src={`https://gestion-de-restaurant.onrender.com${item.image_url}`} 
                              className="w-full h-full object-cover" 
                              alt={item.nom}
                            />
                          ) : (
                            <Utensils className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#03081F]">{item.nom}</p>
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg uppercase">
                        {item.categorie?.nom || 'Autre'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-[#03081F]">€{formatPrice(item.prix)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.disponible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-[10px] font-black uppercase ${item.disponible ? 'text-green-600' : 'text-red-600'}`}>
                          {item.disponible ? 'En stock' : 'Rupture'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentView === 'STAFF' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personnel.map(member => (
              <Card key={member.id} className="p-8 border-none bg-white shadow-sm hover:shadow-xl transition-all rounded-[2rem]">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-[#FC8A06] rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    {member.prenom?.charAt(0)}{member.nom?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-lg text-[#03081F] tracking-tight">
                      {member.prenom} {member.nom}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FC8A06]">
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold uppercase">Email</span>
                    <span className="font-bold text-[#03081F]">{member.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold uppercase">Statut</span>
                    <span className={`px-3 py-1 rounded-full font-black text-[9px] uppercase ${
                      member.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {member.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {currentView === 'TABLES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map(table => (
              <Card key={table.id} className="p-8 border-none bg-white shadow-sm hover:shadow-xl transition-all rounded-[2rem]">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-[#03081F] rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg">
                    {table.numero_table}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    table.statut === 'LIBRE' ? 'bg-green-100 text-green-700' :
                    table.statut === 'OCCUPEE' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {table.statut}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Capacité</span>
                    <span className="font-bold text-[#03081F]">{table.capacite} personnes</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
