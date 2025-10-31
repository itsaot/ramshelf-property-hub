const API_BASE_URL = 'https://property-api-jkpf.onrender.com/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to make API calls with enhanced logging
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  
  try {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
    });

    console.log(`[API] Response status: ${response.status}`);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('[API] Non-JSON response:', text);
      return { error: 'Invalid response format from server' };
    }

    if (!response.ok) {
      console.error('[API] Error response:', data);
      return { error: data.message || data.error || 'An error occurred' };
    }

    console.log('[API] Success:', data);
    return { data };
  } catch (error) {
    console.error('[API] Network error:', error);
    return { error: error instanceof Error ? error.message : 'Network error. Please check your connection.' };
  }
}

// Auth API
export const authApi = {
  signup: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'tenant' | 'landlord';
    phoneNumber?: string;
  }) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials: { email: string; password: string; role: 'tenant' | 'landlord' }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  adminLogin: (credentials: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, role: 'admin' }),
    }),

  getMe: () => apiCall('/auth/me'),

  forgotPassword: (email: string) =>
    apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiCall(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  setup: (setupData: any) =>
    apiCall('/auth/setup', {
      method: 'PUT',
      body: JSON.stringify(setupData),
    }),
};

// Rentals API
export const rentalsApi = {
  getAll: (params?: { search?: string; minPrice?: number; maxPrice?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/rentals${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiCall(`/rentals/${id}`),

  create: (rentalData: any) =>
    apiCall('/rentals', {
      method: 'POST',
      body: JSON.stringify(rentalData),
    }),

  update: (id: string, rentalData: any) =>
    apiCall(`/rentals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rentalData),
    }),

  delete: (id: string) =>
    apiCall(`/rentals/${id}`, {
      method: 'DELETE',
    }),
};

// Users API
export const usersApi = {
  getById: (id: string) => apiCall(`/users/${id}`),

  update: (id: string, userData: any) =>
    apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  search: (query: string) => apiCall(`/users/search?q=${query}`),

  updateSettings: (id: string, settings: any) =>
    apiCall(`/users/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  uploadProfile: (formData: FormData) =>
    apiCall('/users/upload-profile', {
      method: 'POST',
      body: formData as any,
      headers: {} as any, // Let browser set content-type for FormData
    }),
};

// Admin API
export const adminApi = {
  getAnalytics: () => apiCall('/admin/analytics'),

  getFlags: () => apiCall('/admin/flags'),

  updateUser: (id: string, userData: any) =>
    apiCall(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),

  deleteContent: (type: string, id: string) =>
    apiCall(`/admin/content/${type}/${id}`, {
      method: 'DELETE',
    }),
};

// Reviews API
export const reviewsApi = {
  getByUserId: (userId: string) => apiCall(`/reviews/user/${userId}`),

  create: (userId: string, reviewData: any) =>
    apiCall(`/reviews/${userId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  update: (id: string, reviewData: any) =>
    apiCall(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),

  delete: (id: string) =>
    apiCall(`/reviews/${id}`, {
      method: 'DELETE',
    }),
};

// Messages API
export const messagesApi = {
  getConversations: () => apiCall('/messages/conversations'),

  getMessages: (conversationId: string) => 
    apiCall(`/messages/${conversationId}`),

  sendMessage: (conversationId: string, message: string) =>
    apiCall(`/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  startConversation: (userId: string) =>
    apiCall(`/messages/start/${userId}`, {
      method: 'POST',
    }),
};

// Notifications API
export const notificationsApi = {
  getAll: () => apiCall('/notifications'),

  markAsRead: (id: string) =>
    apiCall(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  delete: (id: string) =>
    apiCall(`/notifications/${id}`, {
      method: 'DELETE',
    }),

  create: (notificationData: any) =>
    apiCall('/notifications/create', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    }),
};

// Payments API
export const paymentsApi = {
  createPayment: (paymentData: any) =>
    apiCall('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  initializePaystack: (amount: number, email: string, reference: string) =>
    apiCall('/payments/paystack/initialize', {
      method: 'POST',
      body: JSON.stringify({ amount, email, reference }),
    }),

  verifyPaystack: (reference: string) =>
    apiCall(`/payments/paystack/verify/${reference}`),
};
