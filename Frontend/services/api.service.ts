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
      const error = await response.json().catch(() => ({ detail: 'Une erreur est survenue' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return {} as T;
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse<T>(response);
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
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.TOKEN}`, {
      method: 'POST',
      body: formData,
    });
    
    return this.handleResponse(response);
  }

  async verifyEmail(token: string): Promise<any> {
    return this.get(`${API_CONFIG.ENDPOINTS.AUTH.VERIFY}?token=${token}`);
  }

  async getCurrentUser(token: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.ME, { token });
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

  async uploadPlatImage(platId: number, file: File, token: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.postFormData(API_CONFIG.ENDPOINTS.PLATS.IMAGE(platId), formData, { token });
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

  // Tables endpoints
  async getTables(token?: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.TABLES.BASE, { token });
  }

  async getTableByQR(qrCode: string, token?: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.TABLES.BY_QR(qrCode), { token });
  }

  async createTable(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.TABLES.BASE, data, { token });
  }

  // Reservations endpoints
  async createReservation(data: any, token?: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.RESERVATIONS.BASE, data, { token });
  }

  async getReservations(token?: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.RESERVATIONS.BASE, { token });
  }

  async checkDisponibilite(tableId: number, dateReservation: string, token?: string): Promise<any> {
    return this.get(
      `${API_CONFIG.ENDPOINTS.RESERVATIONS.DISPONIBILITE}?table_id=${tableId}&date_reservation=${dateReservation}`,
      { token }
    );
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

  async getTopPlats(token: string): Promise<any[]> {
    return this.get(API_CONFIG.ENDPOINTS.STATS.TOP_PLATS, { token });
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

  async registerGerant(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.PERSONNEL.GERANTS, data, { token });
  }

  async registerServeur(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.PERSONNEL.SERVEURS, data, { token });
  }

  async registerCuisinier(data: any, token: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.PERSONNEL.CUISINIERS, data, { token });
  }
}

export const apiService = new ApiService();
