import { API_CONFIG } from '../config/api.config';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private getHeaders(token?: string, isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = await response.json();
        // Extract the most relevant error message
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return {} as T;
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 30000); // 30s timeout
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        method: 'GET',
        headers: this.getHeaders(token),
        signal: controller.signal,
      });
      clearTimeout(id);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'POST',
      headers: this.getHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async postFormData<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'POST',
      headers: this.getHeaders(token, true),
      body: formData,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<T>(response);
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-store',
      },
      body: formData.toString(),
    });

    return this.handleResponse(response);
  }

  async verifyEmail(token: string): Promise<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.AUTH.VERIFY}?token=${token}`);
  }

  /**
   * Decode JWT token to extract payload
   */
  private decodeJWT(token: string): { sub?: string; exp?: number } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Get current user from token by decoding JWT and fetching user by email
   */
  async getCurrentUser(token: string): Promise<any> {
    // Decode JWT to get email (sub claim)
    const payload = this.decodeJWT(token);
    if (!payload?.sub) {
      throw new Error('Token invalide');
    }

    const email = payload.sub;
    // Fetch user by email
    return this.get(API_CONFIG.ENDPOINTS.UTILISATEURS.BY_EMAIL(email), { token });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string, token: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.UTILISATEURS.BY_EMAIL(email), { token });
  }

  // Categories endpoints
  async getCategories(token?: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.CATEGORIES.BASE, { token });
  }

  async getCategoryById(id: number, token?: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.CATEGORIES.BY_ID(id), { token });
  }

  // Plats endpoints
  async getPlats(token?: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.PLATS.BASE, { token });
  }

  async getPlatById(id: number, token?: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.PLATS.BY_ID(id), { token });
  }

  async createPlat(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.PLATS.BASE, data, { token });
  }

  async updatePlat(id: number, data: any, token: string): Promise<any> {
    return this.put(API_CONFIG.ENDPOINTS.PLATS.BY_ID(id), data, { token });
  }

  async deletePlat(id: number, token: string): Promise<any> {
    return this.delete(API_CONFIG.ENDPOINTS.PLATS.BY_ID(id), { token });
  }

  async uploadPlatImage(platId: number, file: File, token: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.postFormData(API_CONFIG.ENDPOINTS.PLATS.IMAGE(platId), formData, { token });
  }

  // Categories endpoints (Gerant)
  async createCategorie(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.CATEGORIES.BASE, data, { token });
  }

  async updateCategorie(id: number, data: any, token: string): Promise<any> {
    return this.put(API_CONFIG.ENDPOINTS.CATEGORIES.BY_ID(id), data, { token });
  }

  async deleteCategorie(id: number, token: string): Promise<any> {
    return this.delete(API_CONFIG.ENDPOINTS.CATEGORIES.BY_ID(id), { token });
  }

  // Commandes endpoints
  async createCommande(data: any, token?: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.COMMANDES.BASE, data, { token });
  }

  async getCommande(id: number, token?: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.COMMANDES.BY_ID(id), { token });
  }

  async getCommandes(token?: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.COMMANDES.BASE, { token });
  }

  async addLigneCommande(commandeId: number, data: any, token?: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.COMMANDES.LIGNES(commandeId), data, { token });
  }

  async validerCommande(commandeId: number, serveurId: number, token: string): Promise<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.COMMANDES.VALIDER(commandeId)}?serveur_id=${serveurId}`, {}, { token });
  }

  async refuserCommande(commandeId: number, serveurId: number, raison: string, token: string): Promise<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.COMMANDES.REFUSER(commandeId)}?serveur_id=${serveurId}`, { raison }, { token });
  }

  async preparerCommande(commandeId: number, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.COMMANDES.PREPARER(commandeId), {}, { token });
  }

  async commandePrete(commandeId: number, cuisinierId: number, token: string): Promise<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.COMMANDES.PRETE(commandeId)}?cuisinier_id=${cuisinierId}`, {}, { token });
  }

  async servirCommande(commandeId: number, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.COMMANDES.SERVIR(commandeId), {}, { token });
  }

  async payerCommande(commandeId: number, methode: string, token?: string): Promise<any> {
    return this.post(`${API_CONFIG.ENDPOINTS.COMMANDES.PAYEE(commandeId)}?methode=${methode}`, {}, { token });
  }

  async receptionnerCommande(commandeId: number, token?: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.COMMANDES.RECEPTIONNER(commandeId), {}, { token });
  }

  // Tables endpoints
  async getTables(token?: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.TABLES.BASE, { token });
  }

  async getTableById(id: number, token?: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.TABLES.BY_ID(id), { token });
  }

  async getTableByQR(qrCode: string, token?: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.TABLES.BY_QR(qrCode), { token });
  }

  async createTable(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.TABLES.BASE, data, { token });
  }

  async updateTable(id: number, data: any, token: string): Promise<any> {
    return this.put(API_CONFIG.ENDPOINTS.TABLES.BY_ID(id), data, { token });
  }

  async deleteTable(id: number, token: string): Promise<any> {
    return this.delete(API_CONFIG.ENDPOINTS.TABLES.BY_ID(id), { token });
  }

  async occuperTable(id: number, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.TABLES.OCCUPER(id), {}, { token });
  }

  async libererTable(id: number, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.TABLES.LIBERER(id), {}, { token });
  }

  // Reservations endpoints
  async createReservation(data: any, token?: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.RESERVATIONS.BASE, data, { token });
  }

  async getReservations(token?: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.RESERVATIONS.BASE, { token });
  }

  async getReservationById(id: number, token?: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.RESERVATIONS.BY_ID(id), { token });
  }

  async updateReservation(id: number, data: any, token: string): Promise<any> {
    return this.put(API_CONFIG.ENDPOINTS.RESERVATIONS.BY_ID(id), data, { token });
  }

  async deleteReservation(id: number, token: string): Promise<any> {
    return this.delete(API_CONFIG.ENDPOINTS.RESERVATIONS.BY_ID(id), { token });
  }

  async checkDisponibilite(tableId: number, dateReservation: string, token?: string): Promise<any> {
    return this.get(
      `${API_CONFIG.ENDPOINTS.RESERVATIONS.DISPONIBILITE}?table_id=${tableId}&date_reservation=${dateReservation}`,
      { token }
    );
  }

  async confirmerReservation(id: number, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.RESERVATIONS.CONFIRMER(id), {}, { token });
  }

  async annulerReservation(id: number, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.RESERVATIONS.ANNULER(id), {}, { token });
  }

  // Avis endpoints
  async createAvis(data: any, token?: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.AVIS.BASE, data, { token });
  }

  async getAvis(token?: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.AVIS.BASE, { token });
  }

  // Paiements endpoints
  async processPayment(data: any, token?: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.PAIEMENTS.BASE, data, { token });
  }

  async getAddition(commandeId: number, token?: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.PAIEMENTS.ADDITION(commandeId), { token });
  }

  // Stats endpoints (Gerant only)
  async getStatsGlobal(token: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.STATS.GLOBAL, { token });
  }

  async getTopPlats(token: string, limit: number = 5): Promise<any[]> {
    return this.get(`${API_CONFIG.ENDPOINTS.STATS.TOP_PLATS}?limit=${limit}`, { token });
  }

  async getRevenueStats(token: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.STATS.REVENUE, { token });
  }

  async getDashboard(token: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.STATS.DASHBOARD, { token });
  }

  // Clients endpoints
  async registerClient(data: any): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.CLIENTS.REGISTER, data);
  }

  async getClient(id: number, token: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.CLIENTS.BY_ID(id), { token });
  }

  // Personnel endpoints
  async getPersonnel(token: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.PERSONNEL.BASE, { token });
  }

  async getPersonnelById(id: number, token: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.PERSONNEL.BY_ID(id), { token });
  }

  async deletePersonnel(id: number, token: string): Promise<any> {
    return this.delete(API_CONFIG.ENDPOINTS.PERSONNEL.BY_ID(id), { token });
  }

  async registerGerant(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.PERSONNEL.GERANTS, data, { token });
  }

  async registerServeur(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.PERSONNEL.SERVEURS, data, { token });
  }

  async registerCuisinier(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.PERSONNEL.CUISINIERS, data, { token });
  }

  // Utilisateurs endpoints
  async getUtilisateurs(token: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.UTILISATEURS.BASE, { token });
  }

  async getUtilisateurById(id: number, token: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.UTILISATEURS.BY_ID(id), { token });
  }

  async deleteUtilisateur(id: number, token: string): Promise<any> {
    return this.delete(API_CONFIG.ENDPOINTS.UTILISATEURS.BY_ID(id), { token });
  }

  /**
   * Récupère le personnel avec les informations utilisateur enrichies
   * Fait une jointure côté client entre personnel et utilisateurs
   */
  async getPersonnelWithDetails(token: string): Promise<any[]> {
    try {
      // Récupérer la liste du personnel
      const personnelList = await this.getPersonnel(token);

      // Récupérer tous les utilisateurs
      const utilisateurs = await this.getUtilisateurs(token);

      // Créer un map des utilisateurs par ID
      const utilisateursMap = new Map(utilisateurs.map(u => [u.id, u]));

      // Enrichir chaque membre du personnel avec les infos utilisateur
      return personnelList.map(p => {
        const user = utilisateursMap.get(p.utilisateur_id);
        return {
          ...p,
          nom: user?.nom || '',
          prenom: user?.prenom || '',
          email: user?.email || '',
          telephone: user?.telephone || '',
          role: user?.role || 'PERSONNEL'
        };
      });
    } catch (error) {
      console.error('Error fetching personnel with details:', error);
      return [];
    }
  }

  // Menus endpoints
  async getMenus(token?: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.MENUS.BASE, { token });
  }

  async getMenuById(id: number, token?: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.MENUS.BY_ID(id), { token });
  }

  async createMenu(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.MENUS.BASE, data, { token });
  }

  async updateMenu(id: number, data: any, token: string): Promise<any> {
    return this.put(API_CONFIG.ENDPOINTS.MENUS.BY_ID(id), data, { token });
  }

  async deleteMenu(id: number, token: string): Promise<any> {
    return this.delete(API_CONFIG.ENDPOINTS.MENUS.BY_ID(id), { token });
  }

  async addPlatToMenu(menuId: number, platId: number, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.MENUS.ADD_PLAT(menuId, platId), {}, { token });
  }

  async removePlatFromMenu(menuId: number, platId: number, token: string): Promise<any> {
    return this.delete(API_CONFIG.ENDPOINTS.MENUS.REMOVE_PLAT(menuId, platId), { token });
  }
}

export const apiService = new ApiService();
