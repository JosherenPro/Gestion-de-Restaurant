
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Users, Utensils, Table as TableIcon, FileText, Settings, TrendingUp, Coins, ShoppingBag, Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Card, Button, Modal } from './UI';
import { MENU_ITEMS, STAFF, TABLES, formatMenuItem, formatPrice } from '../mockData';
import { apiService } from '../services/api.service';
import { MenuItem, Stats, TopPlat, RevenueByPeriod } from '../types';

const DATA = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3000 },
  { name: 'Mer', sales: 5000 },
  { name: 'Jeu', sales: 2780 },
  { name: 'Ven', sales: 4890 },
  { name: 'Sam', sales: 6390 },
  { name: 'Dim', sales: 3490 },
];

export const AdminView: React.FC = () => {
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'MENU' | 'STAFF' | 'TABLES'>('DASHBOARD');

  // State for API data
  const [stats, setStats] = useState<Stats | null>(null);
  const [topPlats, setTopPlats] = useState<TopPlat[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueByPeriod[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token') || '';

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = getToken();

        // Fetch all data in parallel
        const [statsData, topPlatsData, revenueDataResponse, menusData, staffData, tablesData] = await Promise.all([
          apiService.getStatsGlobal(token).catch(() => null),
          apiService.getTopPlats(token, 4).catch(() => []),
          apiService.getRevenueStats(token).catch(() => []),
          apiService.getPlats(token).catch(() => []),
          apiService.getPersonnelWithDetails(token).catch(() => []),
          apiService.getTables(token).catch(() => [])
        ]);

        setStats(statsData);
        setTopPlats(topPlatsData);
        setRevenueData(revenueDataResponse);
        setMenuItems(menusData);
        setStaffMembers(staffData);
        setTables(tablesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format revenue data for chart
  const chartData = revenueData.length > 0
    ? revenueData.map(item => ({
      name: item.periode,
      sales: item.revenu
    }))
    : [
      { name: 'Lun', sales: 4000 },
      { name: 'Mar', sales: 3000 },
      { name: 'Mer', sales: 5000 },
      { name: 'Jeu', sales: 2780 },
      { name: 'Ven', sales: 4890 },
      { name: 'Sam', sales: 6390 },
      { name: 'Dim', sales: 3490 },
    ];

  // Display menu items (use API data if available, fallback to mock)
  const displayMenuItems = menuItems.length > 0 ? menuItems.map(formatMenuItem) : MENU_ITEMS;

  // Display staff (use API data if available, fallback to mock)
  const displayStaff = staffMembers.length > 0 ? staffMembers.map(member => ({
    ...member,
    name: `${member.prenom || ''} ${member.nom || ''}`.trim(),
    status: member.actif ? 'ACTIVE' : 'INACTIVE'
  })) : STAFF;

  // Display tables (use API data if available, fallback to mock)
  const displayTables = tables.length > 0 ? tables : TABLES;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="w-72 bg-[#03081F] text-white hidden md:flex flex-col p-8 sticky top-0 h-screen shadow-2xl z-50">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-[#FC8A06] rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-[#FC8A06]/20">M!</div>
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
            { icon: FileText, label: 'Analytiques' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => item.id && setCurrentView(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${currentView === item.id ? 'bg-[#FC8A06] text-white shadow-xl shadow-[#FC8A06]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-white' : 'group-hover:text-[#FC8A06]'} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 px-4">
            <img src="https://i.pravatar.cc/100?u=alice" className="w-10 h-10 rounded-xl border-2 border-white/20" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">Alice Admin</span>
              <span className="text-[10px] text-gray-500 font-bold">PROPRIÉTAIRE</span>
            </div>
          </div>
          <button className="w-full flex items-center gap-4 px-5 py-4 text-gray-500 hover:text-white transition-all rounded-2xl hover:bg-white/5">
            <Settings size={20} />
            <span className="font-bold text-sm">Paramètres</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#03081F] tracking-tight">{currentView === 'DASHBOARD' ? 'Dashboard' : currentView === 'MENU' ? 'Catalogue Menu' : 'Équipe'}</h1>
            <p className="text-gray-400 font-medium mt-1">Gérez votre établissement en toute simplicité.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="bg-white border-none shadow-sm h-12 px-6">Exporter rapport</Button>
            <Button variant="primary" className="h-12 px-6 shadow-xl shadow-[#FC8A06]/20"><Plus /> Nouveau</Button>
          </div>
        </header>

        {currentView === 'DASHBOARD' && (
          <div className="space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  label: 'Chiffre d\'affaires',
                  value: stats ? `${formatPrice(stats.chiffre_affaires_total)} FCFA` : '0 FCFA',
                  icon: Coins,
                  color: 'bg-green-100 text-green-600',
                  trend: '+12.5%'
                },
                {
                  label: 'Commandes totales',
                  value: stats ? stats.nombre_commandes.toString() : '0',
                  icon: ShoppingBag,
                  color: 'bg-blue-100 text-blue-600',
                  trend: '+5.4%'
                },
                {
                  label: 'Note moyenne',
                  value: stats ? `${stats.note_moyenne.toFixed(1)}/5` : 'N/A',
                  icon: Users,
                  color: 'bg-orange-100 text-orange-600',
                  trend: '+2.1%'
                },
                {
                  label: 'Nombre de clients',
                  value: stats?.nombre_clients ? stats.nombre_clients.toString() : 'N/A',
                  icon: TrendingUp,
                  color: 'bg-purple-100 text-purple-600',
                  trend: '-1.4%'
                },
              ].map((stat, idx) => (
                <Card key={idx} className="p-8 border-none bg-white shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-[1.2rem] ${stat.color} transition-transform group-hover:scale-110`}>
                      <stat.icon size={24} />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black text-[#03081F] mt-2">{stat.value}</h3>
                </Card>
              ))}
            </div>

            {/* Main Graph & Top Menu */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <Card className="lg:col-span-2 p-10 bg-white border-none shadow-sm rounded-[2.5rem]">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-[#03081F]">Flux des Revenus</h3>
                  <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none">
                    <option>7 derniers jours</option>
                    <option>30 derniers jours</option>
                  </select>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FC8A06" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#FC8A06" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                        itemStyle={{ fontWeight: 800, color: '#03081F' }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#FC8A06" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-10 bg-[#03081F] text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Utensils size={120} />
                </div>
                <h3 className="text-xl font-black mb-10 relative z-10">Meilleures Ventes</h3>
                <div className="space-y-8 relative z-10">
                  {(topPlats.length > 0 ? topPlats : displayMenuItems.slice(0, 4)).map((plat, idx) => {
                    const isTopPlat = 'quantite_vendue' in plat;
                    const displayName = isTopPlat ? (plat as TopPlat).nom || (plat as TopPlat).nom_plat : (plat as any).name;
                    const displayPrice = isTopPlat ? 0 : (plat as any).price;
                    const displayImage = isTopPlat ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=300' : (plat as any).image;
                    const displayCategory = isTopPlat ? 'Populaire' : (plat as any).category;
                    const quantitySold = isTopPlat ? (plat as TopPlat).quantite_vendue : 142;

                    return (
                      <div key={idx} className="flex items-center gap-5 group">
                        <img src={displayImage} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white/10 group-hover:scale-105 transition-transform" />
                        <div className="flex-1">
                          <p className="font-bold text-sm tracking-tight">{displayName}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{displayCategory}</p>
                        </div>
                        <div className="text-right">
                          {displayPrice > 0 && <p className="font-black text-[#FC8A06]">FCFA{displayPrice.toFixed(2)}</p>}
                          <p className="text-[10px] text-gray-500 font-bold">{quantitySold} vendus</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" fullWidth className="mt-12 bg-white/5 border-white/10 text-white hover:bg-white/10 py-5 rounded-2xl font-black text-xs tracking-widest uppercase">Voir tout le menu</Button>
              </Card>
            </div>
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
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayMenuItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={item.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                        <div>
                          <p className="font-bold text-[#03081F]">{item.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg uppercase">{item.category}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-[#03081F]">FCFA{item.price.toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-[10px] font-black uppercase ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {item.isAvailable ? 'En stock' : 'Rupture'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-blue-500"><Edit size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
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
            {displayStaff.map(member => (
              <Card key={member.id} className="p-8 border-none bg-white shadow-sm hover:shadow-xl transition-all rounded-[2rem]">
                <div className="flex items-center gap-6 mb-8">
                  <img src={`https://i.pravatar.cc/150?u=${member.id}`} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-lg border-4 border-white" />
                  <div className="flex-1">
                    <h4 className="font-black text-lg text-[#03081F] tracking-tight">{member.name}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FC8A06]">{member.role}</span>
                  </div>
                  <button className="text-gray-300 hover:text-[#03081F] transition-colors"><MoreHorizontal /></button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold uppercase">Email</span>
                    <span className="font-bold text-[#03081F]">{member.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold uppercase">Statut</span>
                    <span className={`px-3 py-1 rounded-full font-black text-[9px] uppercase ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {member.status === 'ACTIVE' ? 'Présent' : 'Hors service'}
                    </span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-50 flex gap-2">
                  <Button fullWidth variant="outline" className="text-[10px] h-10 rounded-xl font-black uppercase tracking-widest">Planning</Button>
                  <Button variant="danger" className="h-10 w-10 p-0 rounded-xl"><Trash2 size={14} /></Button>
                </div>
              </Card>
            ))}
            <button className="h-full min-h-[300px] border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-[#FC8A06] hover:text-[#FC8A06] transition-all group">
              <div className="p-6 bg-gray-50 rounded-full group-hover:bg-[#FC8A06]/10 transition-colors">
                <Plus size={48} />
              </div>
              <span className="font-black uppercase tracking-widest text-sm">Ajouter un collaborateur</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
