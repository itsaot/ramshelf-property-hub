const API_BASE_URL = 'https://property-api-5h7y.onrender.com';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

const getAuthToken = () => localStorage.getItem('authToken');

export const authService = {
  signup: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'tenant' | 'landlord';
    phone?: string;
    idDocument?: File;
  }): Promise<ApiResponse> => {
    try {
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('firstName', userData.firstName);
      formData.append('lastName', userData.lastName);
      formData.append('role', userData.role);
      if (userData.phone) formData.append('phone', userData.phone);
      if (userData.idDocument) formData.append('idDocument', userData.idDocument);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || data.error || 'Signup failed' };
      }

      // Save token locally for future requests
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

  login: async (credentials: { email: string; password: string }): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || data.error || 'Login failed' };
      }

      // Save token locally
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('✅ [LOGIN] Token saved to localStorage:', data.token.substring(0, 20) + '...');
        console.log('[LOGIN] Full response:', data);
      } else {
        console.error('❌ [LOGIN] No token in response!', data);
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

  adminLogin: async (credentials: { email: string; password: string }): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || data.error || 'Login failed' };
      }

      // Save token locally
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('✅ [ADMIN LOGIN] Token saved to localStorage:', data.token.substring(0, 20) + '...');
        console.log('[ADMIN LOGIN] Full response:', data);
      } else {
        console.error('❌ [ADMIN LOGIN] No token in response!', data);
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

  getMe: async (): Promise<ApiResponse> => {
    try {
      const token = getAuthToken();
      if (!token) return { error: 'No token provided' };

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) return { error: data.message || 'Unauthorized' };

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

    update: async (id: string, userData: {
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<ApiResponse> => {
    try {
      const token = getAuthToken();
      if (!token) return { error: 'No token provided. Please log in.' };

      // Combine firstName + lastName for backend
      const fullName = `${userData.firstName} ${userData.lastName}`;

      const body = {
        fullName,
        phone: userData.phone,
      };

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) return { error: data.message || 'Update failed' };

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },
};
