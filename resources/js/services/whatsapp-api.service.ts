/**
 * WhatsApp API Service
 *
 * Service untuk komunikasi dengan Laravel backend API
 * untuk semua fitur WhatsApp (Sessions, Broadcasts, Messages, dll)
 */

import axios, { AxiosInstance } from 'axios';

// Types
export interface WhatsAppSession {
  id: number;
  user_id: number;
  session_id: string;
  name: string;
  phone_number: string | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'qr_ready' | 'failed';
  qr_code: string | null;
  last_connected_at: string | null;
  last_disconnected_at: string | null;
  webhook_url: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: number;
  whatsapp_session_id: number;
  message_id: string;
  from_number: string;
  to_number: string;
  direction: 'incoming' | 'outgoing';
  type: string;
  content: string | null;
  media_metadata: any;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  is_auto_reply: boolean;
  auto_reply_source: string | null;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface WhatsAppBroadcast {
  id: number;
  whatsapp_session_id: number;
  user_id: number;
  name: string;
  template: {
    type: 'text' | 'image' | 'document';
    content: string;
    mediaUrl?: string;
    variables?: Record<string, string>;
  };
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  batch_size: number;
  batch_delay_ms: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppContact {
  id: number;
  whatsapp_session_id: number;
  phone_number: string;
  name: string | null;
  is_business: boolean;
  is_group: boolean;
  profile_picture_url: string | null;
  metadata: any;
  last_interaction_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppAutoReply {
  id: number;
  whatsapp_session_id: number;
  name: string;
  trigger_type: 'keyword' | 'regex' | 'all';
  trigger_value: string | null;
  reply_type: 'custom' | 'openai' | 'rajaongkir';
  reply_content: string | null;
  openai_prompt: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

// Pagination Response
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// API Service Class
class WhatsAppApiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: '/admin/whatsapp',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // Add CSRF token to all requests
    this.axios.interceptors.request.use((config) => {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
      }
      return config;
    });
  }

  // ============================================================================
  // SESSIONS
  // ============================================================================

  async getSessions(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<WhatsAppSession>> {
    const response = await this.axios.get('/sessions', { params });
    return response.data;
  }

  async getSession(id: number): Promise<WhatsAppSession> {
    const response = await this.axios.get(`/sessions/${id}`);
    return response.data;
  }

  async createSession(data: {
    name: string;
    webhook_url?: string;
    settings?: any;
  }): Promise<WhatsAppSession> {
    const response = await this.axios.post('/sessions', data);
    return response.data;
  }

  async updateSession(id: number, data: {
    name?: string;
    webhook_url?: string;
    settings?: any;
  }): Promise<WhatsAppSession> {
    const response = await this.axios.put(`/sessions/${id}`, data);
    return response.data;
  }

  async deleteSession(id: number): Promise<void> {
    await this.axios.delete(`/sessions/${id}`);
  }

  async connectSession(id: number): Promise<void> {
    await this.axios.post(`/sessions/${id}/connect`);
  }

  async disconnectSession(id: number): Promise<void> {
    await this.axios.post(`/sessions/${id}/disconnect`);
  }

  async logoutSession(id: number): Promise<void> {
    await this.axios.post(`/sessions/${id}/logout`);
  }

  // ============================================================================
  // BROADCASTS
  // ============================================================================

  async getBroadcasts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    session_id?: number;
  }): Promise<PaginatedResponse<WhatsAppBroadcast>> {
    const response = await this.axios.get('/broadcasts', { params });
    return response.data;
  }

  async getBroadcast(id: number): Promise<WhatsAppBroadcast> {
    const response = await this.axios.get(`/broadcasts/${id}`);
    return response.data;
  }

  async createBroadcast(data: {
    whatsapp_session_id: number;
    name: string;
    template: {
      type: 'text' | 'image' | 'document';
      content: string;
      mediaUrl?: string;
      variables?: Record<string, string>;
    };
    recipients: Array<{
      phoneNumber: string;
      name?: string;
    }>;
    scheduled_at?: string;
    batch_size?: number;
    batch_delay_ms?: number;
  }): Promise<WhatsAppBroadcast> {
    const response = await this.axios.post('/broadcasts', data);
    return response.data;
  }

  async updateBroadcast(id: number, data: Partial<{
    name: string;
    template: any;
    scheduled_at: string;
    batch_size: number;
    batch_delay_ms: number;
  }>): Promise<WhatsAppBroadcast> {
    const response = await this.axios.put(`/broadcasts/${id}`, data);
    return response.data;
  }

  async deleteBroadcast(id: number): Promise<void> {
    await this.axios.delete(`/broadcasts/${id}`);
  }

  async executeBroadcast(id: number): Promise<void> {
    await this.axios.post(`/broadcasts/${id}/execute`);
  }

  async cancelBroadcast(id: number): Promise<void> {
    await this.axios.post(`/broadcasts/${id}/cancel`);
  }

  async getBroadcastStatistics(): Promise<{
    total_campaigns: number;
    active_campaigns: number;
    completed_campaigns: number;
    total_messages_sent: number;
    success_rate: number;
  }> {
    const response = await this.axios.get('/broadcasts/statistics');
    return response.data;
  }

  // ============================================================================
  // MESSAGES
  // ============================================================================

  async getMessages(params?: {
    page?: number;
    per_page?: number;
    session_id?: number;
    direction?: 'incoming' | 'outgoing';
    phone_number?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<WhatsAppMessage>> {
    const response = await this.axios.get('/messages', { params });
    return response.data;
  }

  async getMessage(id: number): Promise<WhatsAppMessage> {
    const response = await this.axios.get(`/messages/${id}`);
    return response.data;
  }

  async getConversation(sessionId: number, phoneNumber: string, params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<WhatsAppMessage>> {
    const response = await this.axios.get(`/messages/conversation/${sessionId}/${phoneNumber}`, { params });
    return response.data;
  }

  async sendMessage(data: {
    session_id: number;
    to_number: string;
    type: 'text' | 'image' | 'document';
    content?: string;
    media_url?: string;
  }): Promise<WhatsAppMessage> {
    const response = await this.axios.post('/messages/send', data);
    return response.data;
  }

  // ============================================================================
  // CONTACTS
  // ============================================================================

  async getContacts(params?: {
    page?: number;
    per_page?: number;
    session_id?: number;
    search?: string;
    is_business?: boolean;
    is_group?: boolean;
  }): Promise<PaginatedResponse<WhatsAppContact>> {
    const response = await this.axios.get('/contacts', { params });
    return response.data;
  }

  async getContact(id: number): Promise<WhatsAppContact> {
    const response = await this.axios.get(`/contacts/${id}`);
    return response.data;
  }

  async syncContacts(sessionId: number): Promise<{ synced: number }> {
    const response = await this.axios.post(`/contacts/sync/${sessionId}`);
    return response.data;
  }

  async importContacts(sessionId: number, contacts: Array<{
    phone_number: string;
    name?: string;
  }>): Promise<{ imported: number }> {
    const response = await this.axios.post(`/contacts/import/${sessionId}`, { contacts });
    return response.data;
  }

  async exportContacts(sessionId: number, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await this.axios.get(`/contacts/export/${sessionId}`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteContact(id: number): Promise<void> {
    await this.axios.delete(`/contacts/${id}`);
  }

  // ============================================================================
  // AUTO-REPLIES
  // ============================================================================

  async getAutoReplies(params?: {
    page?: number;
    per_page?: number;
    session_id?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<WhatsAppAutoReply>> {
    const response = await this.axios.get('/auto-replies', { params });
    return response.data;
  }

  async getAutoReply(id: number): Promise<WhatsAppAutoReply> {
    const response = await this.axios.get(`/auto-replies/${id}`);
    return response.data;
  }

  async createAutoReply(data: {
    whatsapp_session_id: number;
    name: string;
    trigger_type: 'keyword' | 'regex' | 'all';
    trigger_value?: string;
    reply_type: 'custom' | 'openai' | 'rajaongkir';
    reply_content?: string;
    openai_prompt?: string;
    is_active?: boolean;
    priority?: number;
  }): Promise<WhatsAppAutoReply> {
    const response = await this.axios.post('/auto-replies', data);
    return response.data;
  }

  async updateAutoReply(id: number, data: Partial<{
    name: string;
    trigger_type: 'keyword' | 'regex' | 'all';
    trigger_value: string;
    reply_type: 'custom' | 'openai' | 'rajaongkir';
    reply_content: string;
    openai_prompt: string;
    is_active: boolean;
    priority: number;
  }>): Promise<WhatsAppAutoReply> {
    const response = await this.axios.put(`/auto-replies/${id}`, data);
    return response.data;
  }

  async deleteAutoReply(id: number): Promise<void> {
    await this.axios.delete(`/auto-replies/${id}`);
  }

  async testAutoReply(id: number, testMessage: string): Promise<{
    matched: boolean;
    reply: string | null;
  }> {
    const response = await this.axios.post(`/auto-replies/${id}/test`, { message: testMessage });
    return response.data;
  }

  // ============================================================================
  // STATISTICS & DASHBOARD
  // ============================================================================

  async getDashboardStats(): Promise<{
    total_sessions: number;
    active_sessions: number;
    total_messages_today: number;
    total_broadcasts: number;
    active_broadcasts: number;
    total_contacts: number;
    recent_messages: WhatsAppMessage[];
  }> {
    const response = await this.axios.get('/dashboard/stats');
    return response.data;
  }
}

// Export singleton instance
export const whatsappApi = new WhatsAppApiService();

// Export class for testing
export default WhatsAppApiService;
