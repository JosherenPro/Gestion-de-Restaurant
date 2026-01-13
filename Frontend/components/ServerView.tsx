
import React, { useState } from 'react';
import { TABLES, INITIAL_ORDERS, MENU_ITEMS, MenuItemDisplay, OrderDisplay, TableDisplay } from '../mockData';
import { OrderStatus, OrderItem } from '../types';
import { Card, Button, Badge, Modal } from './UI';
import { LayoutGrid, ClipboardList, UserPlus, CheckCircle2, Send, ChevronRight, X, Plus, Minus } from 'lucide-react';

export const ServerView: React.FC = () => {
  const [tables, setTables] = useState<TableDisplay[]>(TABLES);
  const [orders, setOrders] = useState<OrderDisplay[]>(INITIAL_ORDERS);
  const [selectedTable, setSelectedTable] = useState<TableDisplay | null>(null);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [manualBasket, setManualBasket] = useState<Array<MenuItemDisplay & { quantity: number }>>([]);

  const approveOrder = (id: string | number) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: OrderStatus.VALIDEE } : o));
  };

  const markServed = (id: string | number) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: OrderStatus.SERVIE } : o));
  };

  const addToManual = (item: MenuItemDisplay) => {
    setManualBasket(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromManual = (id: number) => {
    setManualBasket(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i.id !== id);
    });
  };

  const createManualOrder = () => {
    if (!selectedTable || manualBasket.length === 0) return;
    const newOrder: OrderDisplay = {
      id: `MAN-${Math.floor(Math.random() * 1000)}`,
      tableId: `t${selectedTable.id}`,
      items: manualBasket.map(item => ({ 
        id: item.id, 
        plat_id: item.id,
        name: item.name, 
        quantity: item.quantity, 
        price: item.price 
      })),
      status: OrderStatus.VALIDEE,
      timestamp: Date.now(),
      totalPrice: manualBasket.reduce((a, b) => a + b.price * b.quantity, 0)
    };
    setOrders([newOrder, ...orders]);
    setManualBasket([]);
    setIsManualOrderOpen(false);
    setSelectedTable(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Table Plan Sidebar */}
      <aside className="w-full md:w-80 p-6 bg-[#03081F] text-white border-r space-y-8 overflow-y-auto max-h-screen md:sticky top-0 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#FC8A06] rounded-xl flex items-center justify-center font-bold">S!</div>
          <span className="font-bold text-xl">Service Pro</span>
        </div>

        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Plan de Salle</h2>
          <div className="grid grid-cols-2 gap-3">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedTable?.id === table.id ? 'border-[#FC8A06] bg-[#FC8A06]/10 ring-2 ring-[#FC8A06]/20' :
                  table.status === 'OCCUPIED' ? 'border-orange-500/20 bg-white/5 text-orange-400' :
                  table.status === 'RESERVED' ? 'border-blue-500/20 bg-white/5 text-blue-400' :
                  'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                }`}
              >
                <span className="font-black text-lg">T{table.number}</span>
                <span className="text-[9px] font-bold opacity-60">{table.capacity} PERS.</span>
              </button>
            ))}
          </div>
        </div>

        {selectedTable && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
            <h3 className="font-bold mb-3 flex items-center gap-2"><UserPlus size={16} className="text-[#FC8A06]" /> Table {selectedTable.number}</h3>
            <Button fullWidth onClick={() => setIsManualOrderOpen(true)} variant="primary" className="h-12 text-sm">Prise de commande</Button>
            <button className="w-full mt-2 text-xs text-gray-500 hover:text-white" onClick={() => setSelectedTable(null)}>Annuler la sélection</button>
          </div>
        )}
      </aside>

      {/* Orders Dashboard */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#03081F]">Commandes Actives</h1>
            <p className="text-gray-500 font-medium">Flux temps réel du service</p>
          </div>
          <div className="flex gap-3 items-center">
             <div className="bg-orange-100 text-[#FC8A06] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FC8A06] animate-pulse"></div>
                {orders.length} en cours
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {orders.map(order => (
            <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow border-none bg-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ClipboardList size={64} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-[#03081F] rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg">
                      T{order.tableId.replace('t', '')}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#03081F]">#{order.id}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • €{order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <Badge status={order.status} />
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm flex justify-between font-medium">
                        <span><span className="text-[#FC8A06] font-black mr-2">{item.quantity}x</span> {item.name}</span>
                        <span className="text-gray-400">€{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  {order.status === OrderStatus.EN_ATTENTE_VALIDATION && (
                    <Button fullWidth onClick={() => approveOrder(order.id)} variant="primary" className="h-12">Approver</Button>
                  )}
                  {order.status === OrderStatus.PRETE && (
                    <Button fullWidth onClick={() => markServed(order.id)} variant="success" className="h-12">Signaler comme servi</Button>
                  )}
                   <Button variant="outline" className="h-12 w-12 p-0"><ChevronRight /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Manual Order Modal */}
      <Modal isOpen={isManualOrderOpen} onClose={() => setIsManualOrderOpen(false)} title={`Prise de commande - Table ${selectedTable?.number}`}>
        <div className="flex flex-col gap-6">
          <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2">
            <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Carte du restaurant</h4>
            {MENU_ITEMS.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:border-[#FC8A06] transition-all">
                <div className="flex items-center gap-3">
                  <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-[#FC8A06] font-bold">€{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <button onClick={() => addToManual(item)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-[#FC8A06] hover:text-white transition-all">
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed pt-4">
             <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Sélection en cours</h4>
             <div className="space-y-2 mb-6">
               {manualBasket.length === 0 ? <p className="text-center text-gray-300 text-sm py-4">Panier vide</p> : manualBasket.map(item => (
                 <div key={item.id} className="flex items-center justify-between">
                    <span className="text-sm font-bold"><span className="text-[#FC8A06]">{item.quantity}x</span> {item.name}</span>
                    <div className="flex items-center gap-3">
                       <button onClick={() => removeFromManual(item.id)} className="text-gray-400 hover:text-red-500"><Minus size={14} /></button>
                       <span className="text-sm font-black">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                 </div>
               ))}
             </div>
             <Button fullWidth onClick={createManualOrder} variant="primary" className="h-14" disabled={manualBasket.length === 0}>
               Envoyer en cuisine (€{manualBasket.reduce((a, b) => a + b.price * b.quantity, 0).toFixed(2)})
             </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
