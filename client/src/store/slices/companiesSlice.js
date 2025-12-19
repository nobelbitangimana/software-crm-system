import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enhancedAPI } from '../../services/authAPI';

// Async thunks
export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await enhancedAPI.get(`/companies?${queryString}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch companies');
    }
  }
);

export const fetchCompany = createAsyncThunk(
  'companies/fetchCompany',
  async (id, { rejectWithValue }) => {
    try {
      const response = await enhancedAPI.get(`/companies/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch company');
    }
  }
);

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await enhancedAPI.post('/companies', companyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create company');
    }
  }
);

export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await enhancedAPI.put(`/companies/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update company');
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async (id, { rejectWithValue }) => {
    try {
      await enhancedAPI.delete(`/companies/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete company');
    }
  }
);

const initialState = {
  companies: [],
  currentCompany: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 20,
  },
  filters: {
    search: '',
    industry: '',
    size: '',
    status: '',
  },
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentCompany: (state) => {
      state.currentCompany = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
        state.pagination = { current: 1, pages: 1, total: action.payload.length, limit: 20 };
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single company
      .addCase(fetchCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCompany = action.payload;
      })
      .addCase(fetchCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create company
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.unshift(action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update company
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex(company => company.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        if (state.currentCompany?.id === action.payload.id) {
          state.currentCompany = action.payload;
        }
      })
      
      // Delete company
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companies = state.companies.filter(company => company.id !== action.payload);
        if (state.currentCompany?.id === action.payload) {
          state.currentCompany = null;
        }
      });
  },
});

export const { clearError, setFilters, clearCurrentCompany } = companiesSlice.actions;
export default companiesSlice.reducer;