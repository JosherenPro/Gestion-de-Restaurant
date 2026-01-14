import React from 'react';
import { Home, Utensils, ShoppingBasket, Calendar } from 'lucide-react';

interface BottomTabBarProps {
    activeTab: 'HOME' | 'MENU' | 'BASKET' | 'RESERVATIONS';
    setActiveTab: (tab: 'HOME' | 'MENU' | 'BASKET' | 'RESERVATIONS') => void;
    basketCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, setActiveTab, basketCount }) => {
    const tabs = [
        { id: 'HOME' as const, label: 'Accueil', icon: Home },
        { id: 'MENU' as const, label: 'Carte', icon: Utensils },
        { id: 'BASKET' as const, label: 'Panier', icon: ShoppingBasket, count: basketCount },
        { id: 'RESERVATIONS' as const, label: 'Résas', icon: Calendar },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
            <div className="max-w-md mx-auto bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border border-white/40 p-2 flex items-center justify-around relative overflow-hidden">
                {/* Animated Background Indicator */}
                <div
                    className="absolute h-14 bg-gradient-to-br from-[#FC8A06] to-orange-600 rounded-2xl shadow-lg shadow-orange-500/20 transition-all duration-500 ease-out"
                    style={{
                        width: `${100 / tabs.length - 4}%`,
                        left: `${(tabs.findIndex(t => t.id === activeTab) * (100 / tabs.length)) + 2}%`,
                        opacity: 1
                    }}
                />

                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex flex-col items-center justify-center w-full h-14 transition-all duration-300 ${isActive ? 'text-white scale-105' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <div className="relative">
                                <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                                {tab.count !== undefined && tab.count > 0 && !isActive && (
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                                        {tab.count}
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] font-black mt-1 uppercase tracking-tighter transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                }`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
