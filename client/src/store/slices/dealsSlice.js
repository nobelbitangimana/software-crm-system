import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/authAPI';

// Async thunks
export const fetchDeals = createAsyncThunk(
  'deals/fetchDeals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/deals?${queryString}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deals');
    }
  }
);

export const fetchDeal = createAsyncThunk(
  'deals/fetchDeal',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/deals/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal');
    }
  }
);

export const createDeal = createAsyncThunk(
  'deals/createDeal',
  async (dealData, { rejectWithValue }) => {
    try {
      const response = await api.post('/deals', dealData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create deal');
    }
  }
);

export const updateDeal = createAsyncThunk(
  'deals/updateDeal',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/deals/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update deal');
    }
  }
);

export const deleteDeal = createAsyncThunk(
  'deals/deleteDeal',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/deals/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete deal');
    }
  }
);

const initialState = {
  deals: [],
  currentDeal: null,
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
    stage: '',
    assignedTo: '',
    dateRange: null,
  },
  pipeline: {
    lead: [],
    qualified: [],
    proposal: [],
    negotiation: [],
    closed_won: [],
    closed_lost: [],
  },
};

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentDeal: (state) => {
      state.currentDeal = null;
    },
    updatePipeline: (state, action) => {
      const { deals } = action.payload;
      // Group deals by stage
      state.pipeline = deals.reduce((acc, deal) => {
        if (!acc[deal.stage]) acc[deal.stage] = [];
        acc[deal.stage].push(deal);
        return acc;
      }, {
        lead: [],
        qualified: [],
        proposal: [],
        negotiation: [],
        closed_won: [],
        closed_lost: [],
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch deals
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = action.payload.deals;
        state.pagination = action.payload.pagination;
        
        // Update pipeline
        state.pipeline = action.payload.deals.reduce((acc, deal) => {
          if (!acc[deal.stage]) acc[deal.stage] = [];
          acc[deal.stage].push(deal);
          return acc;
        }, {
          lead: [],
          qualified: [],
          proposal: [],
          negotiation: [],
          closed_won: [],
          closed_lost: [],
        });
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single deal
      .addCase(fetchDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeal = action.payload;
      })
      .addCase(fetchDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create deal
      .addCase(createDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.deals.unshift(action.payload);
        
        // Add to pipeline
        const stage = action.payload.stage;
        if (state.pipeline[stage]) {
          state.pipeline[stage].push(action.payload);
        }
      })
      .addCase(createDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update deal
      .addCase(updateDeal.fulfilled, (state, action) => {
        const index = state.deals.findIndex(deal => deal._id === action.payload._id);
        if (index !== -1) {
          const oldStage = state.deals[index].stage;
          const newStage = action.payload.stage;
          
          state.deals[index] = action.payload;
          
          // Update pipeline if stage changed
          if (oldStage !== newStage) {
            // Remove from old stage
            state.pipeline[oldStage] = state.pipeline[oldStage].filter(
              deal => deal._id !== action.payload._id
            );
            
            // Add to new stage
            if (state.pipeline[newStage]) {
              state.pipeline[newStage].push(action.payload);
            }
          } else {
            // Update in same stage
            const pipelineIndex = state.pipeline[newStage].findIndex(
              deal => deal._id === action.payload._id
            );
            if (pipelineIndex !== -1) {
              state.pipeline[newStage][pipelineIndex] = action.payload;
            }
          }
        }
        
        if (state.currentDeal?._id === action.payload._id) {
          state.currentDeal = action.payload;
        }
      })
      
      // Delete deal
      .addCase(deleteDeal.fulfilled, (state, action) => {
        const dealIndex = state.deals.findIndex(deal => deal._id === action.payload);
        if (dealIndex !== -1) {
          const deal = state.deals[dealIndex];
          state.deals = state.deals.filter(d => d._id !== action.payload);
          
          // Remove from pipeline
          state.pipeline[deal.stage] = state.pipeline[deal.stage].filter(
            d => d._id !== action.payload
          );
        }
        
        if (state.currentDeal?._id === action.payload) {
          state.currentDeal = null;
        }
      });
  },
});

export const { clearError, setFilters, clearCurrentDeal, updatePipeline } = dealsSlice.actions;
export default dealsSlice.reducer;