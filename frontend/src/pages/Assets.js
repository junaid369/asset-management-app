import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Visibility, QrCode2 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import assetService from '../services/assetService';
import categoryService from '../services/categoryService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  available: 'success',
  assigned: 'warning',
  maintenance: 'error',
  retired: 'default',
  lost: 'error',
  damaged: 'error',
};

const formFieldStyles = {
  '& .MuiInputLabel-root': {
    color: '#D4AF37',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#FFD700',
  },
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    backgroundColor: '#2a2a2a',
    '& fieldset': {
      borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: '#D4AF37',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
      borderWidth: 2,
    },
  },
  '& .MuiSvgIcon-root': {
    color: '#D4AF37',
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'rgba(255, 255, 255, 0.4)',
    opacity: 1,
  },
};

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    status: 'available',
    assignedTo: '',
  });

  useEffect(() => {
    fetchAssets();
    fetchCategories();
    fetchUsers();
  }, [searchTerm, filterStatus]);

  const fetchAssets = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;

      const response = await assetService.getAssets(params);
      setAssets(response.data.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleOpenDialog = (asset = null) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        assetTag: asset.assetTag,
        name: asset.name,
        description: asset.description || '',
        category: asset.category._id,
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
        purchasePrice: asset.purchasePrice || '',
        status: asset.status,
        assignedTo: asset.assignedTo?._id || '',
      });
    } else {
      setEditingAsset(null);
      setFormData({
        assetTag: '',
        name: '',
        description: '',
        category: '',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        status: 'available',
        assignedTo: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAsset(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAsset) {
        await assetService.updateAsset(editingAsset._id, formData);
        setSuccess('Asset updated successfully');
      } else {
        // Remove assetTag from formData when creating new asset (it will be auto-generated)
        const { assetTag, ...dataWithoutTag } = formData;
        await assetService.createAsset(dataWithoutTag);
        setSuccess('Asset created successfully');
      }
      handleCloseDialog();
      fetchAssets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save asset');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetService.deleteAsset(id);
        setSuccess('Asset deleted successfully');
        fetchAssets();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete asset');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const columns = [
    { field: 'assetTag', headerName: 'Asset Tag', width: 130 },
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      valueGetter: (params) => params.row.category?.name || 'N/A',
    },
    { field: 'brand', headerName: 'Brand', width: 120 },
    { field: 'model', headerName: 'Model', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={statusColors[params.value]}
          size="small"
        />
      ),
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
      valueGetter: (params) => {
        if (params.row.assignedTo) {
          return `${params.row.assignedTo.firstName} ${params.row.assignedTo.lastName}`;
        }
        return 'Unassigned';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/assets/${params.row._id}`)}
            title="View Details"
          >
            <Visibility />
          </IconButton>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <>
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(params.row)}
                title="Edit"
              >
                <Edit />
              </IconButton>
              {user?.role === 'admin' && (
                <IconButton
                  size="small"
                  onClick={() => handleDelete(params.row._id)}
                  title="Delete"
                  color="error"
                >
                  <Delete />
                </IconButton>
              )}
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.5px',
          }}
        >
          Assets
        </Typography>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
              color: '#000000',
              fontWeight: 700,
              px: 3,
              py: 1.2,
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.5)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Add Asset
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper
        sx={{
          mb: 2,
          p: 3,
          backgroundColor: '#1a1a1a',
          border: '2px solid rgba(212, 175, 55, 0.3)',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by name, tag, or serial number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#D4AF37',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#FFD700',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  backgroundColor: '#2a2a2a',
                  '& fieldset': {
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#D4AF37',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFD700',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.4)',
                  opacity: 1,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#D4AF37',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#FFD700',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  backgroundColor: '#2a2a2a',
                  '& fieldset': {
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#D4AF37',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFD700',
                    borderWidth: 2,
                  },
                },
                '& .MuiSvgIcon-root': {
                  color: '#D4AF37',
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="retired">Retired</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        sx={{
          backgroundColor: '#1a1a1a',
          border: '2px solid rgba(212, 175, 55, 0.3)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={assets}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-main': {
              backgroundColor: '#1a1a1a',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#2a2a2a',
              borderBottom: '2px solid #D4AF37',
              color: '#D4AF37',
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: '#D4AF37',
              fontWeight: 700,
            },
            '& .MuiDataGrid-row': {
              backgroundColor: '#1a1a1a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(212, 175, 55, 0.08)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                },
              },
            },
            '& .MuiDataGrid-cell': {
              color: '#ffffff',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: '#2a2a2a',
              borderTop: '2px solid #D4AF37',
              color: '#ffffff',
            },
            '& .MuiTablePagination-root': {
              color: '#ffffff',
            },
            '& .MuiTablePagination-selectIcon': {
              color: '#D4AF37',
            },
            '& .MuiDataGrid-selectedRowCount': {
              color: '#D4AF37',
            },
            '& .MuiIconButton-root': {
              color: '#D4AF37',
            },
          }}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            border: '2px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#2a2a2a',
            borderBottom: '2px solid #D4AF37',
            color: '#FFD700',
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '0.5px',
          }}
        >
          {editingAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {editingAsset && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Asset Tag (Auto-generated)"
                  value={formData.assetTag}
                  disabled
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: '#2a2a2a',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#FFD700',
                      color: '#FFD700',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      cursor: 'not-allowed',
                    },
                    '& .MuiInputLabel-root.Mui-disabled': {
                      color: '#D4AF37',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#999',
                    },
                  }}
                  helperText="This field is auto-generated and cannot be modified"
                />
              </Grid>
            )}
            {!editingAsset && (
              <Grid item xs={12}>
                <Alert
                  severity="info"
                  sx={{
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    color: '#D4AF37',
                    border: '1px solid #D4AF37',
                    '& .MuiAlert-icon': {
                      color: '#D4AF37',
                    },
                  }}
                >
                  <strong>Asset Tag will be auto-generated</strong> in the format: MG-YYYY-001, MG-YYYY-002, etc.
                </Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                sx={formFieldStyles}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => {
                  setFormData({ ...formData, status: e.target.value });
                  // Clear assignedTo if status is not assigned
                  if (e.target.value !== 'assigned') {
                    setFormData(prev => ({ ...prev, assignedTo: '' }));
                  }
                }}
                sx={formFieldStyles}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
              </TextField>
            </Grid>
            {formData.status === 'assigned' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Assigned To"
                  required
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  sx={formFieldStyles}
                  helperText="Select user to assign this asset"
                >
                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} - {u.email}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: '#2a2a2a',
            borderTop: '2px solid #D4AF37',
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
              color: '#000000',
              fontWeight: 700,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
              },
            }}
          >
            {editingAsset ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
