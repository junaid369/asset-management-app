import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Inventory,
  CheckCircle,
  Assignment,
  Build,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import assetService from '../services/assetService';
import { useThemeMode } from '../contexts/ThemeContext';

const COLORS = ['#D4AF37', '#8B7F6A', '#A89968', '#C4B59A', '#6B6456'];

const StatCard = ({ title, value, icon, color, mode }) => (
  <Card
    sx={{
      height: '100%',
      background: mode === 'dark'
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
        : '#ffffff',
      border: mode === 'dark' ? '2px solid rgba(212, 175, 55, 0.3)' : 'none',
      transition: 'all 0.3s ease',
      boxShadow: mode === 'dark'
        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
        : '0 2px 8px rgba(0, 0, 0, 0.08)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: mode === 'dark'
          ? '0 8px 24px rgba(212, 175, 55, 0.2)'
          : '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              color: mode === 'dark' ? '#D4AF37' : '#718096',
              fontWeight: 600,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              mb: 1.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: mode === 'dark' ? 'white' : '#2d3748',
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            borderRadius: '10px',
            width: { xs: 48, sm: 52 },
            height: { xs: 48, sm: 52 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: `0 2px 12px ${color}40`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { mode } = useThemeMode();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await assetService.getAssetStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return <Typography>Failed to load statistics</Typography>;
  }

  const statusData = [
    { name: 'Available', value: stats.availableAssets },
    { name: 'Assigned', value: stats.assignedAssets },
    { name: 'Maintenance', value: stats.maintenanceAssets },
    { name: 'Retired', value: stats.retiredAssets },
  ];

  return (
    <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assets"
            value={stats.totalAssets}
            icon={<Inventory sx={{ fontSize: 28 }} />}
            color="#D4AF37"
            mode={mode}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available"
            value={stats.availableAssets}
            icon={<CheckCircle sx={{ fontSize: 28 }} />}
            color="#8B7F6A"
            mode={mode}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assigned"
            value={stats.assignedAssets}
            icon={<Assignment sx={{ fontSize: 28 }} />}
            color="#A89968"
            mode={mode}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Maintenance"
            value={stats.maintenanceAssets}
            icon={<Build sx={{ fontSize: 28 }} />}
            color="#C4B59A"
            mode={mode}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              background: mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
                : '#ffffff',
              border: mode === 'dark' ? '2px solid rgba(212, 175, 55, 0.3)' : 'none',
              transition: 'all 0.3s ease',
              boxShadow: mode === 'dark'
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
              '&:hover': {
                boxShadow: mode === 'dark'
                  ? '0 8px 24px rgba(212, 175, 55, 0.2)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: mode === 'dark' ? '#D4AF37' : '#2d3748',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                mb: 3,
                fontSize: '0.875rem',
              }}
            >
              Asset Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={2}
                  stroke={mode === 'dark' ? '#1a1a1a' : '#ffffff'}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
                    border: '2px solid #D4AF37',
                    borderRadius: '8px',
                    color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
                    padding: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
                    paddingTop: '20px',
                  }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              background: mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
                : '#ffffff',
              border: mode === 'dark' ? '2px solid rgba(212, 175, 55, 0.3)' : 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: mode === 'dark'
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
              '&:hover': {
                boxShadow: mode === 'dark'
                  ? '0 8px 24px rgba(212, 175, 55, 0.2)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: mode === 'dark' ? '#D4AF37' : '#2d3748',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                mb: 4,
                fontSize: '0.875rem',
              }}
            >
              Asset Value
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, justifyContent: 'center' }}>
              <Box
                sx={{
                  p: 3,
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
                  borderRadius: '12px',
                  border: mode === 'dark' ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(99, 102, 241, 0.15)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#718096',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem',
                    mb: 1,
                  }}
                >
                  Total Purchase Value
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    color: mode === 'dark' ? '#ffffff' : '#2d3748',
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                  }}
                >
                  ${stats.totalValue.toLocaleString()}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 3,
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.06) 100%)',
                  borderRadius: '12px',
                  border: mode === 'dark' ? '2px solid rgba(212, 175, 55, 0.4)' : '2px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#718096',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem',
                    mb: 1,
                  }}
                >
                  Current Value (After Depreciation)
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    color: mode === 'dark' ? '#D4AF37' : '#10b981',
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                  }}
                >
                  ${stats.currentValue.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            sx={{
              p: 4,
              background: mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
                : '#ffffff',
              border: mode === 'dark' ? '2px solid rgba(212, 175, 55, 0.3)' : 'none',
              transition: 'all 0.3s ease',
              boxShadow: mode === 'dark'
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
              '&:hover': {
                boxShadow: mode === 'dark'
                  ? '0 8px 24px rgba(212, 175, 55, 0.2)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: mode === 'dark' ? '#D4AF37' : '#2d3748',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                mb: 3,
                fontSize: '0.875rem',
              }}
            >
              Assets by Category
            </Typography>
            <Grid container spacing={3}>
              {stats.assetsByCategory.map((category) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
                  <Card
                    sx={{
                      height: '100%',
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
                        : '#ffffff',
                      border: mode === 'dark' ? '2px solid rgba(212, 175, 55, 0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: mode === 'dark'
                        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: mode === 'dark'
                          ? '0 8px 24px rgba(212, 175, 55, 0.2)'
                          : '0 8px 24px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: mode === 'dark' ? '#D4AF37' : '#718096',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          mb: 2,
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          color: mode === 'dark' ? '#FFD700' : '#2d3748',
                          fontWeight: 700,
                          mb: 1,
                          fontSize: { xs: '2rem', sm: '2.5rem' },
                        }}
                      >
                        {category.count}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#a0aec0',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        assets
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
