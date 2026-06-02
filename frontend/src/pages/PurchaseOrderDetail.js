import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import { ArrowBack, CheckCircle, LocalShipping } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import purchaseOrderService from '../services/purchaseOrderService';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  draft: 'default',
  pending: 'info',
  approved: 'primary',
  ordered: 'warning',
  received: 'success',
  cancelled: 'error',
};

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [po, setPO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const fetchPurchaseOrder = async () => {
    try {
      const response = await purchaseOrderService.getPurchaseOrder(id);
      setPO(response.data.data);
    } catch (error) {
      console.error('Failed to fetch purchase order:', error);
      setError('Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveItems = async () => {
    try {
      for (let i = 0; i < po.items.length; i++) {
        const item = po.items[i];
        const qtyToReceive = item.quantity - (item.receivedQuantity || 0);
        if (qtyToReceive > 0) {
          await purchaseOrderService.receivePurchaseOrderItems(po._id, {
            itemIndex: i,
            quantityReceived: qtyToReceive,
          });
        }
      }
      setSuccess('Successfully received all items and created assets!');
      fetchPurchaseOrder();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to receive items');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography sx={{ color: '#D4AF37', fontSize: '1.2rem' }}>Loading...</Typography>
      </Box>
    );
  }

  if (!po) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5" sx={{ color: '#ff6b6b', mb: 2 }}>
          Purchase Order Not Found
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/purchase-orders')}
          sx={{ color: '#D4AF37', borderColor: '#D4AF37' }}
        >
          Back to Purchase Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/purchase-orders')}
            sx={{
              borderColor: '#D4AF37',
              color: '#D4AF37',
              '&:hover': {
                borderColor: '#FFD700',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
              },
            }}
          >
            Back
          </Button>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#FFD700',
              letterSpacing: '0.5px',
            }}
          >
            {po.poNumber}
          </Typography>
          <Chip label={po.status} color={statusColors[po.status]} size="medium" />
        </Box>
        {po.status === 'ordered' && (user?.role === 'admin' || user?.role === 'manager') && (
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={handleReceiveItems}
            sx={{
              background: 'linear-gradient(135deg, #00d084 0%, #00b371 100%)',
              color: '#ffffff',
              fontWeight: 700,
              px: 3,
              py: 1.2,
              boxShadow: '0 4px 15px rgba(0, 208, 132, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00b371 0%, #009960 100%)',
                boxShadow: '0 6px 20px rgba(0, 208, 132, 0.6)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Receive All Items
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

      {/* Purchase Order Details */}
      <Paper
        sx={{
          backgroundColor: '#1a1a1a',
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
            mb: 3,
            pb: 1,
            borderBottom: '2px solid #D4AF37',
          }}
        >
          Purchase Order Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#D4AF37', fontSize: '0.875rem', mb: 0.5 }}>
                Vendor
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600 }}>
                {po.vendor?.name || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#D4AF37', fontSize: '0.875rem', mb: 0.5 }}>
                Status
              </Typography>
              <Chip label={po.status} color={statusColors[po.status]} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#D4AF37', fontSize: '0.875rem', mb: 0.5 }}>
                Order Date
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '1rem' }}>
                {new Date(po.orderDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#D4AF37', fontSize: '0.875rem', mb: 0.5 }}>
                Expected Delivery
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '1rem' }}>
                {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#D4AF37', fontSize: '0.875rem', mb: 0.5 }}>
                Total Amount
              </Typography>
              <Typography sx={{ color: '#FFD700', fontSize: '1.3rem', fontWeight: 700 }}>
                ${po.totalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          {po.notes && (
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Typography sx={{ color: '#D4AF37', fontSize: '0.875rem', mb: 0.5 }}>
                  Notes
                </Typography>
                <Typography sx={{ color: '#ffffff', fontSize: '1rem', fontStyle: 'italic' }}>
                  {po.notes}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper
        sx={{
          backgroundColor: '#1a1a1a',
          border: '2px solid rgba(212, 175, 55, 0.3)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, borderBottom: '2px solid #D4AF37' }}>
          <Typography
            variant="h6"
            sx={{
              color: '#FFD700',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LocalShipping /> Items
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2a2a2a', borderBottom: '2px solid #D4AF37' }}>
                <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }}>Brand/Model</TableCell>
                <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }}>Specifications</TableCell>
                <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }} align="right">Quantity</TableCell>
                <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }} align="right">Unit Price</TableCell>
                <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }} align="right">Total</TableCell>
                <TableCell sx={{ color: '#D4AF37', fontWeight: 700 }} align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {po.items.map((item, index) => {
                const receivedQty = item.receivedQuantity || 0;
                const isFullyReceived = receivedQty >= item.quantity;
                return (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: isFullyReceived ? 'rgba(0, 208, 132, 0.05)' : '#1a1a1a',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <TableCell sx={{ color: '#ffffff' }}>{item.description}</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>
                      {item.category?.name || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>
                      {item.brand || 'N/A'} {item.model || ''}
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff', fontSize: '0.85rem' }}>
                      {item.specifications || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff' }} align="right">
                      {item.quantity}
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff' }} align="right">
                      ${item.unitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#FFD700', fontWeight: 700 }} align="right">
                      ${item.totalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {isFullyReceived ? (
                        <Chip
                          label="Received"
                          size="small"
                          icon={<CheckCircle />}
                          sx={{
                            backgroundColor: 'rgba(0, 208, 132, 0.2)',
                            color: '#00d084',
                            border: '1px solid #00d084',
                            fontWeight: 600,
                          }}
                        />
                      ) : (
                        <Chip
                          label="Pending"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 193, 7, 0.2)',
                            color: '#FFC107',
                            border: '1px solid #FFC107',
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow sx={{ backgroundColor: '#2a2a2a', borderTop: '2px solid #D4AF37' }}>
                <TableCell colSpan={6} sx={{ color: '#FFD700', fontWeight: 700, fontSize: '1.1rem' }} align="right">
                  GRAND TOTAL:
                </TableCell>
                <TableCell sx={{ color: '#FFD700', fontWeight: 700, fontSize: '1.3rem' }} align="right">
                  ${po.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Created Assets Section */}
      {po.status === 'received' && po.items.some(item => item.createdAssets && item.createdAssets.length > 0) && (
        <Paper
          sx={{
            backgroundColor: '#1a1a1a',
            border: '2px solid rgba(0, 208, 132, 0.4)',
            borderRadius: 2,
            p: 3,
            mt: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#00d084',
              fontWeight: 700,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CheckCircle /> Created Assets
          </Typography>
          <Typography sx={{ color: '#ffffff', mb: 2 }}>
            This purchase order has automatically created the following assets:
          </Typography>
          {po.items.map((item, idx) => (
            item.createdAssets && item.createdAssets.length > 0 && (
              <Box key={idx} sx={{ mb: 2 }}>
                <Typography sx={{ color: '#D4AF37', fontSize: '0.9rem', mb: 1 }}>
                  {item.description}: {item.createdAssets.length} assets created
                </Typography>
              </Box>
            )
          ))}
        </Paper>
      )}
    </Box>
  );
}
