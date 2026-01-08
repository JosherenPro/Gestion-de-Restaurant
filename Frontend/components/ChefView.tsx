
import React, { useState } from 'react';
import { INITIAL_ORDERS, MENU_ITEMS } from '../mockData';
import { Order, OrderStatus, MenuItem } from '../types';
import { Badge, Button, Card } from './UI';
import { ChefHat, Timer, Package, Play, Check, Ban, EyeOff, Eye, Box } from 'lucide-react';

export const ChefView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [menu, setMenu] = useState<MenuItem[]>(MENU_ITEMS);
  const [activeTab, setActiveTab] = useState<'COMMANDES' | 'STOCK'>('COMMANDES');

  const updateStatus = (id: string, next: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
  };

  const toggleAvailability = (id: string) => {
    setMenu(prev => prev.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item));
  };

  const aPreparer = orders.filter(o => o.status === OrderStatus.A_PREPARER || o.status === OrderStatus.EN_ATTENTE_VALIDATION);
  const enPreparation = orders.filter(o => o.status === OrderStatus.EN_PREPARATION);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#03081F] flex items-center gap-3 tracking-tight">
            <ChefHat className="text-[#FC8A06] w-10 h-10" /> CUISINE DIRECT
          </h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Système de gestion de production</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
           <button 
            onClick={() => setActiveTab('COMMANDES')}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'COMMANDES' ? 'bg-[#FC8A06] text-white shadow-lg' : 'text-gray-400 hover:text-[#03081F]'}`}
           >
             Commandes
           </button>
           <button 
            onClick={() => setActiveTab('STOCK')}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'STOCK' ? 'bg-[#FC8A06] text-white shadow-lg' : 'text-gray-400 hover:text-[#03081F]'}`}
           >
             Gestion Stock
           </button>
        </div>
      </header>

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
                        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-lg">T{order.tableId.replace('t', '')}</div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">REF: {order.id}</span>
                      </div>
                      <span className="text-gray-400 text-xs font-bold flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full"><Timer size={14} /> il y a 8 min</span>
                    </div>
                    <div className="space-y-3 mb-8">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                          <span className="font-bold text-[#03081F]"><span className="text-[#FC8A06] font-black text-lg mr-3">{item.quantity}x</span> {item.name}</span>
                        </div>
                      ))}
                    </div>
                    <Button fullWidth onClick={() => updateStatus(order.id, OrderStatus.EN_PREPARATION)} variant="secondary" className="h-14 rounded-2xl shadow-xl shadow-gray-200">
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
                      <div className="bg-white/10 text-white px-4 py-2 rounded-xl font-black text-lg">T{order.tableId.replace('t', '')}</div>
                      <div className="animate-pulse flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-[#FC8A06]"></div>
                         <span className="text-[10px] font-black text-[#FC8A06] uppercase tracking-widest">En cours</span>
                      </div>
                    </div>
                    <div className="space-y-3 mb-8">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                          <span className="font-bold"><span className="text-[#FC8A06] font-black text-lg mr-3">{item.quantity}x</span> {item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button fullWidth onClick={() => updateStatus(order.id, OrderStatus.PRET_A_SERVIR)} variant="success" className="h-14 rounded-2xl shadow-lg shadow-green-900/20">
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
          {menu.map(item => (
            <Card key={item.id} className="p-6 bg-white border-none rounded-3xl shadow-md group">
              <div className="relative h-40 w-full mb-4 rounded-2xl overflow-hidden">
                <img src={item.image} className={`w-full h-full object-cover transition-all duration-500 ${!item.isAvailable ? 'grayscale opacity-50' : 'group-hover:scale-110'}`} />
                {!item.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">Indisponible</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-[#03081F] mb-1">{item.name}</h3>
              <p className="text-xs text-gray-400 mb-6 font-medium">{item.category}</p>
              <Button 
                fullWidth 
                variant={item.isAvailable ? 'outline' : 'success'} 
                className="h-11 rounded-xl text-xs font-black"
                onClick={() => toggleAvailability(item.id)}
              >
                {item.isAvailable ? <><EyeOff size={14} /> Déclarer Indisponible</> : <><Eye size={14} /> Réactiver le plat</>}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
