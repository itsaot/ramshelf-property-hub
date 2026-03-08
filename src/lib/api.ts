const API_BASE_URL = 'https://property-api-5h7y.onrender.com';

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
    const token = getAuthToken();
    
    // Define public routes that don't need auth
    const isPublicRoute = endpoint.includes('/api/auth/login') || 
                          endpoint.includes('/api/auth/signup') ||
                          (endpoint.includes('/api/rentals') && options.method === 'GET') ||
                          endpoint.match(/^\/api\/rentals\/[^\/]+$/) && options.method === 'GET';
    
    // Build headers object as plain Record
    const headers: Record<string, string> = {};
    
    // CRITICAL: Always attach token for ALL requests if it exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[API] 🔐 Token attached: Yes');
      console.log('[API] Token preview:', token.substring(0, 30) + '...');
    } else {
      console.log('[API] 🔐 Token attached: No');
      if (!isPublicRoute) {
        console.error('[API] ⚠️ Protected route called without token!');
      }
    }
    
    // Add Content-Type for JSON if not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Merge headers - our auth headers take priority
    const finalHeaders = {
      ...(options.headers as Record<string, string> || {}),
      ...headers,
    };

    console.log('[API] Final headers being sent:', finalHeaders);

    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
      mode: 'cors',
      credentials: 'include',
    });

    console.log(`[API] Response status: ${response.status}`);
    
    const contentType = response.headers.get('content-type');
    let data: any = null;
    
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
        console.error('[API] Token was attached:', !!token);
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
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
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
    const result = await apiCall('/api/auth/login', {
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
    const result = await apiCall('/api/admin/login', {
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

  getMe: () => apiCall('/api/auth/me'),

  forgotPassword: (email: string) =>
    apiCall('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiCall(`/api/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),

  setup: (setupData: any) =>
    apiCall('/api/auth/setup', {
      method: 'PUT',
      body: JSON.stringify(setupData),
    }),
};

// Rentals API
// Rentals API
export const rentalsApi = {
  // Public routes
  getAll: (params?: { search?: string; minPrice?: number; maxPrice?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    console.log('🏠 [Rentals] Fetching all rentals (public)', params);
    return apiCall(`/api/rentals${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => {
    console.log(`🏠 [Rentals] Fetching rental by ID (public): ${id}`);
    return apiCall(`/api/rentals/${id}`);
  },

  getMy: () => {
    console.log('🏠 [Rentals] Fetching my rentals (protected)');
    return apiCall('/api/rentals/my');
  },

  searchMy: (query: string) => {
    console.log('🏠 [Rentals] Searching my rentals (protected)', query);
    return apiCall(`/api/rentals/search?q=${encodeURIComponent(query)}`);
  },

  // Protected routes
  create: (rentalData: any) => {
    console.log('🏠 [Rentals] Creating new rental (protected)', rentalData);
    return apiCall('/api/rentals', {
      method: 'POST',
      body: JSON.stringify(rentalData),
    });
  },

  update: (id: string, rentalData: any) => {
    console.log(`🏠 [Rentals] Updating rental (protected): ${id}`, rentalData);
    return apiCall(`/api/rentals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rentalData),
    });
  },

  delete: (id: string) => {
    console.log(`🏠 [Rentals] Deleting rental (protected): ${id}`);
    return apiCall(`/api/rentals/${id}`, {
      method: 'DELETE',
    });
  },
};


// Users API
export const usersApi = {
  getById: (id: string) => apiCall(`/api/users/${id}`),

  update: (id: string, userData: any) =>
    apiCall(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  search: (query: string) => apiCall(`/api/users/search?q=${query}`),

  updateSettings: (id: string, settings: any) =>
    apiCall(`/api/users/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  uploadProfile: (formData: FormData) =>
    apiCall('/api/users/upload-profile', {
      method: 'POST',
      body: formData as any,
      headers: {} as any, // Let browser set content-type for FormData
    }),
};

// Admin API
export const adminApi = {
  getAnalytics: () => apiCall('/api/admin/analytics'),

  getFlaggedContent: () => apiCall('/api/admin/flags'),
  
  // User management
  getAllUsers: () => {
    console.log('👥 [Admin] Fetching all users');
    return apiCall('/api/admin/users');
  },

  createUser: (userData: any) => {
    console.log('👥 [Admin] Creating user', userData);
    return apiCall('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: (id: string, userData: any) => {
    console.log(`👥 [Admin] Updating user ${id}`);
    return apiCall(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  updateUserStatus: (id: string, action: 'suspend' | 'warn', reason?: string) => {
    console.log(`👥 [Admin] Updating user status ${id}: ${action}`);
    return apiCall(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    });
  },

  deleteUser: (id: string) => {
    console.log(`👥 [Admin] Deleting user ${id}`);
    return apiCall(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Property management
  getAllRentals: () => {
    console.log('🏠 [Admin] Fetching all rentals');
    return apiCall('/api/admin/rentals');
  },

  deleteRental: (id: string) => {
    console.log(`🏠 [Admin] Deleting rental ${id}`);
    return apiCall(`/api/admin/rentals/${id}`, {
      method: 'DELETE',
    });
  },

  // Content moderation
  deleteContent: (type: string, id: string) =>
    apiCall(`/api/admin/content/${type}/${id}`, {
      method: 'DELETE',
    }),

  // Reviews management
  getAllReviews: () => {
    console.log('📝 [Admin] Fetching all reviews');
    return apiCall('/api/admin/reviews');
  },
};

// Reviews API
export const reviewsApi = {
  getByUserId: (userId: string) => apiCall(`/api/reviews/user/${userId}`),

  getByRentalId: (rentalId: string) => {
    console.log(`📝 [Reviews] Fetching reviews for rental: ${rentalId}`);
    return apiCall(`/api/reviews/rental/${rentalId}`);
  },

  create: (userId: string, reviewData: any) =>
    apiCall(`/api/reviews/${userId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  createRentalReview: (rentalId: string, reviewData: { rating: number; text: string }) => {
    console.log(`📝 [Reviews] Creating rental review for: ${rentalId}`, reviewData);
    return apiCall(`/api/reviews/rental/${rentalId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  update: (id: string, reviewData: any) =>
    apiCall(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),

  delete: (id: string) =>
    apiCall(`/api/reviews/${id}`, {
      method: 'DELETE',
    }),
};

// Messages API
export const messagesApi = {
  getConversations: () => apiCall('/api/messages/conversations'),

  getMessages: (conversationId: string) => 
    apiCall(`/api/messages/${conversationId}`),

  sendMessage: (conversationId: string, text: string) =>
    apiCall(`/api/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  startConversation: (userId: string) =>
    apiCall(`/api/messages/start/${userId}`, {
      method: 'POST',
    }),
};

// Checks API (Credit & Background)
export const checksApi = {
  runCreditCheck: (tenantId: string, score: number) =>
    apiCall('/api/checks/credit', {
      method: 'POST',
      body: JSON.stringify({ tenantId, score }),
    }),

  runBackgroundCheck: (tenantId: string, passed: boolean, notes?: string) =>
    apiCall('/api/checks/background', {
      method: 'POST',
      body: JSON.stringify({ tenantId, passed, notes }),
    }),

  getChecks: (tenantId: string) =>
    apiCall(`/api/checks/${tenantId}`),
};

// Accounting API
export const accountingApi = {
  getTransactions: () => apiCall('/api/accounting'),

  addTransaction: (data: { type: 'income' | 'expense'; amount: number; description: string }) =>
    apiCall('/api/accounting', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Notifications API
export const notificationsApi = {
  getAll: () => apiCall('/api/notifications'),

  markAsRead: (id: string) =>
    apiCall(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  delete: (id: string) =>
    apiCall(`/api/notifications/${id}`, {
      method: 'DELETE',
    }),

  create: (notificationData: any) =>
    apiCall('/api/notifications/create', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    }),
};

// Disputes API
export const disputesApi = {
  getAll: () => apiCall('/api/disputes'),

  create: (data: { subject: string; description: string; attachments?: string[] }) =>
    apiCall('/api/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: 'open' | 'resolved' | 'rejected') =>
    apiCall(`/api/disputes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Maintenance API
export const maintenanceApi = {
  getAll: () => apiCall('/api/maintenance'),

  create: (data: { title: string; initialMessage: string; attachments?: string[] }) =>
    apiCall('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addMessage: (id: string, text: string, attachments?: string[]) =>
    apiCall(`/api/maintenance/${id}/message`, {
      method: 'POST',
      body: JSON.stringify({ text, attachments }),
    }),

  updateStatus: (id: string, status: 'open' | 'in-progress' | 'closed') =>
    apiCall(`/api/maintenance/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Payments API
export const paymentsApi = {
  createPayment: (paymentData: any) =>
    apiCall('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  initializePaystack: (amount: number, email: string, reference: string) =>
    apiCall('/api/payments/paystack/initialize', {
      method: 'POST',
      body: JSON.stringify({ amount, email, reference }),
    }),

  verifyPaystack: (reference: string) =>
    apiCall(`/api/payments/paystack/verify/${reference}`),
};
