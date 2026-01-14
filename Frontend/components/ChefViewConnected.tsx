import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import { API_CONFIG } from '../config/api.config';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { Badge, Button, Card } from './UI';
import { ChefHat, Timer, Play, Check, Box, Loader, RefreshCcw, LogOut, Eye, EyeOff } from 'lucide-react';
import { formatPrice } from '../mockData';

export const ChefViewConnected: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [plats, setPlats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'COMMANDES' | 'STOCK'>('COMMANDES');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    try {
      const [commandesData, platsData] = await Promise.all([
        apiService.getCommandes(token),
        apiService.getPlats(token)
      ]);

      setOrders(commandesData);
      setPlats(platsData);
      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startPreparation = async (commandeId: number) => {
    if (!token) return;

    try {
      await apiService.preparerCommande(commandeId, token);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const markAsReady = async (commandeId: number) => {
    if (!token || !user) return;

    try {
      await apiService.commandePrete(commandeId, user.id, token);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePlatAvailability = async (platId: number, currentStatus: boolean) => {
    if (!token) return;

    try {
      await apiService.put(`/plats/${platId}`, { disponible: !currentStatus }, { token });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const aPreparer = orders.filter(o => o.statut === OrderStatus.VALIDEE || o.statut === OrderStatus.EN_ATTENTE_VALIDATION);
  const enPreparation = orders.filter(o => o.statut === OrderStatus.EN_COURS);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#FC8A06] mx-auto" />
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#03081F] flex items-center gap-3 tracking-tight">
            <ChefHat className="text-[#FC8A06] w-10 h-10" /> CUISINE DIRECT
          </h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">
            Système de gestion de production
          </p>
          {user && (
            <p className="text-sm mt-2">
              <span className="text-gray-500">Connecté:</span>{' '}
              <span className="font-bold text-[#03081F]">{user.prenom} {user.nom}</span>
            </p>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <button onClick={loadData} className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
            <RefreshCcw className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveTab('COMMANDES')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'COMMANDES' ? 'bg-[#FC8A06] text-white shadow-lg' : 'text-gray-400 hover:text-[#03081F]'
                }`}
            >
              Commandes
            </button>
            <button
              onClick={() => setActiveTab('STOCK')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'STOCK' ? 'bg-[#FC8A06] text-white shadow-lg' : 'text-gray-400 hover:text-[#03081F]'
                }`}
            >
              Gestion Stock
            </button>
          </div>

          <button
            onClick={logout}
            className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {activeTab === 'COMMANDES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Column: À Préparer */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-[#03081F] flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                ATTENTE ({aPreparer.length})
              </h2>
            </div>
            <div className="space-y-6">
              {aPreparer.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-gray-200">
                  <Box className="w-16 h-16 text-gray-100" />
                  <p className="text-gray-300 font-black uppercase text-sm">Cuisine libre</p>
                </div>
              ) : (
                aPreparer.map(order => (
                  <Card key={order.id} className="p-8 border-none rounded-[2rem] bg-white shadow-xl hover:shadow-2xl transition-all relative group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 rounded-l-full"></div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-lg">
                          T{order.table_id}
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">
                          REF: {order.id}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs font-bold flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                        <Timer size={14} />
                        {order.created_at && (() => {
                          const minutes = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
                          return `il y a ${minutes} min`;
                        })()}
                      </span>
                    </div>
                    <div className="space-y-3 mb-8">
                      {order.lignes?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                          <span className="font-bold text-[#03081F]">
                            <span className="text-[#FC8A06] font-black text-lg mr-3">{item.quantite}x</span>
                            {item.plat?.nom || 'Plat'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button
                      fullWidth
                      onClick={() => startPreparation(order.id)}
                      variant="secondary"
                      className="h-14 rounded-2xl shadow-xl shadow-gray-200"
                    >
                      <Play size={18} fill="currentColor" /> PRENDRE EN CHARGE
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Column: En Préparation */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-[#03081F] flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                EN CUISSON ({enPreparation.length})
              </h2>
            </div>
            <div className="space-y-6">
              {enPreparation.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-gray-200">
                  <Timer className="w-16 h-16 text-gray-100" />
                  <p className="text-gray-300 font-black uppercase text-sm">Rien en cours</p>
                </div>
              ) : (
                enPreparation.map(order => (
                  <Card key={order.id} className="p-8 border-none rounded-[2rem] bg-[#03081F] text-white shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#FC8A06] rounded-l-full"></div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="bg-white/10 text-white px-4 py-2 rounded-xl font-black text-lg">
                        T{order.table_id}
                      </div>
                      <div className="animate-pulse flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#FC8A06]"></div>
                        <span className="text-[10px] font-black text-[#FC8A06] uppercase tracking-widest">
                          En cours
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 mb-8">
                      {order.lignes?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                          <span className="font-bold">
                            <span className="text-[#FC8A06] font-black text-lg mr-3">{item.quantite}x</span>
                            {item.plat?.nom || 'Plat'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        fullWidth
                        onClick={() => markAsReady(order.id)}
                        variant="success"
                        className="h-14 rounded-2xl shadow-lg shadow-green-900/20"
                      >
                        <Check size={20} /> MARQUER COMME PRÊT
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plats.map(item => (
            <Card key={item.id} className="p-6 bg-white border-none rounded-3xl shadow-md group">
              <div className="relative h-40 w-full mb-4 rounded-2xl overflow-hidden bg-gray-100">
                {item.image_url ? (
                  <img
                    src={`${API_CONFIG.BASE_URL}${item.image_url}`}
                    className={`w-full h-full object-cover transition-all duration-500 ${!item.disponible ? 'grayscale opacity-50' : 'group-hover:scale-110'
                      }`}
                    alt={item.nom_plat}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ChefHat className="w-16 h-16" />
                  </div>
                )}
                {!item.disponible && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">
                      Indisponible
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-[#03081F] mb-1">{item.nom}</h3>
              <p className="text-xs text-gray-400 mb-2 font-medium">
                {item.categorie?.nom || 'Autre'}
              </p>
              <p className="text-sm font-bold text-[#FC8A06] mb-4">€{formatPrice(item.prix)}</p>
              <Button
                fullWidth
                variant={item.disponible ? 'outline' : 'success'}
                className="h-11 rounded-xl text-xs font-black"
                onClick={() => togglePlatAvailability(item.id, item.disponible)}
              >
                {item.disponible ? (
                  <><EyeOff size={14} /> Déclarer Indisponible</>
                ) : (
                  <><Eye size={14} /> Réactiver le plat</>
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
