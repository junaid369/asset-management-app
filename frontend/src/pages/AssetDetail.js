import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, AssignmentInd, AssignmentReturn } from '@mui/icons-material';
import assetService from '../services/assetService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [assignData, setAssignData] = useState({
    userId: '',
    notes: '',
    expectedReturnDate: '',
  });
  const [returnData, setReturnData] = useState({
    returnCondition: 'good',
    returnNotes: '',
  });

  useEffect(() => {
    fetchAsset();
    fetchUsers();
  }, [id]);

  const fetchAsset = async () => {
    try {
      const response = await assetService.getAsset(id);
      setAsset(response.data.data);
    } catch (error) {
      console.error('Failed to fetch asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAssign = async () => {
    try {
      await assetService.assignAsset(id, assignData);
      setOpenAssignDialog(false);
      fetchAsset();
    } catch (error) {
      console.error('Failed to assign asset:', error);
    }
  };

  const handleReturn = async () => {
    try {
      await assetService.returnAsset(id, returnData);
      setOpenReturnDialog(false);
      fetchAsset();
    } catch (error) {
      console.error('Failed to return asset:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!asset) {
    return <Typography>Asset not found</Typography>;
  }

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/assets')}
        sx={{ mb: 2 }}
      >
        Back to Assets
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">{asset.name}</Typography>
          {canManage && (
            <Box>
              {asset.status === 'available' && (
                <Button
                  variant="contained"
                  startIcon={<AssignmentInd />}
                  onClick={() => setOpenAssignDialog(true)}
                >
                  Assign Asset
                </Button>
              )}
              {asset.status === 'assigned' && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AssignmentReturn />}
                  onClick={() => setOpenReturnDialog(true)}
                >
                  Return Asset
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Asset Tag
              </Typography>
              <Typography variant="body1">{asset.assetTag}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Category
              </Typography>
              <Typography variant="body1">{asset.category?.name}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Status
              </Typography>
              <Chip label={asset.status} color="primary" />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">{asset.description || 'N/A'}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Specifications
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Brand
              </Typography>
              <Typography variant="body1">{asset.brand || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Model
              </Typography>
              <Typography variant="body1">{asset.model || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Serial Number
              </Typography>
              <Typography variant="body1">{asset.serialNumber || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Condition
              </Typography>
              <Typography variant="body1">{asset.condition}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Purchase Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Purchase Date
              </Typography>
              <Typography variant="body1">
                {asset.purchaseDate
                  ? new Date(asset.purchaseDate).toLocaleDateString()
                  : 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Purchase Price
              </Typography>
              <Typography variant="body1">
                {asset.purchasePrice ? `$${asset.purchasePrice}` : 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Warranty Expiry
              </Typography>
              <Typography variant="body1">
                {asset.warrantyExpiry
                  ? new Date(asset.warrantyExpiry).toLocaleDateString()
                  : 'N/A'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Assignment Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Assigned To
              </Typography>
              <Typography variant="body1">
                {asset.assignedTo
                  ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
                  : 'Not assigned'}
              </Typography>
            </Box>
            {asset.assignedTo && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Assigned Date
                </Typography>
                <Typography variant="body1">
                  {new Date(asset.assignedDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Grid>

          {asset.qrCode && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                QR Code
              </Typography>
              <Box sx={{ mt: 2 }}>
                <img src={asset.qrCode} alt="Asset QR Code" style={{ maxWidth: 200 }} />
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Assign Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)}>
        <DialogTitle>Assign Asset</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Assign To"
            value={assignData.userId}
            onChange={(e) => setAssignData({ ...assignData, userId: e.target.value })}
            sx={{ mt: 2 }}
          >
            {users.map((u) => (
              <MenuItem key={u._id} value={u._id}>
                {u.firstName} {u.lastName} ({u.email})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={assignData.notes}
            onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Expected Return Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={assignData.expectedReturnDate}
            onChange={(e) =>
              setAssignData({ ...assignData, expectedReturnDate: e.target.value })
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={openReturnDialog} onClose={() => setOpenReturnDialog(false)}>
        <DialogTitle>Return Asset</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Return Condition"
            value={returnData.returnCondition}
            onChange={(e) =>
              setReturnData({ ...returnData, returnCondition: e.target.value })
            }
            sx={{ mt: 2 }}
          >
            <MenuItem value="excellent">Excellent</MenuItem>
            <MenuItem value="good">Good</MenuItem>
            <MenuItem value="fair">Fair</MenuItem>
            <MenuItem value="poor">Poor</MenuItem>
            <MenuItem value="damaged">Damaged</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Return Notes"
            multiline
            rows={3}
            value={returnData.returnNotes}
            onChange={(e) =>
              setReturnData({ ...returnData, returnNotes: e.target.value })
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReturnDialog(false)}>Cancel</Button>
          <Button onClick={handleReturn} variant="contained" color="secondary">
            Return
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
