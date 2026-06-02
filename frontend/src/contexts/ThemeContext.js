import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'dark'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'dark';
  });

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#000000' : '#1a1a1a',
            light: '#2a2a2a',
            dark: '#000000',
          },
          secondary: {
            main: '#D4AF37',
            light: '#FFD700',
            dark: '#B8941F',
          },
          background: {
            default: mode === 'dark' ? '#0a0a0a' : '#f8f9fa',
            paper: mode === 'dark' ? '#1a1a1a' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#ffffff' : '#2d3748',
            secondary: mode === 'dark' ? '#D4AF37' : '#718096',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
                border: mode === 'dark' ? '1px solid rgba(212, 175, 55, 0.2)' : 'none',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                boxShadow: mode === 'dark'
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'rgba(212, 175, 55, 0.4)' : 'transparent',
                  boxShadow: mode === 'dark'
                    ? '0 6px 20px rgba(212, 175, 55, 0.15)'
                    : '0 8px 24px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
                borderRadius: '12px',
                boxShadow: mode === 'dark'
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                borderRadius: 8,
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#000000' : '#ffffff',
                color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'dark' ? '#000000' : '#ffffff',
                borderRight: `1px solid ${mode === 'dark' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.3)'}`,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
