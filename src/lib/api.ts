const API_BASE_URL = 'https://property-api-jkpf.onrender.com/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error. Please try again.' };
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
