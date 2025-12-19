import { createTheme } from '@mui/material/styles';

const softwareTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50', // Light Green
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2196F3', // Light Blue
      light: '#64B5F6',
      dark: '#1976D2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#66BB6A',
      light: '#A5D6A7',
      dark: '#4CAF50',
    },
    warning: {
      main: '#FFA726',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#EF5350',
      light: '#E57373',
      dark: '#D32F2F',
    },
    info: {
      main: '#42A5F5',
      light: '#64B5F6',
      dark: '#1E88E5',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    divider: '#E0E0E0',
    
    // Custom colors for software CRM
    health: {
      healthy: '#4CAF50',
      atRisk: '#FF9800',
      critical: '#F44336',
    },
    
    // Deal stage colors
    stages: {
      lead: '#9E9E9E',
      demo_scheduled: '#2196F3',
      demo_completed: '#03A9F4',
      trial: '#FF9800',
      proposal: '#9C27B0',
      negotiation: '#FF5722',
      closed_won: '#4CAF50',
      closed_lost: '#F44336',
    },
    
    // Role colors
    roles: {
      sdr: '#4CAF50',
      ae: '#2196F3',
      csm: '#9C27B0',
      account_manager: '#FF9800',
      support_engineer: '#607D8B',
      product: '#795548',
      marketing: '#E91E63',
      executive: '#3F51B5',
    }
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#212121',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#212121',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#212121',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#212121',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#212121',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#212121',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#424242',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#424242',
    },
    body1: {
      fontSize: '1rem',
      color: '#212121',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#757575',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  
  shape: {
    borderRadius: 8,
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
          },
        },
        outlined: {
          borderColor: '#4CAF50',
          color: '#4CAF50',
          '&:hover': {
            borderColor: '#388E3C',
            backgroundColor: 'rgba(76, 175, 80, 0.04)',
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid #E0E0E0',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #4CAF50 0%, #2196F3 100%)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        },
      },
    },
    
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E0E0E0',
          background: '#FAFAFA',
        },
      },
    },
    
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#424242',
          },
        },
      },
    },
    
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
  },
});

export default softwareTheme;