import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  AccessTime as AccessTimeIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Assets', icon: <InventoryIcon />, path: '/assets' },
  { text: 'Purchase Orders', icon: <ShoppingCartIcon />, path: '/purchase-orders', roles: ['admin', 'manager'] },
  { text: 'Vendors', icon: <StoreIcon />, path: '/vendors', roles: ['admin', 'manager'] },
  { text: 'Users', icon: <PeopleIcon />, path: '/users', roles: ['admin', 'manager'] },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { text: 'Attendance', icon: <AccessTimeIcon />, path: '/attendance' },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', backgroundColor: mode === 'dark' ? '#000000' : '#ffffff', color: mode === 'dark' ? 'white' : '#1a1a1a' }}>
      <Toolbar
        sx={{
          background: mode === 'dark' ? '#000000' : '#ffffff',
          color: mode === 'dark' ? 'white' : '#1a1a1a',
          borderBottom: '2px solid #D4AF37',
          py: 1.5,
          minHeight: '64px !important',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
              borderRadius: '50%',
              border: '2px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#000000',
              fontSize: '1.2rem',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
            }}
          >
            MG
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.5px', color: '#D4AF37', fontSize: '0.875rem' }}>
              MATAJAR
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem', color: mode === 'dark' ? '#ffffff' : '#1a1a1a', letterSpacing: '0.3px' }}>
              Asset Manager
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <List sx={{ px: 1.5, pt: 1.5 }}>
        {menuItems.map((item) => {
          // Check if user has permission to see this menu item
          if (item.roles && !item.roles.includes(user?.role)) {
            return null;
          }

          const isSelected = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  px: 1.5,
                  minHeight: '42px',
                  color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: '#000000',
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#000000',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? '#000000' : '#D4AF37', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '0.875rem',
                      color: 'inherit',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: mode === 'dark' ? '#000000' : '#ffffff',
          borderBottom: '2px solid #D4AF37',
          boxShadow: '0 2px 10px rgba(212, 175, 55, 0.2)',
          color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
              display: { xs: 'none', sm: 'block' },
              letterSpacing: '0.5px',
            }}
          >
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: '#D4AF37',
                  '&:hover': {
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    transform: 'rotate(180deg)',
                    transition: 'transform 0.3s ease',
                  },
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                backgroundColor: mode === 'dark' ? 'rgba(212, 175, 55, 0.05)' : 'rgba(212, 175, 55, 0.08)',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <IconButton
                size="small"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#D4AF37', color: '#000000', fontWeight: 700 }}>
                  {user?.firstName?.[0]}
                </Avatar>
              </IconButton>
            </Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#D4AF37', color: '#000000' }}>
                {user?.firstName?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.role?.toUpperCase()}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: mode === 'dark' ? '#0a0a0a' : '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          backgroundImage: mode === 'dark'
            ? 'radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.05) 0%, transparent 50%)',
          transition: 'background-color 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
