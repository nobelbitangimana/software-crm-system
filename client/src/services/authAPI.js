import axios from 'axios';
import { demoAPI } from './demoAPI';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// FORCE DEMO MODE - Always use demo data for reliability
const FORCE_DEMO_MODE = true;

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
  return FORCE_DEMO_MODE || (localStorage.getItem('accessToken') && localStorage.getItem('accessToken').startsWith('demo-token-'));
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

// Response interceptor - always fallback to demo mode
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API error, using demo mode:', error.message);
    return Promise.reject(error);
  }
);

// Helper function - ALWAYS use demo mode for reliability
const apiWithFallback = async (apiCall, demoCall) => {
  if (FORCE_DEMO_MODE) {
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
    // Always use demo mode for reliability
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
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
    
    throw new Error('Invalid credentials');
  },

  register: async (userData) => {
    return await demoAPI.users.create(userData);
  },

  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    return { message: 'Logged out successfully' };
  },

  getCurrentUser: async () => {
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
    
    return {
      user: DEMO_USERS[0]
    };
  },

  refreshToken: async (refreshToken) => {
    return {
      accessToken: 'demo-token-' + Date.now()
    };
  },
};

// Export enhanced API with FULL demo mode
export const enhancedAPI = {
  get: (url) => {
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
  },

  post: (url, data) => {
    if (url.includes('/contacts')) return demoAPI.contacts.create(data);
    if (url.includes('/companies')) return demoAPI.companies.create(data);
    if (url.includes('/deals')) return demoAPI.deals.create(data);
    if (url.includes('/campaigns')) return demoAPI.campaigns.create(data);
    if (url.includes('/tickets')) return demoAPI.tickets.create(data);
    if (url.includes('/users')) return demoAPI.users.create(data);
    return Promise.resolve({ data });
  },

  put: (url, data) => {
    const id = url.split('/').pop();
    if (url.includes('/contacts')) return demoAPI.contacts.update(id, data);
    if (url.includes('/companies')) return demoAPI.companies.update(id, data);
    if (url.includes('/deals')) return demoAPI.deals.update(id, data);
    if (url.includes('/campaigns')) return demoAPI.campaigns.update(id, data);
    if (url.includes('/tickets')) return demoAPI.tickets.update(id, data);
    if (url.includes('/users')) return demoAPI.users.update(id, data);
    return Promise.resolve({ data });
  },

  delete: (url) => {
    const id = url.split('/').pop();
    if (url.includes('/contacts')) return demoAPI.contacts.delete(id);
    if (url.includes('/companies')) return demoAPI.companies.delete(id);
    if (url.includes('/deals')) return demoAPI.deals.delete(id);
    if (url.includes('/campaigns')) return demoAPI.campaigns.delete(id);
    if (url.includes('/tickets')) return demoAPI.tickets.delete(id);
    if (url.includes('/users')) return demoAPI.users.delete(id);
    return Promise.resolve({ message: 'Deleted successfully' });
  }
};

export default authAPI;
export { api, enhancedAPI as api2 };