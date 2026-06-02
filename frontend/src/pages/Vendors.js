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
  IconButton,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import vendorService from '../services/vendorService';
import { useAuth } from '../context/AuthContext';

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

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    website: '',
    paymentTerms: 'Net 30',
    notes: '',
    status: 'active',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorService.getVendors();
      setVendors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        contactPerson: vendor.contactPerson || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        website: vendor.website || '',
        paymentTerms: vendor.paymentTerms || 'Net 30',
        notes: vendor.notes || '',
        status: vendor.status,
      });
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        website: '',
        paymentTerms: 'Net 30',
        notes: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVendor(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingVendor) {
        await vendorService.updateVendor(editingVendor._id, formData);
        setSuccess('Vendor updated successfully');
      } else {
        await vendorService.createVendor(formData);
        setSuccess('Vendor created successfully');
      }
      handleCloseDialog();
      fetchVendors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save vendor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorService.deleteVendor(id);
        setSuccess('Vendor deleted successfully');
        fetchVendors();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete vendor');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Vendor Name', width: 200 },
    { field: 'contactPerson', headerName: 'Contact Person', width: 180 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: params.value === 'active' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            color: params.value === 'active' ? '#FFD700' : '#999',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <>
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(params.row)}
                title="Edit"
                sx={{ color: '#D4AF37' }}
              >
                <Edit />
              </IconButton>
              {user?.role === 'admin' && (
                <IconButton
                  size="small"
                  onClick={() => handleDelete(params.row._id)}
                  title="Delete"
                  sx={{ color: '#ff6b6b' }}
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
          Vendors
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
            Add Vendor
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
          backgroundColor: '#1a1a1a',
          border: '2px solid rgba(212, 175, 55, 0.3)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={vendors}
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
          {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.address.state}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Zip Code"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.address.country}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Terms"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                sx={formFieldStyles}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            {editingVendor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
