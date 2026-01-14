import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api.service';
import { UserRole } from '../types';

interface User {
    id: number;
    email: string;
    role: UserRole;
    nom?: string;
    prenom?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => {
        try {
            // Utiliser sessionStorage pour que la session expire à la fermeture de l'onglet
            return sessionStorage.getItem('auth_token');
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const init = async () => {
            try {
                if (token) {
                    const userData = await apiService.getCurrentUser(token);
                    setUser({
                        id: userData.id,
                        email: userData.email,
                        role: (userData.role?.toLowerCase?.() || userData.role) as UserRole,
                        nom: userData.nom,
                        prenom: userData.prenom,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                try { sessionStorage.removeItem('auth_token'); } catch { }
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [token]);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiService.login(email, password);
            const accessToken = response.access_token;

            setToken(accessToken);
            try { sessionStorage.setItem('auth_token', accessToken); } catch { }

            // Fetch user details
            const userData = await apiService.getCurrentUser(accessToken);
            setUser({
                id: userData.id,
                email: userData.email,
                role: (userData.role?.toLowerCase?.() || userData.role) as UserRole,
                nom: userData.nom,
                prenom: userData.prenom,
            });
        } catch (error) {
            // Normalize and rethrow error with readable message
            const message = (error as any)?.message || 'Échec de la connexion';
            // Clear any stale token
            try { sessionStorage.removeItem('auth_token'); } catch { }
            setToken(null);
            setUser(null);
            throw new Error(message);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        try { sessionStorage.removeItem('auth_token'); } catch { }
    };

    const loginAsGuest = () => {
        // Create a temporary client session without token
        setUser({
            id: 0,
            email: 'guest@local',
            role: UserRole.CLIENT,
            nom: 'Invité',
            prenom: ''
        });
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                login,
                logout,
                setUser,
                loginAsGuest,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
