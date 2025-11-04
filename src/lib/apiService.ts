const API_BASE_URL = 'https://property-api-jkpf.onrender.com/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => localStorage.getItem('authToken');

// Helper to save auth token to localStorage
const saveAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
  console.log('✓ Auth token saved to localStorage');
};

// Core API call function with automatic token attachment
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  
  try {
    const token = getAuthToken();
    
    // Check if this is an auth route (login/signup don't need tokens)
    const isAuthRoute = endpoint.includes('/auth/login') || 
                        endpoint.includes('/auth/signup') ||
                        endpoint.includes('/auth/admin/login');
    
    // Warn if protected route accessed without token
    if (!isAuthRoute && !token) {
      console.warn('⚠️ No authentication token found. Please log in again.');
    }
    
    // Build headers
    const headers: HeadersInit = {
      ...options.headers,
    };
    
    // Add Content-Type for JSON if not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // ALWAYS add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[API] ✓ Authorization header attached');
    }

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
    });

    console.log(`[API] Response status: ${response.status}`);

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('[API] Non-JSON response:', text);
      return { error: 'Invalid response format from server' };
    }

    // Handle errors
    if (!response.ok) {
      console.error('[API] Error response:', data);
      
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
    return { 
      error: error instanceof Error ? error.message : 'Network error. Please check your connection.' 
    };
  }
}

// ==================== AUTH API ====================

export const authApi = {
  /**
   * Sign up a new user (combines firstName + lastName into fullName for backend)
   */
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
    
    // Combine firstName and lastName into fullName for backend
    const fullName = `${userData.firstName} ${userData.lastName}`;
    
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('fullName', fullName);
    formData.append('role', userData.role);
    if (userData.phone) formData.append('phone', userData.phone);
    if (userData.idDocument) formData.append('idDocument', userData.idDocument);

    const result = await apiCall('/auth/signup', {
      method: 'POST',
      body: formData,
    });

    // Save token if signup successful
    if (result.data && typeof result.data === 'object' && 'token' in result.data) {
      saveAuthToken(result.data.token as string);
    }

    return result;
  },

  /**
   * Log in a user with email/phone and password
   */
  login: async (credentials: { 
    emailOrPhone: string; 
    password: string;
  }): Promise<ApiResponse> => {
    const result = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Save token if login successful
    if (result.data && typeof result.data === 'object' && 'token' in result.data) {
      saveAuthToken(result.data.token as string);
    }

    return result;
  },

  /**
   * Admin login with email/phone and password
   */
  adminLogin: async (credentials: { 
    emailOrPhone: string; 
    password: string;
  }): Promise<ApiResponse> => {
    const result = await apiCall('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Save token if login successful
    if (result.data && typeof result.data === 'object' && 'token' in result.data) {
      saveAuthToken(result.data.token as string);
    }

    return result;
  },

  /**
   * Get current logged-in user (protected)
   */
  getMe: (): Promise<ApiResponse> => {
    return apiCall('/auth/me');
  },

  /**
   * Log out (clears local token)
   */
  logout: (): void => {
    localStorage.removeItem('authToken');
    console.log('✓ Auth token removed from localStorage');
  },
};

// ==================== USERS API ====================

export const usersApi = {
  /**
   * Get user by ID (protected)
   */
  getById: (id: string): Promise<ApiResponse> => {
    return apiCall(`/users/${id}`);
  },

  /**
   * Update user profile (protected)
   * Combines firstName + lastName into fullName for backend
   */
  update: async (id: string, userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    fullName?: string;
  }): Promise<ApiResponse> => {
    const body: any = {};

    // If firstName and lastName provided, combine them
    if (userData.firstName && userData.lastName) {
      body.fullName = `${userData.firstName} ${userData.lastName}`;
    } else if (userData.fullName) {
      body.fullName = userData.fullName;
    }

    if (userData.phone !== undefined) {
      body.phone = userData.phone;
    }

    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  /**
   * Search users (protected)
   */
  search: (query: string): Promise<ApiResponse> => {
    return apiCall(`/users/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Update user settings (protected)
   */
  updateSettings: (id: string, settings: any): Promise<ApiResponse> => {
    return apiCall(`/users/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Upload profile picture (protected, FormData)
   */
  uploadProfile: (formData: FormData): Promise<ApiResponse> => {
    return apiCall('/users/upload-profile', {
      method: 'POST',
      body: formData,
    });
  },
};

// ==================== ADMIN API ====================

export const adminApi = {
  /**
   * Get platform analytics (admin only, protected)
   */
  getAnalytics: (): Promise<ApiResponse> => {
    return apiCall('/admin/analytics');
  },

  /**
   * Get flagged content (admin only, protected)
   */
  getFlags: (): Promise<ApiResponse> => {
    return apiCall('/admin/flags');
  },

  /**
   * Update user status (admin only, protected)
   */
  updateUser: (id: string, userData: any): Promise<ApiResponse> => {
    return apiCall(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete content (admin only, protected)
   */
  deleteContent: (type: string, id: string): Promise<ApiResponse> => {
    return apiCall(`/admin/content/${type}/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== RENTALS API ====================

export const rentalsApi = {
  /**
   * Get all rentals with optional filters
   */
  getAll: (params?: { 
    search?: string; 
    minPrice?: number; 
    maxPrice?: number;
  }): Promise<ApiResponse> => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/rentals${query ? `?${query}` : ''}`);
  },

  /**
   * Get rental by ID
   */
  getById: (id: string): Promise<ApiResponse> => {
    return apiCall(`/rentals/${id}`);
  },

  /**
   * Create new rental (protected)
   */
  create: (rentalData: any): Promise<ApiResponse> => {
    return apiCall('/rentals', {
      method: 'POST',
      body: JSON.stringify(rentalData),
    });
  },

  /**
   * Update rental (protected)
   */
  update: (id: string, rentalData: any): Promise<ApiResponse> => {
    return apiCall(`/rentals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rentalData),
    });
  },

  /**
   * Delete rental (protected)
   */
  delete: (id: string): Promise<ApiResponse> => {
    return apiCall(`/rentals/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== REVIEWS API ====================

export const reviewsApi = {
  /**
   * Get reviews for a user
   */
  getByUserId: (userId: string): Promise<ApiResponse> => {
    return apiCall(`/reviews/user/${userId}`);
  },

  /**
   * Create a review (protected)
   */
  create: (userId: string, reviewData: any): Promise<ApiResponse> => {
    return apiCall(`/reviews/${userId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  /**
   * Update a review (protected)
   */
  update: (id: string, reviewData: any): Promise<ApiResponse> => {
    return apiCall(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  /**
   * Delete a review (protected)
   */
  delete: (id: string): Promise<ApiResponse> => {
    return apiCall(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== MESSAGES API ====================

export const messagesApi = {
  /**
   * Get all conversations (protected)
   */
  getConversations: (): Promise<ApiResponse> => {
    return apiCall('/messages/conversations');
  },

  /**
   * Get messages in a conversation (protected)
   */
  getMessages: (conversationId: string): Promise<ApiResponse> => {
    return apiCall(`/messages/${conversationId}`);
  },

  /**
   * Send a message (protected)
   */
  sendMessage: (conversationId: string, message: string): Promise<ApiResponse> => {
    return apiCall(`/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  /**
   * Start a new conversation (protected)
   */
  startConversation: (userId: string): Promise<ApiResponse> => {
    return apiCall(`/messages/start/${userId}`, {
      method: 'POST',
    });
  },
};

// ==================== NOTIFICATIONS API ====================

export const notificationsApi = {
  /**
   * Get all notifications (protected)
   */
  getAll: (): Promise<ApiResponse> => {
    return apiCall('/notifications');
  },

  /**
   * Mark notification as read (protected)
   */
  markAsRead: (id: string): Promise<ApiResponse> => {
    return apiCall(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Delete notification (protected)
   */
  delete: (id: string): Promise<ApiResponse> => {
    return apiCall(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Create notification (protected)
   */
  create: (notificationData: any): Promise<ApiResponse> => {
    return apiCall('/notifications/create', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },
};

// ==================== PAYMENTS API ====================

export const paymentsApi = {
  /**
   * Create a payment (protected)
   */
  createPayment: (paymentData: any): Promise<ApiResponse> => {
    return apiCall('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  /**
   * Initialize Paystack payment (protected)
   */
  initializePaystack: (amount: number, email: string, reference: string): Promise<ApiResponse> => {
    return apiCall('/payments/paystack/initialize', {
      method: 'POST',
      body: JSON.stringify({ amount, email, reference }),
    });
  },

  /**
   * Verify Paystack payment (protected)
   */
  verifyPaystack: (reference: string): Promise<ApiResponse> => {
    return apiCall(`/payments/paystack/verify/${reference}`);
  },
};
