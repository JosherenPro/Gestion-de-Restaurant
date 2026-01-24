import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from './UI';
import {
    BarChart3, Users, UtensilsCrossed, Coins, Calendar,
    TrendingUp, Package, Plus, Edit, Trash2, Loader,
    Eye, MapPin, Bell, Clock,
    ArrowUpRight, ArrowDownRight,
    Search, AlertCircle,
    Save, X, Hash, Tag,
    Phone, Mail, Lock, UserPlus, LogOut
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/api.service';
import { API_CONFIG } from '../config/api.config';
import { MenuItem, Stats, TopPlat, Table, Reservation, Categorie, TableStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReservationManagerView } from './ReservationManagerView';

// --- Types ---
type TabType = 'DASHBOARD' | 'MENU' | 'PERSONNEL' | 'TABLES' | 'RESERVATIONS' | 'STATS' | 'CATEGORIES';

interface PlatFormData {
    nom: string;
    description: string;
    prix: number;
    categorie_id: number;
    disponible: boolean;
    image_url: string;
    temps_preparation: number;
}

interface TableFormData {
    numero_table: string;
    capacite: number;
    statut: TableStatus;
}

interface PersonnelFormData {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    password: string;
    role: 'SERVEUR' | 'CUISINIER' | 'GERANT';
}

// --- Composants Réutilisables ---

const FormInput: React.FC<{
    label: string;
    type?: string;
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    required?: boolean;
    min?: number;
    step?: number;
}> = ({ label, type = 'text', value, onChange, placeholder, icon, required, min, step }) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                min={min}
                step={step}
                className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FC8A06] focus:ring-2 focus:ring-[#FC8A06]/20 outline-none transition-all text-sm`}
            />
        </div>
    </div>
);

const FormSelect: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    options: { value: string | number; label: string }[];
    icon?: React.ReactNode;
    required?: boolean;
}> = ({ label, value, onChange, options, icon, required }) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FC8A06] focus:ring-2 focus:ring-[#FC8A06]/20 outline-none transition-all text-sm appearance-none bg-white`}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    </div>
);

const FormTextarea: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FC8A06] focus:ring-2 focus:ring-[#FC8A06]/20 outline-none transition-all text-sm resize-none"
        />
    </div>
);

const ToggleSwitch: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
}> = ({ label, checked, onChange, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
            <p className="font-bold text-sm text-gray-700">{label}</p>
            {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[#FC8A06]' : 'bg-gray-300'}`}
        >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'left-7' : 'left-1'}`} />
        </button>
    </div>
);

const LiveClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-medium">
                {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-gray-300">|</span>
            <span>
                {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
        </div>
    );
};

const KPICard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: number;
    color: string;
}> = ({ icon, label, value, trend, color }) => (
    <Card className="p-6 border-none shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-black text-[#03081F] mb-2">{value}</p>
            {trend !== undefined && (
                <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
            {icon}
        </div>
    </Card>
);

// --- Composant Principal ---
export const GerantViewConnected: React.FC = () => {
    const { logout, user, token } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data states
    const [stats, setStats] = useState<Stats | null>(null);
    const [revenueStats, setRevenueStats] = useState<any[]>([]);
    const [topPlats, setTopPlats] = useState<TopPlat[]>([]);
    const [plats, setPlats] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Categorie[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [personnel, setPersonnel] = useState<any[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [allCommandes, setAllCommandes] = useState<any[]>([]);

    // Notifications state
    const [hasNewOrders, setHasNewOrders] = useState(false);
    const [hasNewReservations, setHasNewReservations] = useState(false);
    const prevOrdersCountRef = React.useRef(0);
    const prevReservationsCountRef = React.useRef(0);
    const loadingRef = React.useRef(false);

    // Modal states
    const [isAddPlatOpen, setIsAddPlatOpen] = useState(false);
    const [isAddTableOpen, setIsAddTableOpen] = useState(false);
    const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false);
    const [isAddCategorieOpen, setIsAddCategorieOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    // Form states
    const [platForm, setPlatForm] = useState<PlatFormData>({
        nom: '',
        description: '',
        prix: 0,
        categorie_id: 0,
        disponible: true,
        image_url: '',
        temps_preparation: 15
    });

    const [tableForm, setTableForm] = useState<TableFormData>({
        numero_table: '',
        capacite: 2,
        statut: TableStatus.LIBRE
    });

    const [personnelForm, setPersonnelForm] = useState<PersonnelFormData>({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        role: 'SERVEUR'
    });

    const [categorieForm, setCategorieForm] = useState({ nom: '', description: '' });

    const getToken = () => token || '';

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Auto refresh every 30s
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await apiService.getCategories(getToken());
            setCategories(data);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const loadData = async () => {
        if (!token || loadingRef.current) {
            if (!token) setLoading(false);
            return;
        }

        try {
            loadingRef.current = true;
            if (activeTab === 'DASHBOARD' || activeTab === 'STATS') {
                // Keep loading skeletal only for first load
                if (!stats) setLoading(true);
            }
            setError(null);
            const authToken = getToken();

            switch (activeTab) {
                case 'DASHBOARD':
                    const [statsData, topPlatsData, tablesData, reservationsData, personnelData, platsData, revenueData] = await Promise.all([
                        apiService.getStatsGlobal(authToken).catch((e) => null),
                        apiService.getTopPlats(authToken).catch((e) => []),
                        apiService.getTables(authToken).catch((e) => []),
                        apiService.getReservations(authToken).catch((e) => []),
                        apiService.getPersonnelWithDetails(authToken).catch((e) => []),
                        apiService.getPlats(authToken).catch((e) => []),
                        apiService.getRevenueStats(authToken).catch((e) => [])
                    ]);
                    setStats(statsData);
                    const formattedRevenueData = revenueData.length > 0
                        ? revenueData.map((d: any) => ({
                            name: new Date(d.periode).toLocaleDateString('fr-FR', { weekday: 'short' }),
                            date: d.periode, // Keep full date for tooltip or other uses
                            sales: d.revenu
                        })).reverse() // Backend returns newest first, chart usually needs oldest first
                        : [
                            { name: 'Lun', sales: 0 }, { name: 'Mar', sales: 0 }, { name: 'Mer', sales: 0 },
                            { name: 'Jeu', sales: 0 }, { name: 'Ven', sales: 0 }, { name: 'Sam', sales: 0 }, { name: 'Dim', sales: 0 }
                        ];
                    setRevenueStats(formattedRevenueData);
                    setTopPlats(topPlatsData.map((p: any) => ({
                        plat_id: p.plat_id,
                        nom_plat: p.nom || p.nom_plat || 'Plat inconnu',
                        nom: p.nom || p.nom_plat || 'Plat inconnu',
                        quantite_vendue: p.quantite_vendue || 0,
                        chiffre_affaires: p.chiffre_affaires || (platsData.find((plat: any) => plat.id === p.plat_id)?.prix || 0) * p.quantite_vendue
                    })));
                    setTables(tablesData);
                    // Normaliser les réservations
                    const normalizedReservations = (reservationsData || []).map((res: any) => ({
                        ...res,
                        status: (res.statut || res.status || 'EN_ATTENTE').toUpperCase()
                    }));
                    setReservations(normalizedReservations);
                    setPersonnel(personnelData);
                    setPlats(platsData);

                    const allCmds = await apiService.getCommandes(authToken).catch(() => []);
                    setAllCommandes(allCmds);

                    // Check for new orders
                    if (allCmds.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
                        setHasNewOrders(true);
                        setTimeout(() => setHasNewOrders(false), 5000);
                    }
                    prevOrdersCountRef.current = allCmds.length;

                    // Check for new reservations
                    if (reservationsData.length > prevReservationsCountRef.current && prevReservationsCountRef.current > 0) {
                        setHasNewReservations(true);
                        setTimeout(() => setHasNewReservations(false), 5000);
                    }
                    prevReservationsCountRef.current = reservationsData.length;
                    break;
                case 'STATS':
                    const [statsData2, topPlatsData2, platsForStats, revenueData2] = await Promise.all([
                        apiService.getStatsGlobal(authToken),
                        apiService.getTopPlats(authToken),
                        apiService.getPlats(authToken),
                        apiService.getRevenueStats(authToken).catch((e) => [])
                    ]);
                    setStats(statsData2);
                    setPlats(platsForStats);
                    const formattedRevenueDataStats = revenueData2.length > 0
                        ? revenueData2.map((d: any) => ({
                            name: new Date(d.periode).toLocaleDateString('fr-FR', { weekday: 'short' }),
                            date: d.periode,
                            sales: d.revenu
                        })).reverse()
                        : [];
                    setRevenueStats(formattedRevenueDataStats);
                    setTopPlats(topPlatsData2.map((p: any) => ({
                        plat_id: p.plat_id,
                        nom_plat: p.nom || p.nom_plat || 'Plat inconnu',
                        nom: p.nom || p.nom_plat || 'Plat inconnu',
                        quantite_vendue: p.quantite_vendue || 0,
                        chiffre_affaires: p.chiffre_affaires || (platsForStats.find((plat: any) => plat.id === p.plat_id)?.prix || 0) * p.quantite_vendue
                    })));
                    break;
                case 'MENU':
                case 'CATEGORIES':
                    const [platsDataMenu, categoriesData] = await Promise.all([
                        apiService.getPlats(authToken),
                        apiService.getCategories(authToken)
                    ]);
                    setPlats(platsDataMenu);
                    setCategories(categoriesData);
                    break;
                case 'TABLES':
                    const tablesDataOnly = await apiService.getTables(authToken);
                    setTables(tablesDataOnly);
                    break;
                case 'PERSONNEL':
                    const personnelDataOnly = await apiService.getPersonnelWithDetails(authToken);
                    setPersonnel(personnelDataOnly);
                    break;
                case 'RESERVATIONS':
                    const reservationsDataOnly = await apiService.getReservations(authToken);
                    setReservations(reservationsDataOnly);
                    break;
            }
        } catch (err: any) {
            console.error('Error loading data:', err);
            setError('Impossible de charger les données.');
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    // Form Handlers
    useEffect(() => {
        if (isAddPlatOpen && selectedItem) {
            setPlatForm({
                nom: selectedItem.nom || '',
                description: selectedItem.description || '',
                prix: selectedItem.prix || 0,
                categorie_id: selectedItem.categorie_id || 0,
                disponible: selectedItem.disponible ?? true,
                image_url: selectedItem.image_url || '',
                temps_preparation: selectedItem.temps_preparation || 15
            });
        } else if (!isAddPlatOpen) {
            setPlatForm({ nom: '', description: '', prix: 0, categorie_id: 0, disponible: true, image_url: '', temps_preparation: 15 });
        }
    }, [isAddPlatOpen, selectedItem]);

    useEffect(() => {
        if (isAddTableOpen && selectedItem) {
            setTableForm({
                numero_table: selectedItem.numero_table || '',
                capacite: selectedItem.capacite || 2,
                statut: selectedItem.statut || TableStatus.LIBRE
            });
        } else if (!isAddTableOpen) {
            setTableForm({ numero_table: '', capacite: 2, statut: TableStatus.LIBRE });
        }
    }, [isAddTableOpen, selectedItem]);

    const handleSavePlat = async () => {
        try {
            setActionLoading(true);
            const data = { ...platForm };

            if (selectedItem) {
                await apiService.updatePlat(selectedItem.id, data, getToken());
            } else {
                await apiService.createPlat(data, getToken());
            }

            setIsAddPlatOpen(false);
            setSelectedItem(null);
            await loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveTable = async () => {
        try {
            setActionLoading(true);
            if (selectedItem) {
                await apiService.updateTable(selectedItem.id, tableForm, getToken());
            } else {
                await apiService.createTable(tableForm, getToken());
            }
            setIsAddTableOpen(false);
            setSelectedItem(null);
            await loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSavePersonnel = async () => {
        try {
            setActionLoading(true);
            if (personnelForm.role === 'SERVEUR') {
                await apiService.registerServeur(personnelForm, getToken());
            } else if (personnelForm.role === 'CUISINIER') {
                await apiService.registerCuisinier(personnelForm, getToken());
            } else {
                await apiService.registerGerant(personnelForm, getToken());
            }
            setIsAddPersonnelOpen(false);
            setPersonnelForm({ nom: '', prenom: '', email: '', telephone: '', password: '', role: 'SERVEUR' });
            await loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveCategorie = async () => {
        try {
            setActionLoading(true);
            if (selectedItem) {
                await apiService.updateCategorie(selectedItem.id, categorieForm, getToken());
            } else {
                await apiService.createCategorie(categorieForm, getToken());
            }
            setIsAddCategorieOpen(false);
            setSelectedItem(null);
            setCategorieForm({ nom: '', description: '' });
            await loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    // Helper to resolve Image URL
    // Helper to resolve Image URL
    const getImageUrl = (url: string | null | undefined) => {
        if (!url) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
        if (url.startsWith('http')) return url;
        return `${API_CONFIG.BASE_URL}${url}`;
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32">
            {/* Header: Sticky & Modern Glassmorphism */}
            <div className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-[60] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FC8A06] to-orange-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-orange-200">R</div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-black text-[#03081F] leading-none tracking-tighter uppercase">Josheren Pro</h1>
                                <p className="text-[10px] font-bold text-[#FC8A06] uppercase tracking-widest mt-1">Management Hub</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="hidden md:block">
                                <LiveClock />
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center justify-center w-10 h-10 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-100"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile-First Navigation: Horizontal Scroll with Pills */}
                    <div className="flex overflow-x-auto pb-3 gap-3 no-scrollbar py-2">
                        {[
                            { id: 'DASHBOARD', icon: BarChart3, label: 'Bord' },
                            { id: 'MENU', icon: UtensilsCrossed, label: 'Menu' },
                            { id: 'CATEGORIES', icon: Tag, label: 'Tags' },
                            { id: 'TABLES', icon: MapPin, label: 'Salles' },
                            { id: 'RESERVATIONS', icon: Calendar, label: 'RVs' },
                            { id: 'PERSONNEL', icon: Users, label: 'Team' },
                            { id: 'STATS', icon: TrendingUp, label: 'Stats' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all whitespace-nowrap text-xs font-black uppercase tracking-wider border-2 ${activeTab === tab.id
                                    ? 'bg-[#03081F] border-[#03081F] text-white shadow-xl shadow-blue-900/20 scale-[1.03]'
                                    : 'bg-white border-transparent text-gray-400 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative">
                            <Loader className="w-12 h-12 animate-spin text-[#FC8A06]" />
                            <div className="absolute inset-0 bg-[#FC8A06]/10 rounded-full blur-xl animate-pulse"></div>
                        </div>
                        <p className="mt-6 font-black text-gray-400 uppercase tracking-widest text-[10px]">Initialisation du système...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 p-8 rounded-[2rem] border-2 border-red-100 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                            <AlertCircle size={32} />
                        </div>
                        <p className="font-bold text-red-700">{error}</p>
                        <Button variant="outline" size="sm" onClick={loadData}>Réessayer</Button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        {/* Live Notifications Banner */}
                        {(hasNewOrders || hasNewReservations) && (
                            <div className="flex flex-col gap-3">
                                {hasNewOrders && (
                                    <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
                                        <div className="flex items-center gap-3">
                                            <Bell className="animate-swing" />
                                            <span className="font-black text-xs uppercase tracking-widest">Nouvelle Commande Reçue !</span>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-white border-white/20" onClick={() => setHasNewOrders(false)}>X</Button>
                                    </div>
                                )}
                                {hasNewReservations && (
                                    <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <Calendar />
                                            <span className="font-black text-xs uppercase tracking-widest">Nouvelle Réservation à Confirmer !</span>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-white border-white/20" onClick={() => setHasNewReservations(false)}>X</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Dashboard View */}
                        {activeTab === 'DASHBOARD' && (
                            <div className="space-y-8 md:space-y-12">
                                {/* Welcome Header for Mobile */}
                                <div className="sm:hidden mb-6">
                                    <h2 className="text-3xl font-black text-[#03081F] tracking-tighter">HELLO, <span className="text-[#FC8A06] uppercase">{user?.prenom || 'CHEF'}</span></h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Voici le statut du restaurant</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    <KPICard icon={<Coins size={24} />} label="Revenus" value={`${stats?.chiffre_affaires_total?.toLocaleString()} FCFA`} trend={12} color="bg-emerald-500" />
                                    <KPICard icon={<Package size={24} />} label="Ventes" value={stats?.nombre_commandes || 0} trend={5} color="bg-blue-600" />
                                    <KPICard icon={<Users size={24} />} label="Clients" value={stats?.nombre_clients || 0} trend={-2} color="bg-indigo-600" />
                                    <KPICard icon={<Edit size={24} />} label="Feedback" value={`${stats?.note_moyenne?.toFixed(1)} / 5`} color="bg-[#FC8A06]" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                    <Card className="lg:col-span-2 p-6 md:p-8 border-none shadow-xl shadow-gray-100 rounded-[2.5rem] bg-white relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="font-black text-xl text-[#03081F] tracking-tighter uppercase">Analyse de Performance</h3>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Revenus vs Objectifs</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <div className="text-[9px] font-black text-emerald-600 uppercase">Live</div>
                                            </div>
                                        </div>
                                        <div className="h-[250px] md:h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={revenueStats}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#FC8A06" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#FC8A06" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F1F5F9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                                                        itemStyle={{ fontWeight: 900, color: '#03081F' }}
                                                    />
                                                    <Area type="monotone" dataKey="sales" stroke="#FC8A06" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>

                                    <div className="space-y-6">
                                        <Card className="bg-[#03081F] text-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC8A06]/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                            <h3 className="font-black text-xl mb-8 relative z-10 tracking-tighter uppercase">Activité Récente</h3>
                                            <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto no-scrollbar">
                                                {allCommandes.slice(0, 4).map((cmd, i) => (
                                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/item">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cmd.status === 'en_attente' ? 'bg-orange-500' : 'bg-emerald-500'
                                                            }`}>
                                                            <Clock size={16} className="text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-xs font-black uppercase tracking-tight">#{cmd.id}</p>
                                                                <span className="text-[8px] font-bold opacity-40 uppercase">{new Date(cmd.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p className="text-[10px] opacity-60 mt-1 font-medium">{cmd.montant_total.toLocaleString()} CFA • Table {cmd.table_id}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {allCommandes.length === 0 && (
                                                    <div className="text-center py-10 opacity-30">
                                                        <Package size={32} className="mx-auto mb-2" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Aucune activité</p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>

                                        <Card className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-50 relative overflow-hidden group">
                                            <h3 className="font-black text-xl mb-8 text-[#03081F] tracking-tighter uppercase italic">Best Sellers</h3>
                                            <div className="grid grid-cols-1 gap-5">
                                                {topPlats.slice(0, 3).map((plat, i) => (
                                                    <div key={i} className="flex items-center gap-4 group/item cursor-pointer p-2 rounded-2xl hover:bg-gray-50 transition-all">
                                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center font-black text-xs text-[#FC8A06] group-hover/item:bg-[#FC8A06] group-hover/item:text-white transition-all">
                                                            #{i + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm truncate uppercase tracking-tighter text-[#03081F]">{plat.nom}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <div className="h-1 bg-gray-100 rounded-full flex-1 overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-[#FC8A06] to-orange-400 rounded-full"
                                                                        style={{ width: `${Math.min(100, (plat.quantite_vendue / (topPlats[0]?.quantite_vendue || 1)) * 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-[9px] font-black text-gray-400">{plat.quantite_vendue} QTY</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </div>
                                </div>

                                {/* Active Reservations Section */}
                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-black text-2xl text-[#03081F] tracking-tighter uppercase italic">Réservations à venir</h3>
                                        <Button variant="ghost" onClick={() => setActiveTab('RESERVATIONS')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50">Voir tout</Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {reservations.slice(0, 4).map((res, i) => (
                                            <Card key={i} className="p-6 border-none shadow-lg hover:shadow-xl transition-all rounded-[2rem] bg-white border border-gray-50 flex flex-col justify-between group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <Calendar size={20} />
                                                    </div>
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${res.status === 'CONFIRMEE' ? 'bg-emerald-50 text-emerald-600' :
                                                        res.status === 'EN_ATTENTE' ? 'bg-yellow-50 text-yellow-600' :
                                                            'bg-gray-50 text-gray-400'
                                                        }`}>
                                                        {res.status === 'CONFIRMEE' ? 'Confirmé' :
                                                            res.status === 'EN_ATTENTE' ? 'En attente' : 'Annulé'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg text-[#03081F] uppercase tracking-tighter">Table {res.table_id}</p>
                                                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{new Date(res.date_reservation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} @ {new Date(res.date_reservation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                                                    <Users size={14} className="text-gray-300" />
                                                    <span className="text-[10px] font-black text-gray-500 uppercase">{res.nombre_personnes} PERSONNES</span>
                                                </div>
                                            </Card>
                                        ))}
                                        {reservations.length === 0 && (
                                            <div className="col-span-full py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-gray-300">
                                                <Calendar size={32} strokeWidth={1} />
                                                <p className="text-[10px] font-black uppercase mt-2 tracking-widest">Aucune réservation</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Menu View: Better Mobile Legibility */}
                        {activeTab === 'MENU' && (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="relative w-full md:w-96 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#FC8A06] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="RECHERCHER DANS LA CARTE..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-[#FC8A06]/10 outline-none text-sm font-bold uppercase tracking-wider"
                                        />
                                    </div>
                                    <Button fullWidth className="md:w-auto h-14 md:px-8 rounded-2xl text-xs uppercase" onClick={() => { setSelectedItem(null); setIsAddPlatOpen(true); }}>
                                        <Plus size={18} className="mr-2" strokeWidth={3} /> Nouveau Plat
                                    </Button>
                                </div>

                                {selectedCategory && (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtre actif :</span>
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className="flex items-center gap-2 bg-[#FC8A06] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                                        >
                                            {categories.find(c => c.id === selectedCategory)?.nom || 'Catégorie'}
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {plats.filter(p => (!searchQuery || p.nom.toLowerCase().includes(searchQuery.toLowerCase())) && (!selectedCategory || p.categorie_id === selectedCategory)).map(plat => (
                                        <Card key={plat.id} className="group border-none shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-orange-200/20 transition-all rounded-[2rem] overflow-hidden">
                                            <div className="h-56 relative overflow-hidden bg-gray-50">
                                                <img
                                                    src={getImageUrl(plat.image_url) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                                    alt={plat.nom}
                                                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!plat.disponible ? 'grayscale opacity-30' : ''}`}
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'; }}
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg border border-white">
                                                        {plat.categorie?.nom || 'Plat'}
                                                    </span>
                                                </div>
                                                {!plat.disponible && (
                                                    <div className="absolute inset-0 bg-[#03081F]/40 backdrop-blur-[2px] flex items-center justify-center p-6">
                                                        <div className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl rotate-[-5deg] border border-red-500">
                                                            Indisponible
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    <button onClick={() => { setSelectedItem(plat); setIsAddPlatOpen(true); }} className="p-2.5 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-white text-gray-700 hover:text-blue-600 transition-colors">
                                                        <Edit size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-black text-[#03081F] text-lg tracking-tighter uppercase leading-tight line-clamp-1">{plat.nom}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-2 h-2 rounded-full bg-[#FC8A06]"></div>)}
                                                            </div>
                                                            <span className="text-[9px] font-bold text-gray-400">BEST SELL</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[#FC8A06] font-black text-lg tracking-tighter">{plat.prix} <span className="text-[10px]">CFA</span></p>
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium line-clamp-2 h-8 mb-6">{plat.description || 'Aucune description disponible pour ce délice.'}</p>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { if (window.confirm('SUPPRIMER CE PLAT ?')) apiService.deletePlat(plat.id, getToken()).then(loadData); }}
                                                        className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all border border-red-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => apiService.updatePlat(plat.id, { disponible: !plat.disponible }, getToken()).then(loadData)}
                                                        className={`flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${plat.disponible
                                                            ? 'border-gray-100 text-gray-400 hover:bg-gray-50'
                                                            : 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'}`}
                                                    >
                                                        {plat.disponible ? 'STOCK OK' : 'REMETTRE'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categories View: Table for Desktop, Grid for Mobile */}
                        {activeTab === 'CATEGORIES' && (
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100">
                                    <div>
                                        <h2 className="text-2xl font-black text-[#03081F] tracking-tighter uppercase">Tags & Catégories</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Gérez l'organisation de votre menu</p>
                                    </div>
                                    <Button size="sm" className="w-full sm:w-auto px-6 h-12 rounded-xl text-[10px]" onClick={() => setIsAddCategorieOpen(true)}>
                                        <Plus size={16} className="mr-2" /> AJOUTER
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {categories.map(cat => (
                                        <div
                                            key={cat.id}
                                            onClick={() => { setSelectedCategory(cat.id); setActiveTab('MENU'); }}
                                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:translate-x-1 transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#FC8A06] border border-gray-100 font-black text-xl">
                                                    {(cat.nom?.[0] || '?').toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-[#03081F] uppercase tracking-tighter">{cat.nom || 'Sans nom'}</h4>
                                                    <p className="text-xs text-gray-400 font-medium line-clamp-1 max-w-[200px] md:max-w-md">{cat.description || 'Catégorie de mets savoureux.'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedItem(cat);
                                                        setCategorieForm({ nom: cat.nom, description: cat.description || '' });
                                                        setIsAddCategorieOpen(true);
                                                    }}
                                                    className="p-3 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { if (window.confirm('SUPPRIMER ?')) apiService.deleteCategorie(cat.id, getToken()).then(loadData); }}
                                                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tables Tab: Plan de Salle Mobile Optimized */}
                        {activeTab === 'TABLES' && (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-[#03081F] tracking-tighter uppercase">Plan de Salle</h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black text-gray-400 uppercase">Libre</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] font-black text-gray-400 uppercase">Occupé</span></div>
                                        </div>
                                    </div>
                                    <Button variant="primary" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-xs uppercase" onClick={() => { setSelectedItem(null); setIsAddTableOpen(true); }}>
                                        <Plus size={18} className="mr-2" /> Nouvelle Table
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                                    {tables.map(table => (
                                        <button
                                            key={table.id}
                                            onClick={() => { setSelectedItem(table); setIsAddTableOpen(true); }}
                                            className={`aspect-square rounded-[2.5rem] flex flex-col items-center justify-center gap-2 border-2 transition-all hover:scale-105 active:scale-95 shadow-lg relative overflow-hidden group ${table.statut === TableStatus.LIBRE
                                                ? 'border-emerald-100 bg-white text-emerald-600'
                                                : table.statut === TableStatus.OCCUPEE ? 'border-red-100 bg-red-50/50 text-red-600'
                                                    : 'border-orange-100 bg-orange-50/50 text-orange-600'
                                                }`}
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/40 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
                                            <div className={`p-4 rounded-2xl mb-1 shadow-xl relative z-10 transition-transform group-hover:rotate-12 ${table.statut === TableStatus.LIBRE ? 'bg-emerald-500' : table.statut === TableStatus.OCCUPEE ? 'bg-red-500' : 'bg-orange-500'} text-white`}>
                                                <Users size={20} />
                                            </div>
                                            <span className="font-black text-3xl tracking-tighter relative z-10">T{table.numero_table}</span>
                                            <div className="flex items-center gap-2 relative z-10">
                                                <div className={`w-1.5 h-1.5 rounded-full ${table.statut === TableStatus.LIBRE ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{table.capacite} PLACES</span>
                                            </div>

                                            {table.statut === TableStatus.OCCUPEE && (
                                                <div className="absolute top-6 right-6 w-2 h-2 bg-red-500 rounded-full border border-white animate-ping"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Personnel Tab */}
                        {activeTab === 'PERSONNEL' && (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h2 className="text-3xl font-black text-[#03081F] tracking-tighter uppercase">L'Équipe</h2>
                                    <Button variant="primary" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-xs" onClick={() => setIsAddPersonnelOpen(true)}>
                                        <UserPlus size={18} className="mr-2" /> Nouveau Membre
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {personnel.map(p => (
                                        <Card key={p.id} className="p-8 border-none shadow-xl shadow-gray-100 flex items-center gap-6 relative overflow-hidden group rounded-[2.5rem] bg-white transition-all hover:shadow-2xl hover:-translate-y-1">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                                            <div className="relative">
                                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl relative z-10 ${p.role === 'GERANT' ? 'bg-[#FC8A06] shadow-orange-300' : p.role === 'CUISINIER' ? 'bg-red-500 shadow-red-300' : 'bg-blue-600 shadow-blue-300'
                                                    }`}>
                                                    {p.nom?.[0] || 'U'}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full z-20"></div>
                                            </div>
                                            <div className="flex-1 min-w-0 relative z-10">
                                                <h4 className="font-black text-xl text-[#03081F] truncate uppercase tracking-tighter">{p.prenom} {p.nom}</h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${p.role === 'GERANT' ? 'bg-orange-50 text-orange-600' :
                                                        p.role === 'CUISINIER' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {p.role}
                                                    </span>
                                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Actif</span>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Mail size={12} className="text-gray-300" />
                                                        <p className="text-[10px] font-bold text-gray-400 truncate">{p.email}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Phone size={12} className="text-gray-300" />
                                                        <p className="text-[10px] font-bold text-gray-400 truncate">{p.telephone || '-- -- -- --'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-6 right-6 flex gap-2">
                                                <button onClick={() => { setSelectedItem(p); setIsAddPersonnelOpen(true); }} className="p-3 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { if (window.confirm('SUPPRIMER CE MEMBRE ?')) apiService.deletePersonnel(p.id, getToken()).then(loadData); }}
                                                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reservations: Using the dedicated Manager view */}
                        {activeTab === 'RESERVATIONS' && (
                            <div className="animate-in fade-in duration-700 h-[calc(100vh-280px)] overflow-hidden">
                                <ReservationManagerView />
                            </div>
                        )}

                        {/* Stats View: Elaborated */}
                        {activeTab === 'STATS' && (
                            <div className="space-y-12 pb-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <KPICard icon={<Coins size={24} />} label="Total cumulé" value={`${stats?.chiffre_affaires_total?.toLocaleString()} FCFA`} trend={15} color="bg-emerald-500" />
                                    <KPICard icon={<TrendingUp size={24} />} label="Conversion" value="64%" trend={8} color="bg-blue-500" />
                                    <KPICard icon={<Users size={24} />} label="Clientèle" value={stats?.nombre_clients || 0} trend={12} color="bg-indigo-500" />
                                    <KPICard icon={<Bell size={24} />} label="Avis" value={`${stats?.note_moyenne?.toFixed(1)} / 5`} color="bg-[#FC8A06]" />
                                </div>

                                <Card className="p-8 border-none shadow-2xl shadow-gray-100 rounded-[3rem]">
                                    <h3 className="font-black text-2xl text-[#03081F] mb-10 tracking-tighter uppercase">Analyse des Ventes</h3>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueStats}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', padding: '20px' }}
                                                />
                                                <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <Card className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-gray-100">
                                        <h3 className="font-black text-2xl mb-8 text-[#03081F] tracking-tighter uppercase">Revenus Journaliers</h3>
                                        <div className="overflow-x-auto no-scrollbar">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-50">
                                                        <th className="pb-6 text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">Date</th>
                                                        <th className="pb-6 text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] text-right">Revenu</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {revenueStats.slice().reverse().map((day: any, i: number) => (
                                                        <tr key={i} className="group hover:bg-gray-50 transition-colors">
                                                            <td className="py-4 text-sm font-bold text-[#03081F]">
                                                                {day.date ? new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }) : day.name}
                                                            </td>
                                                            <td className="py-4 text-right">
                                                                <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-black">
                                                                    {day.sales.toLocaleString()} FCFA
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {revenueStats.length === 0 && (
                                                        <tr>
                                                            <td colSpan={2} className="py-8 text-center text-gray-400 text-sm font-bold opacity-50">
                                                                Aucune donnée disponible
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>

                                    <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-gray-100">
                                        <h3 className="font-black text-2xl mb-8 text-[#03081F] tracking-tighter uppercase">Leaderboard Produits</h3>
                                        <div className="overflow-x-auto no-scrollbar">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-50">
                                                        <th className="pb-6 text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">Rang</th>
                                                        <th className="pb-6 text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">Nom du Plat</th>
                                                        <th className="pb-6 text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] text-right">Prix Unit.</th>
                                                        <th className="pb-6 text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] text-right">Volume</th>
                                                        <th className="pb-6 text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] text-right">C.A</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {topPlats.map((plat, i) => (
                                                        <tr key={i} className="group cursor-pointer">
                                                            <td className="py-6">
                                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${i < 3 ? 'bg-[#FC8A06] text-white shadow-xl shadow-orange-200' : 'bg-gray-100 text-gray-400'}`}>
                                                                    #{i + 1}
                                                                </span>
                                                            </td>
                                                            <td className="py-6 font-black text-[#03081F] uppercase tracking-tighter group-hover:text-[#FC8A06] transition-colors">{plat.nom}</td>
                                                            <td className="py-6 text-right font-bold text-gray-400">
                                                                {(plat.chiffre_affaires && plat.quantite_vendue)
                                                                    ? (plat.chiffre_affaires / plat.quantite_vendue).toFixed(0)
                                                                    : '-'} <span className="text-[10px]">CFA</span>
                                                            </td>
                                                            <td className="py-6 text-right font-black text-[#03081F]">{plat.quantite_vendue}</td>
                                                            <td className="py-6 text-right font-black text-emerald-500">{plat.chiffre_affaires?.toLocaleString()} <span className="text-[10px]">CFA</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modals: Styling remains powerful */}
            <Modal isOpen={isAddPlatOpen} onClose={() => { setIsAddPlatOpen(false); setSelectedItem(null); }} title={selectedItem ? "Modifier le Plat" : "Ajouter un Plat"}>
                <div className="space-y-6">
                    <FormInput label="Nom du plat" value={platForm.nom} onChange={v => setPlatForm({ ...platForm, nom: v })} placeholder="Ex: Poulet Yassa" required icon={<UtensilsCrossed size={18} />} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Prix (FCFA)" type="number" value={platForm.prix} onChange={v => setPlatForm({ ...platForm, prix: parseInt(v) })} icon={<Coins size={18} />} />
                        <FormInput label="Temps (min)" type="number" value={platForm.temps_preparation} onChange={v => setPlatForm({ ...platForm, temps_preparation: parseInt(v) })} icon={<Clock size={18} />} />
                    </div>
                    <FormSelect
                        label="Catégorie"
                        value={platForm.categorie_id}
                        onChange={v => setPlatForm({ ...platForm, categorie_id: parseInt(v) })}
                        options={[{ value: 0, label: 'Choisir une catégorie' }, ...categories.map(c => ({ value: c.id, label: c.nom }))]}
                        icon={<Tag size={18} />}
                    />
                    <FormInput label="URL de l'image" value={platForm.image_url} onChange={v => setPlatForm({ ...platForm, image_url: v })} placeholder="https://..." icon={<Package size={18} />} />
                    <FormTextarea label="Description" value={platForm.description} onChange={v => setPlatForm({ ...platForm, description: v })} />
                    <ToggleSwitch label="Disponible" checked={platForm.disponible} onChange={v => setPlatForm({ ...platForm, disponible: v })} description="Afficher ce plat dans le menu client" />
                    <Button fullWidth onClick={handleSavePlat} className="h-16 rounded-2xl shadow-2xl shadow-orange-500/20 uppercase" disabled={actionLoading}>
                        {actionLoading ? <Loader className="animate-spin" /> : <><Save size={20} /> ENREGISTRER</>}
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isAddTableOpen} onClose={() => { setIsAddTableOpen(false); setSelectedItem(null); }} title={selectedItem ? "Modifier la Table" : "Nouvelle Table"}>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Numéro de Table" value={tableForm.numero_table} onChange={v => setTableForm({ ...tableForm, numero_table: v })} placeholder="Ex: 5" icon={<Hash size={18} />} />
                        <FormInput label="Capacité" type="number" value={tableForm.capacite} onChange={v => setTableForm({ ...tableForm, capacite: parseInt(v) })} icon={<Users size={18} />} />
                    </div>
                    <FormSelect
                        label="Statut Initial"
                        value={tableForm.statut}
                        onChange={v => setTableForm({ ...tableForm, statut: v as TableStatus })}
                        options={[
                            { value: TableStatus.LIBRE, label: 'LIBRE' },
                            { value: TableStatus.OCCUPEE, label: 'OCCUPÉE' },
                            { value: TableStatus.RESERVEE, label: 'RÉSERVÉE' }
                        ]}
                        icon={<MapPin size={18} />}
                    />
                    <Button fullWidth onClick={handleSaveTable} className="h-16 rounded-2xl uppercase" disabled={actionLoading}>
                        {actionLoading ? <Loader className="animate-spin" /> : <Save size={20} />} Validé
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isAddPersonnelOpen} onClose={() => setIsAddPersonnelOpen(false)} title="Recruter un Membre">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Nom" value={personnelForm.nom} onChange={v => setPersonnelForm({ ...personnelForm, nom: v })} icon={<Users size={18} />} />
                        <FormInput label="Prénom" value={personnelForm.prenom} onChange={v => setPersonnelForm({ ...personnelForm, prenom: v })} icon={<Users size={18} />} />
                    </div>
                    <FormInput label="Email" type="email" value={personnelForm.email} onChange={v => setPersonnelForm({ ...personnelForm, email: v })} icon={<Mail size={18} />} />
                    <FormInput label="Téléphone" value={personnelForm.telephone} onChange={v => setPersonnelForm({ ...personnelForm, telephone: v })} icon={<Phone size={18} />} />
                    <FormInput label="Mot de passe" type="password" value={personnelForm.password} onChange={v => setPersonnelForm({ ...personnelForm, password: v })} icon={<Lock size={18} />} />
                    <FormSelect
                        label="Poste"
                        value={personnelForm.role}
                        onChange={v => setPersonnelForm({ ...personnelForm, role: v as any })}
                        options={[
                            { value: 'SERVEUR', label: 'SERVEUR / SERVEUSE' },
                            { value: 'CUISINIER', label: 'CHEF DE CUISINE' },
                            { value: 'GERANT', label: 'ADMINISTRATEUR' }
                        ]}
                    />
                    <Button fullWidth onClick={handleSavePersonnel} className="h-16 rounded-2xl uppercase" disabled={actionLoading}>
                        {actionLoading ? <Loader className="animate-spin" /> : <><UserPlus size={20} /> Embaucher</>}
                    </Button>
                </div>
            </Modal>


            <Modal isOpen={isAddCategorieOpen} onClose={() => { setIsAddCategorieOpen(false); setSelectedItem(null); setCategorieForm({ nom: '', description: '' }); }} title={selectedItem ? "Modifier la Catégorie" : "Nouvelle Catégorie"}>
                <div className="space-y-6">
                    <FormInput label="Nom de la catégorie" value={categorieForm.nom} onChange={v => setCategorieForm({ ...categorieForm, nom: v })} placeholder="Ex: Entrées, Desserts..." icon={<Tag size={18} />} />
                    <FormTextarea label="Description" value={categorieForm.description} onChange={v => setCategorieForm({ ...categorieForm, description: v })} />
                    <Button fullWidth onClick={handleSaveCategorie} className="h-16 rounded-2xl uppercase" disabled={actionLoading}>
                        {actionLoading ? <Loader className="animate-spin" /> : <Save size={20} />} {selectedItem ? "Enregistrer" : "Créer la catégorie"}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
