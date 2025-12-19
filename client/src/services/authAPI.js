import axios from 'axios';
import { demoAPI } from './demoAPI';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Demo mode - hardcoded users
const DEMO_USERS = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@crm.com',
    password: 'admin123',
    role: 'admin',
    department: 'Management',
    permissions: ['all']
  },
  {
    id: '2',
    firstName: 'Sales',
    lastName: 'Rep',
    email: 'sales@crm.com',
    password: 'sales123',
    role: 'sales',
    department: 'Sales',
    permissions: ['contacts', 'deals', 'companies']
  }
];

// Check if we should use demo mode
const isDemoMode = () => {
  const token = localStorage.getItem('accessToken');
  return token && token.startsWith('demo-token-');
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and fallback to demo mode
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If API fails and we're not in demo mode, try demo mode
    if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
      console.log('API failed, falling back to demo mode');
      // Don't retry, let the calling function handle demo mode
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to try API first, then fallback to demo
const apiWithFallback = async (apiCall, demoCall) => {
  if (isDemoMode()) {
    return await demoCall();
  }
  
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.log('API call failed, using demo mode:', error.message);
    return await demoCall();
  }
};

const authAPI = {
  login: async (email, password) => {
    // Try demo mode first
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (demoUser) {
      // Simulate successful login
      const token = 'demo-token-' + Date.now();
      const refreshToken = 'demo-refresh-' + Date.now();
      
      return {
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          id: demoUser.id,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          email: demoUser.email,
          role: demoUser.role,
          department: demoUser.department,
          permissions: demoUser.permissions
        }
      };
    }

    // If not demo user, try API
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // If API fails, check demo users again
      if (demoUser) {
        const token = 'demo-token-' + Date.now();
        const refreshToken = 'demo-refresh-' + Date.now();
        
        return {
          message: 'Login successful (Demo Mode)',
          token,
          refreshToken,
          user: {
            id: demoUser.id,
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            email: demoUser.email,
            role: demoUser.role,
            department: demoUser.department,
            permissions: demoUser.permissions
          }
        };
      }
      throw error;
    }
  },

  register: async (userData) => {
    return apiWithFallback(
      () => api.post('/auth/register', userData),
      () => demoAPI.users.create(userData)
    );
  },

  logout: async () => {
    // Clear demo tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return { message: 'Logged out successfully' };
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('demo-token-')) {
      // Return demo user info
      const email = localStorage.getItem('userEmail');
      const demoUser = DEMO_USERS.find(u => u.email === email);
      if (demoUser) {
        return {
          user: {
            id: demoUser.id,
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            email: demoUser.email,
            role: demoUser.role,
            department: demoUser.department,
            permissions: demoUser.permissions
          }
        };
      }
    }

    return apiWithFallback(
      () => api.get('/auth/me'),
      () => Promise.resolve({ user: DEMO_USERS[0] })
    );
  },

  refreshToken: async (refreshToken) => {
    if (refreshToken && refreshToken.startsWith('demo-refresh-')) {
      // Return new demo token
      return {
        accessToken: 'demo-token-' + Date.now()
      };
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Export enhanced API with demo fallback
export const enhancedAPI = {
  // Contacts
  get: (url) => apiWithFallback(
    () => api.get(url),
    () => {
      if (url.includes('/contacts')) {
        if (url.includes('/contacts/') && !url.endsWith('/contacts')) {
          const id = url.split('/contacts/')[1];
          return demoAPI.contacts.getById(id);
        }
        return demoAPI.contacts.getAll();
      }
      if (url.includes('/companies')) {
        if (url.includes('/companies/') && !url.endsWith('/companies')) {
          const id = url.split('/companies/')[1];
          return demoAPI.companies.getById(id);
        }
        return demoAPI.companies.getAll();
      }
      if (url.includes('/deals')) {
        if (url.includes('/deals/') && !url.endsWith('/deals')) {
          const id = url.split('/deals/')[1];
          return demoAPI.deals.getById(id);
        }
        return demoAPI.deals.getAll();
      }
      if (url.includes('/campaigns')) {
        if (url.includes('/campaigns/') && !url.endsWith('/campaigns')) {
          const id = url.split('/campaigns/')[1];
          return demoAPI.campaigns.getById(id);
        }
        return demoAPI.campaigns.getAll();
      }
      if (url.includes('/tickets')) {
        if (url.includes('/tickets/') && !url.endsWith('/tickets')) {
          const id = url.split('/tickets/')[1];
          return demoAPI.tickets.getById(id);
        }
        return demoAPI.tickets.getAll();
      }
      if (url.includes('/users')) {
        if (url.includes('/users/') && !url.endsWith('/users')) {
          const id = url.split('/users/')[1];
          return demoAPI.users.getById(id);
        }
        return demoAPI.users.getAll();
      }
      if (url.includes('/analytics')) {
        return demoAPI.analytics.getDashboard();
      }
      return Promise.resolve({ data: [] });
    }
  ),

  post: (url, data) => apiWithFallback(
    () => api.post(url, data),
    () => {
      if (url.includes('/contacts')) return demoAPI.contacts.create(data);
      if (url.includes('/companies')) return demoAPI.companies.create(data);
      if (url.includes('/deals')) return demoAPI.deals.create(data);
      if (url.includes('/campaigns')) return demoAPI.campaigns.create(data);
      if (url.includes('/tickets')) return demoAPI.tickets.create(data);
      if (url.includes('/users')) return demoAPI.users.create(data);
      return Promise.resolve({ data });
    }
  ),

  put: (url, data) => apiWithFallback(
    () => api.put(url, data),
    () => {
      const id = url.split('/').pop();
      if (url.includes('/contacts')) return demoAPI.contacts.update(id, data);
      if (url.includes('/companies')) return demoAPI.companies.update(id, data);
      if (url.includes('/deals')) return demoAPI.deals.update(id, data);
      if (url.includes('/campaigns')) return demoAPI.campaigns.update(id, data);
      if (url.includes('/tickets')) return demoAPI.tickets.update(id, data);
      if (url.includes('/users')) return demoAPI.users.update(id, data);
      return Promise.resolve({ data });
    }
  ),

  delete: (url) => apiWithFallback(
    () => api.delete(url),
    () => {
      const id = url.split('/').pop();
      if (url.includes('/contacts')) return demoAPI.contacts.delete(id);
      if (url.includes('/companies')) return demoAPI.companies.delete(id);
      if (url.includes('/deals')) return demoAPI.deals.delete(id);
      if (url.includes('/campaigns')) return demoAPI.campaigns.delete(id);
      if (url.includes('/tickets')) return demoAPI.tickets.delete(id);
      if (url.includes('/users')) return demoAPI.users.delete(id);
      return Promise.resolve({ message: 'Deleted successfully' });
    }
  )
};

export default authAPI;
export { api, enhancedAPI as api2 };