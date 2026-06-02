import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'moveBackground 20s linear infinite',
        },
        '@keyframes moveBackground': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(212, 175, 55, 0.3)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          {/* Logo and Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.5)',
                transform: 'rotate(-5deg)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(0deg) scale(1.05)',
                },
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: '#000000',
                  fontWeight: 800,
                  textShadow: '2px 2px 4px rgba(212, 175, 55, 0.3)',
                }}
              >
                MG
              </Typography>
            </Box>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
                letterSpacing: '1px',
              }}
            >
              MATAJAR GROUP
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#666',
                fontWeight: 500,
                mb: 3,
              }}
            >
              Asset Management System
            </Typography>
            <Box
              sx={{
                width: 60,
                height: 4,
                background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 100%)',
                margin: '0 auto',
                borderRadius: 2,
              }}
            />
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                '& .MuiAlert-icon': {
                  color: '#d32f2f',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="Enter your email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#D4AF37' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.3s ease',
                  '& input': {
                    color: '#000000',
                  },
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover': {
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#D4AF37',
                    },
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.15)',
                    '& fieldset': {
                      borderColor: '#D4AF37',
                      borderWidth: 2,
                    },
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#D4AF37' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: '#D4AF37' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.3s ease',
                  '& input': {
                    color: '#000000',
                  },
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover': {
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#D4AF37',
                    },
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.15)',
                    '& fieldset': {
                      borderColor: '#D4AF37',
                      borderWidth: 2,
                    },
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 4,
                mb: 2,
                py: 1.8,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                color: '#000000',
                boxShadow: '0 8px 20px rgba(212, 175, 55, 0.5)',
                border: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 12px 30px rgba(212, 175, 55, 0.7)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e',
                  boxShadow: 'none',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Typography
            variant="caption"
            align="center"
            display="block"
            sx={{
              mt: 4,
              color: '#999',
              fontSize: '0.75rem',
            }}
          >
            © 2024 Matajar Group. All rights reserved.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
