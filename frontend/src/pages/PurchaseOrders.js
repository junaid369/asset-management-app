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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Visibility, CheckCircle, Inventory2, WarningAmber } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import purchaseOrderService from '../services/purchaseOrderService';
import vendorService from '../services/vendorService';
import categoryService from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';

const statusColors = {
  draft: 'default',
  pending: 'info',
  approved: 'primary',
  ordered: 'warning',
  received: 'success',
  cancelled: 'error',
};

const getThemeStyles = (isDark) => ({
  heading: isDark ? '#ffffff' : '#2d3748',
  paperBg: isDark ? '#1a1a1a' : '#ffffff',
  fieldBg: isDark ? '#2a2a2a' : '#ffffff',
  fieldText: isDark ? '#ffffff' : '#2d3748',
  headerBg: isDark ? '#2a2a2a' : '#faf7ec',
  rowBg: isDark ? '#1a1a1a' : '#ffffff',
  rowHover: isDark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.06)',
  cellText: isDark ? '#ffffff' : '#2d3748',
  border: isDark ? '2px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(212, 175, 55, 0.25)',
  divider: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.06)',
  dialogBg: isDark ? '#1a1a1a' : '#ffffff',
  footerBg: isDark ? '#2a2a2a' : '#faf7ec',
  formField: {
    '& .MuiInputLabel-root': { color: '#B8941F' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' },
    '& .MuiOutlinedInput-root': {
      color: isDark ? '#ffffff' : '#2d3748',
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      '& fieldset': { borderColor: 'rgba(212, 175, 55, 0.35)' },
      '&:hover fieldset': { borderColor: '#D4AF37' },
      '&.Mui-focused fieldset': { borderColor: '#D4AF37', borderWidth: 2 },
    },
    '& .MuiSvgIcon-root': { color: '#D4AF37' },
    '& .MuiInputBase-input::placeholder': {
      color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
      opacity: 1,
    },
  },
});

export default function PurchaseOrders() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const t = getThemeStyles(isDark);
  const formFieldStyles = t.formField;
  const [pos, setPOs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openReceiveDialog, setOpenReceiveDialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [editingPO, setEditingPO] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    vendor: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    status: 'draft',
    notes: '',
    items: [],
  });

  const [newItem, setNewItem] = useState({
    description: '',
    category: '',
    brand: '',
    model: '',
    specifications: '',
    quantity: 1,
    unitPrice: 0,
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchVendors();
    fetchCategories();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await purchaseOrderService.getPurchaseOrders();
      setPOs(response.data.data);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
      setError('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorService.getVendors();
      setVendors(response.data.data.filter(v => v.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
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

  const handleOpenDialog = (po = null) => {
    if (po) {
      setEditingPO(po);
      setFormData({
        vendor: po.vendor._id || po.vendor,
        orderDate: po.orderDate ? po.orderDate.split('T')[0] : new Date().toISOString().split('T')[0],
        expectedDeliveryDate: po.expectedDeliveryDate ? po.expectedDeliveryDate.split('T')[0] : '',
        status: po.status,
        notes: po.notes || '',
        items: po.items || [],
      });
    } else {
      setEditingPO(null);
      setFormData({
        vendor: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        status: 'draft',
        notes: '',
        items: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPO(null);
    setNewItem({
      description: '',
      category: '',
      brand: '',
      model: '',
      specifications: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.unitPrice) {
      setError('Please fill in item description, quantity, and price');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const item = {
      ...newItem,
      totalPrice: newItem.quantity * newItem.unitPrice,
    };

    setFormData({
      ...formData,
      items: [...formData.items, item],
    });

    setNewItem({
      description: '',
      category: '',
      brand: '',
      model: '',
      specifications: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.vendor || formData.items.length === 0) {
        setError('Please select a vendor and add at least one item');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (editingPO) {
        await purchaseOrderService.updatePurchaseOrder(editingPO._id, formData);
        setSuccess('Purchase order updated successfully');
      } else {
        await purchaseOrderService.createPurchaseOrder(formData);
        setSuccess('Purchase order created successfully');
      }
      handleCloseDialog();
      fetchPurchaseOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save purchase order');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOpenReceiveDialog = (po) => {
    setSelectedPO(po);
    setOpenReceiveDialog(true);
  };

  const handleCloseReceiveDialog = () => {
    setOpenReceiveDialog(false);
    setSelectedPO(null);
  };

  const handleConfirmReceive = async () => {
    try {
      // Receive each item
      for (let i = 0; i < selectedPO.items.length; i++) {
        const item = selectedPO.items[i];
        const qtyToReceive = item.quantity - (item.receivedQuantity || 0);
        if (qtyToReceive > 0) {
          await purchaseOrderService.receivePurchaseOrderItems(selectedPO._id, {
            itemIndex: i,
            quantityReceived: qtyToReceive,
          });
        }
      }
      setSuccess(`Successfully received all items and created assets!`);
      handleCloseReceiveDialog();
      fetchPurchaseOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to receive items');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await purchaseOrderService.deletePurchaseOrder(id);
        setSuccess('Purchase order deleted successfully');
        fetchPurchaseOrders();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete purchase order');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const columns = [
    { field: 'poNumber', headerName: 'PO Number', width: 150 },
    {
      field: 'vendor',
      headerName: 'Vendor',
      width: 180,
      valueGetter: (params) => params.row.vendor?.name || 'N/A',
    },
    {
      field: 'orderDate',
      headerName: 'Order Date',
      width: 130,
      valueGetter: (params) => new Date(params.row.orderDate).toLocaleDateString(),
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      width: 140,
      valueGetter: (params) => `$${params.row.totalAmount.toLocaleString()}`,
    },
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
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/purchase-orders/${params.row._id}`)}
            title="View Details"
            sx={{
              color: '#4A9EFF',
              backgroundColor: 'rgba(74, 158, 255, 0.1)',
              border: '1px solid rgba(74, 158, 255, 0.3)',
              borderRadius: 1,
              padding: '6px',
              '&:hover': {
                backgroundColor: 'rgba(74, 158, 255, 0.2)',
                borderColor: '#4A9EFF',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <>
              {params.row.status !== 'received' && (
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(params.row)}
                  title="Edit"
                  sx={{
                    color: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: 1,
                    padding: '6px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      borderColor: '#FFD700',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
              {params.row.status === 'ordered' && (
                <IconButton
                  size="small"
                  onClick={() => handleOpenReceiveDialog(params.row)}
                  title="Receive Items & Create Assets"
                  sx={{
                    color: '#00d084',
                    backgroundColor: 'rgba(0, 208, 132, 0.15)',
                    border: '1px solid rgba(0, 208, 132, 0.4)',
                    borderRadius: 1,
                    padding: '6px',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        boxShadow: '0 0 0 0 rgba(0, 208, 132, 0.4)',
                      },
                      '50%': {
                        boxShadow: '0 0 0 4px rgba(0, 208, 132, 0.1)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 208, 132, 0.25)',
                      borderColor: '#00d084',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              )}
              {user?.role === 'admin' && params.row.status !== 'received' && (
                <IconButton
                  size="small"
                  onClick={() => handleDelete(params.row._id)}
                  title="Delete"
                  sx={{
                    color: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    borderRadius: 1,
                    padding: '6px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 107, 107, 0.2)',
                      borderColor: '#ff6b6b',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </>
          )}
        </Box>
      ),
    },
  ];

  const totalAmount = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: t.heading,
            letterSpacing: '0.5px',
          }}
        >
          Purchase Orders
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
            Create Purchase Order
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
          backgroundColor: t.paperBg,
          border: t.border,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={pos}
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
              backgroundColor: t.paperBg,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: t.headerBg,
              borderBottom: '2px solid #D4AF37',
              color: '#B8941F',
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: '#B8941F',
              fontWeight: 700,
            },
            '& .MuiDataGrid-row': {
              backgroundColor: t.rowBg,
              borderBottom: t.divider,
              '&:hover': {
                backgroundColor: t.rowHover,
              },
            },
            '& .MuiDataGrid-cell': {
              color: t.cellText,
              borderBottom: t.divider,
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: t.footerBg,
              borderTop: '2px solid #D4AF37',
              color: t.cellText,
            },
            '& .MuiTablePagination-root': {
              color: t.cellText,
            },
            '& .MuiIconButton-root': {
              color: '#D4AF37',
            },
            '& .MuiDataGrid-overlay': {
              backgroundColor: t.paperBg,
              color: t.cellText,
            },
          }}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: t.dialogBg,
            border: t.border,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: t.headerBg,
            borderBottom: '2px solid #D4AF37',
            color: '#B8941F',
            fontWeight: 700,
            fontSize: '1.25rem',
          }}
        >
          {editingPO ? `Edit PO: ${editingPO.poNumber}` : 'Create Purchase Order'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Vendor"
                required
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                sx={formFieldStyles}
              >
                {vendors.map((v) => (
                  <MenuItem key={v._id} value={v._id}>
                    {v.name}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                sx={formFieldStyles}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="ordered">Ordered</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Order Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expected Delivery Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>

            {/* Add Items Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700, mt: 2, mb: 2 }}>
                Add Items
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                sx={formFieldStyles}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Brand"
                value={newItem.brand}
                onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Model"
                value={newItem.model}
                onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Specifications"
                value={newItem.specifications}
                onChange={(e) => setNewItem({ ...newItem, specifications: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleAddItem}
                sx={{
                  height: '56px',
                  borderColor: '#D4AF37',
                  color: '#D4AF37',
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  },
                }}
              >
                Add Item
              </Button>
            </Grid>

            {/* Items Table */}
            {formData.items.length > 0 && (
              <Grid item xs={12}>
                <TableContainer
                  component={Paper}
                  sx={{ backgroundColor: t.headerBg, mt: 2 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ borderBottom: '2px solid #D4AF37' }}>
                        <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }}>Description</TableCell>
                        <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }}>Brand/Model</TableCell>
                        <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }} align="right">Qty</TableCell>
                        <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }} align="right">Unit Price</TableCell>
                        <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }} align="right">Total</TableCell>
                        <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }} align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ color: t.cellText }}>{item.description}</TableCell>
                          <TableCell sx={{ color: t.cellText }}>{item.brand} {item.model}</TableCell>
                          <TableCell sx={{ color: t.cellText }} align="right">{item.quantity}</TableCell>
                          <TableCell sx={{ color: t.cellText }} align="right">${item.unitPrice}</TableCell>
                          <TableCell sx={{ color: '#FFD700', fontWeight: 700 }} align="right">
                            ${item.totalPrice}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveItem(index)}
                              sx={{ color: '#ff6b6b' }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ borderTop: '2px solid #D4AF37' }}>
                        <TableCell colSpan={4} sx={{ color: '#FFD700', fontWeight: 700 }} align="right">
                          TOTAL:
                        </TableCell>
                        <TableCell sx={{ color: '#FFD700', fontWeight: 700, fontSize: '1.2rem' }} align="right">
                          ${totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: t.footerBg,
            borderTop: '2px solid #D4AF37',
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: isDark ? '#ffffff' : '#2d3748',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formData.items.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
              color: '#000000',
              fontWeight: 700,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              },
              '&:disabled': {
                background: '#666',
                color: '#999',
              },
            }}
          >
            {editingPO ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receive Items Confirmation Dialog */}
      <Dialog
        open={openReceiveDialog}
        onClose={handleCloseReceiveDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: t.dialogBg,
            border: '3px solid #D4AF37',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(212, 175, 55, 0.4)',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: t.headerBg,
            borderBottom: '2px solid #D4AF37',
            color: '#B8941F',
            fontWeight: 700,
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 3,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'rgba(255, 215, 0, 0.15)',
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inventory2 sx={{ fontSize: '2rem', color: '#FFD700' }} />
          </Box>
          Receive Purchase Order
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 2,
                p: 3,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#FFD700',
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {selectedPO?.poNumber}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: t.cellText,
                  mb: 1,
                }}
              >
                Vendor: <span style={{ color: '#D4AF37', fontWeight: 700 }}>{selectedPO?.vendor?.name}</span>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: t.cellText,
                }}
              >
                Total Items: <span style={{ color: '#D4AF37', fontWeight: 700 }}>{selectedPO?.items?.length || 0}</span>
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: 'rgba(0, 208, 132, 0.1)',
                border: '2px solid rgba(0, 208, 132, 0.3)',
                borderRadius: 2,
                p: 2.5,
                mb: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: t.cellText,
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                }}
              >
                <CheckCircle sx={{ verticalAlign: 'middle', mr: 1, color: '#00d084', fontSize: '1.3rem' }} />
                Receiving this purchase order will <strong style={{ color: '#00d084' }}>automatically create assets</strong> for all items in your inventory.
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                border: '2px solid rgba(255, 193, 7, 0.3)',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <WarningAmber sx={{ color: '#FFC107', fontSize: '1.5rem', mt: 0.3 }} />
              <Typography
                variant="body2"
                sx={{
                  color: '#FFC107',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                This action cannot be undone. Make sure all items have been physically received before confirming.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: t.footerBg,
            borderTop: '2px solid #D4AF37',
            px: 3,
            py: 2.5,
            gap: 2,
          }}
        >
          <Button
            onClick={handleCloseReceiveDialog}
            variant="outlined"
            sx={{
              borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              color: isDark ? '#ffffff' : '#2d3748',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: isDark ? '#ffffff' : '#2d3748',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReceive}
            variant="contained"
            startIcon={<CheckCircle />}
            sx={{
              background: 'linear-gradient(135deg, #00d084 0%, #00b371 100%)',
              color: '#ffffff',
              fontWeight: 700,
              px: 4,
              py: 1,
              boxShadow: '0 4px 15px rgba(0, 208, 132, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00b371 0%, #009960 100%)',
                boxShadow: '0 6px 20px rgba(0, 208, 132, 0.6)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Confirm & Receive
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
