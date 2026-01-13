import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from './UI';
import { 
  BarChart3, Users, UtensilsCrossed, DollarSign, Calendar, 
  TrendingUp, Package, Settings, Plus, Edit, Trash2, Loader,
  Eye, FileText, MapPin, ChefHat, LogOut
} from 'lucide-react';
import { apiService } from '../services/api.service';
import { MenuItem, Stats, TopPlat, Table, Reservation } from '../types';
import { formatPrice } from '../mockData';
import { ReservationManagerView } from './ReservationManagerView';
import { useAuth } from '../context/AuthContext';

type TabType = 'DASHBOARD' | 'MENU' | 'PERSONNEL' | 'TABLES' | 'RESERVATIONS' | 'STATS';

export const GerantViewConnected: React.FC = () => {
const { logout, user } = useAuth();
const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [topPlats, setTopPlats] = useState<TopPlat[]>([]);
  const [plats, setPlats] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Modal states
  const [isAddPlatOpen, setIsAddPlatOpen] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const GERANT_TOKEN = 'mock-gerant-token';

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      switch (activeTab) {
        case 'DASHBOARD':
        case 'STATS':
          const [statsData, topPlatsData] = await Promise.all([
            apiService.getStatsGlobal(GERANT_TOKEN),
            apiService.getTopPlats(GERANT_TOKEN)
          ]);
          setStats(statsData);
          setTopPlats(topPlatsData);
          break;
        case 'MENU':
          const platsData = await apiService.getPlats();
          setPlats(platsData);
          break;
        case 'TABLES':
          const tablesData = await apiService.getTables();
          setTables(tablesData);
          break;
        case 'PERSONNEL':
          const personnelData = await apiService.getPersonnel(GERANT_TOKEN);
          setPersonnel(personnelData);
          break;
        case 'RESERVATIONS':
          const reservationsData = await apiService.getReservations();
          setReservations(reservationsData);
          break;
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const deletePlat = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce plat ?')) return;
    try {
      await apiService.delete(`/plats/${id}`, { token: GERANT_TOKEN });
      loadData();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    }
  };

  const deleteTable = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette table ?')) return;
    try {
      await apiService.delete(`/tables/${id}`, { token: GERANT_TOKEN });
      loadData();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-[#FC8A06]" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'DASHBOARD':
        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-none shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Chiffre d'affaires</p>
                <p className="text-3xl font-black text-blue-600">
                  €{stats ? formatPrice(stats.chiffre_affaires_total) : '0.00'}
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-none shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Commandes</p>
                <p className="text-3xl font-black text-green-600">
                  {stats?.nombre_commandes || 0}
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-none shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Clients</p>
                <p className="text-3xl font-black text-purple-600">
                  {stats?.nombre_clients || 0}
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-none shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Note moyenne</p>
                <p className="text-3xl font-black text-orange-600">
                  {stats?.note_moyenne?.toFixed(1) || 'N/A'}/5
                </p>
              </Card>
            </div>

            {/* Top Plats */}
            <Card className="p-6 border-none shadow-lg">
              <h3 className="text-xl font-black text-[#03081F] mb-4">?? Top Plats</h3>
              <div className="space-y-3">
                {topPlats.map((plat, index) => (
                  <div key={plat.plat_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-[#03081F]">{plat.nom_plat}</p>
                        <p className="text-xs text-gray-500">{plat.quantite_vendue} vendus</p>
                      </div>
                    </div>
                    <p className="font-black text-[#FC8A06]">€{formatPrice(plat.chiffre_affaires)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'MENU':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-[#03081F]">Gestion du Menu</h2>
              <Button 
                variant="primary" 
                onClick={() => setIsAddPlatOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un plat
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plats.map(plat => (
                <Card key={plat.id} className="p-4 border-none shadow-md hover:shadow-lg transition-all">
                  <div className="relative h-40 w-full mb-3 rounded-xl overflow-hidden">
                    <img 
                      src={plat.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} 
                      className="w-full h-full object-cover"
                      alt={plat.nom}
                    />
                    {!plat.disponible && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                          Indisponible
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-[#03081F] mb-1">{plat.nom}</h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{plat.description}</p>
                  <p className="text-lg font-black text-[#FC8A06] mb-3">€{formatPrice(plat.prix)}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-9"
                      onClick={() => {
                        setSelectedItem(plat);
                        setIsAddPlatOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 h-9 text-red-500 hover:bg-red-50"
                      onClick={() => deletePlat(plat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'TABLES':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-[#03081F]">Gestion des Tables</h2>
              <Button 
                variant="primary" 
                onClick={() => setIsAddTableOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter une table
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {tables.map(table => (
                <Card key={table.id} className="p-6 border-none shadow-md hover:shadow-lg transition-all text-center">
                  <MapPin className="w-8 h-8 text-[#FC8A06] mx-auto mb-3" />
                  <p className="font-black text-2xl text-[#03081F] mb-1">T{table.numero_table}</p>
                  <p className="text-xs text-gray-500 mb-3">{table.capacite} personnes</p>
                  <div className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    table.statut === 'LIBRE' ? 'bg-green-100 text-green-600' :
                    table.statut === 'OCCUPEE' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {table.statut}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-8 text-xs"
                      onClick={() => {
                        setSelectedItem(table);
                        setIsAddTableOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 h-8 text-xs text-red-500"
                      onClick={() => deleteTable(table.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'PERSONNEL':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-[#03081F]">Gestion du Personnel</h2>
              <Button 
                variant="primary" 
                onClick={() => setIsAddPersonnelOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un membre
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personnel.map(member => (
                <Card key={member.id} className="p-6 border-none shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#FC8A06] rounded-full flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[#03081F]">{member.nom} {member.prenom}</p>
                      <p className="text-xs text-gray-500">{member.role || 'Personnel'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">?? {member.email}</p>
                    <p className="text-gray-600">?? {member.telephone}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button variant="outline" className="flex-1 h-9">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="flex-1 h-9 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'RESERVATIONS':
        return <ReservationManagerView />;

      case 'STATS':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#03081F]">Statistiques Détaillées</h2>
            <Card className="p-6 border-none shadow-lg">
              <p className="text-gray-500">Graphiques et analyses détaillées à venir...</p>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FC8A06] to-orange-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#03081F]">Dashboard Gérant</h1>
                <p className="text-xs text-gray-500">Système de gestion complet</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                ?? {user?.prenom || user?.nom || user?.email}
              </span>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 text-red-500 hover:bg-red-50 hover:border-red-200"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'DASHBOARD', label: 'Tableau de bord', icon: BarChart3 },
              { id: 'MENU', label: 'Menu', icon: UtensilsCrossed },
              { id: 'TABLES', label: 'Tables', icon: MapPin },
              { id: 'PERSONNEL', label: 'Personnel', icon: Users },
              { id: 'RESERVATIONS', label: 'Réservations', icon: Calendar },
              { id: 'STATS', label: 'Statistiques', icon: TrendingUp },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-[#FC8A06] text-[#FC8A06]'
                      : 'border-transparent text-gray-500 hover:text-[#03081F]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </main>

      {/* Modals (placeholders) */}
      <Modal 
        isOpen={isAddPlatOpen} 
        onClose={() => {
          setIsAddPlatOpen(false);
          setSelectedItem(null);
        }} 
        title={selectedItem ? 'Modifier le plat' : 'Ajouter un plat'}
      >
        <p className="text-gray-500">Formulaire d'ajout/modification de plat à implémenter</p>
      </Modal>

      <Modal 
        isOpen={isAddTableOpen} 
        onClose={() => {
          setIsAddTableOpen(false);
          setSelectedItem(null);
        }} 
        title={selectedItem ? 'Modifier la table' : 'Ajouter une table'}
      >
        <p className="text-gray-500">Formulaire d'ajout/modification de table à implémenter</p>
      </Modal>

      <Modal 
        isOpen={isAddPersonnelOpen} 
        onClose={() => setIsAddPersonnelOpen(false)} 
        title="Ajouter un membre du personnel"
      >
        <p className="text-gray-500">Formulaire d'ajout de personnel à implémenter</p>
      </Modal>
    </div>
  );
};
