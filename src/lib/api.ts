const API_BASE_URL = 'https://property-api-jkpf.onrender.com/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to get auth token with debugging
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  console.log('[AUTH] Token check:', token ? `Token exists (${token.substring(0, 20)}...)` : '❌ NO TOKEN FOUND');
  console.log('[AUTH] localStorage keys:', Object.keys(localStorage));
  return token;
};


// Helper function to make API calls with enhanced logging
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  
  try {
    let data: any = null; 
    const token = getAuthToken();
    
    // Define public routes that don't need auth
    const isPublicRoute = endpoint.includes('/auth/login') || 
                          endpoint.includes('/auth/signup') ||
                          (endpoint.includes('/rentals') && options.method === 'GET') ||
                          endpoint.match(/^\/rentals\/[^\/]+$/) && options.method === 'GET';
    
    // Only warn if it's a protected route and no token
    if (!isPublicRoute && !token) {
      console.warn('⚠️ No authentication token found. Please log in again.');
    }
    
    // Build headers object - CRITICAL: Must be a plain object, not HeadersInit
    const headers: Record<string, string> = {};

     // Always attach token first if it exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[API] ✅ Token attached to request header');
    }
    
    // Add Content-Type for JSON if not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    
    // Merge with any headers from options (but our headers take priority)
    const finalHeaders = {
      ...(options.headers as Record<string, string>),
      ...headers,
    };
    
    console.log('[API] Final headers being sent:', finalHeaders);

    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
      mode: 'cors',
    });

    console.log(`[API] Response status: ${response.status}`);

    
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
      
      // Special handling for 401 errors
      if (response.status === 401) {
        console.error('[API] 401 Unauthorized - Token may be invalid or expired');
        if (!token) {
          return { error: 'Authentication required. Please log in to continue.' };
        }
      }
      
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
  signup: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'tenant' | 'landlord';
    phone?: string;
    idDocument?: File;
  }): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('role', userData.role);
    if (userData.phone) formData.append('phone', userData.phone);
    if (userData.idDocument) formData.append('idDocument', userData.idDocument);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
        mode: 'cors',
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          return { error: data.message || data.error || 'An error occurred' };
        }
        return { data };
      } else {
        return { error: 'Invalid response format from server' };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error. Please check your connection.' };
    }
  },

  login: async (credentials: { emailOrPhone: string; password: string }) => {
    console.log('🔐 [Auth] Attempting login...');
    const result = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        emailOrPhone: credentials.emailOrPhone,
        password: credentials.password,
      }),
    });
    
    if (result.data && typeof result.data === 'object' && 'token' in result.data) {
      localStorage.setItem('authToken', result.data.token as string);
      console.log('✅ [Auth] Token saved to localStorage');
    }
    
    return result;
  },

  adminLogin: async (credentials: { emailOrPhone: string; password: string }) => {
    console.log('🔐 [Auth] Attempting admin login...');
    const result = await apiCall('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        emailOrPhone: credentials.emailOrPhone,
        password: credentials.password,
      }),
    });
    
    if (result.data && typeof result.data === 'object' && 'token' in result.data) {
      localStorage.setItem('authToken', result.data.token as string);
      console.log('✅ [Auth] Admin token saved to localStorage');
    }
    
    return result;
  },

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
    console.log('🏠 [Rentals] Fetching all rentals (public)', params);
    return apiCall(`/rentals${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => {
    console.log(`🏠 [Rentals] Fetching rental by ID (public): ${id}`);
    return apiCall(`/rentals/${id}`);
  },

  create: (rentalData: any) => {
    console.log('🏠 [Rentals] Creating new rental (protected)', rentalData);
    return apiCall('/rentals', {
      method: 'POST',
      body: JSON.stringify(rentalData),
    });
  },

  update: (id: string, rentalData: any) => {
    console.log(`🏠 [Rentals] Updating rental (protected): ${id}`, rentalData);
    return apiCall(`/rentals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rentalData),
    });
  },

  delete: (id: string) => {
    console.log(`🏠 [Rentals] Deleting rental (protected): ${id}`);
    return apiCall(`/rentals/${id}`, {
      method: 'DELETE',
    });
  },
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
  
  // User management
  getAllUsers: () => {
    console.log('👥 [Admin] Fetching all users');
    return apiCall('/admin/users');
  },

  createUser: (userData: any) => {
    console.log('👥 [Admin] Creating user', userData);
    return apiCall('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: (id: string, userData: any) => {
    console.log(`👥 [Admin] Updating user ${id}`);
    return apiCall(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: (id: string) => {
    console.log(`👥 [Admin] Deleting user ${id}`);
    return apiCall(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Property management
  getAllRentals: () => {
    console.log('🏠 [Admin] Fetching all rentals');
    return apiCall('/admin/rentals');
  },

  deleteRental: (id: string) => {
    console.log(`🏠 [Admin] Deleting rental ${id}`);
    return apiCall(`/admin/rentals/${id}`, {
      method: 'DELETE',
    });
  },

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
