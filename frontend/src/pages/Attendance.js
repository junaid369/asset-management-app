import React, { useState, useEffect, useCallback } from 'react';
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
import { Add, Edit, Delete, Login as LoginIcon, Logout as LogoutIcon } from '@mui/icons-material';
import attendanceService from '../services/attendanceService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'holiday', label: 'Holiday' },
];

const STATUS_COLORS = {
  present: { bg: 'rgba(76, 175, 80, 0.18)', text: '#43a047' },
  late: { bg: 'rgba(255, 193, 7, 0.2)', text: '#f9a825' },
  absent: { bg: 'rgba(244, 67, 54, 0.18)', text: '#e53935' },
  'half-day': { bg: 'rgba(255, 152, 0, 0.18)', text: '#fb8c00' },
  'on-leave': { bg: 'rgba(33, 150, 243, 0.18)', text: '#1e88e5' },
  holiday: { bg: 'rgba(156, 39, 176, 0.18)', text: '#8e24aa' },
};

// Local YYYY-MM-DD for the <input type="date"> default
const todayStr = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60 * 1000).toISOString().slice(0, 10);
};

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

// Extract local "HH:MM" from a stored timestamp (for prefilling the time input)
const timeStr = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Combine a "YYYY-MM-DD" date and "HH:MM" time into an ISO timestamp (local tz).
// Returns '' when no time is provided so the field can be cleared.
const combineDateTime = (dateStr, time) => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(y, mo - 1, d, h, m).toISOString();
};

export default function Attendance() {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const isManager = user?.role === 'admin' || user?.role === 'manager';

  // Theme-aware tokens
  const t = {
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
  };

  const formFieldStyles = {
    '& .MuiInputLabel-root': { color: '#B8941F' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' },
    '& .MuiOutlinedInput-root': {
      color: t.fieldText,
      backgroundColor: t.fieldBg,
      '& fieldset': { borderColor: 'rgba(212, 175, 55, 0.35)' },
      '&:hover fieldset': { borderColor: '#D4AF37' },
      '&.Mui-focused fieldset': { borderColor: '#D4AF37', borderWidth: 2 },
    },
    '& .MuiSvgIcon-root': { color: '#D4AF37' },
    '& .MuiInputBase-input::placeholder': {
      color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
      opacity: 1,
    },
  };

  const goldOutlinedBtn = {
    color: isDark ? '#D4AF37' : '#B8941F',
    borderColor: 'rgba(212, 175, 55, 0.5)',
    fontWeight: 600,
    '&:hover': { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.08)' },
  };

  const goldContainedBtn = {
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
  };

  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(todayStr());
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    user: '',
    date: todayStr(),
    status: 'present',
    checkIn: '',
    checkOut: '',
    notes: '',
  });

  const flash = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(''), 3000);
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterDate ? { date: filterDate } : {};
      const response = await attendanceService.getAttendance(params);
      setRecords(response.data.data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      flash(setError, 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (!isManager) return;
    userService
      .getUsers()
      .then((res) => {
        // Only employees and managers can be marked — exclude admins
        const selectable = (res.data.data || []).filter(
          (u) => u.role === 'employee' || u.role === 'manager'
        );
        setUsers(selectable);
      })
      .catch((err) => console.error('Failed to fetch users:', err));
  }, [isManager]);

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn();
      flash(setSuccess, 'Checked in successfully');
      fetchRecords();
    } catch (err) {
      flash(setError, err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut();
      flash(setSuccess, 'Checked out successfully');
      fetchRecords();
    } catch (err) {
      flash(setError, err.response?.data?.message || 'Check-out failed');
    }
  };

  const handleOpenDialog = (record = null) => {
    if (record) {
      setEditing(record);
      setFormData({
        user: record.user?._id || record.user,
        date: (record.date || todayStr()).slice(0, 10),
        status: record.status,
        checkIn: timeStr(record.checkIn),
        checkOut: timeStr(record.checkOut),
        notes: record.notes || '',
      });
    } else {
      setEditing(null);
      setFormData({
        user: '',
        date: filterDate || todayStr(),
        status: 'present',
        checkIn: '',
        checkOut: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    const checkIn = combineDateTime(formData.date, formData.checkIn);
    const checkOut = combineDateTime(formData.date, formData.checkOut);

    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      flash(setError, 'Check-out time must be after check-in time');
      return;
    }

    const payload = {
      user: formData.user,
      date: formData.date,
      status: formData.status,
      checkIn,
      checkOut,
      notes: formData.notes,
    };

    try {
      if (editing) {
        await attendanceService.updateAttendance(editing._id, payload);
        flash(setSuccess, 'Attendance updated');
      } else {
        await attendanceService.markAttendance(payload);
        flash(setSuccess, 'Attendance marked');
      }
      handleCloseDialog();
      fetchRecords();
    } catch (err) {
      flash(setError, err.response?.data?.message || 'Failed to save attendance');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await attendanceService.deleteAttendance(id);
      flash(setSuccess, 'Record deleted');
      fetchRecords();
    } catch (err) {
      flash(setError, err.response?.data?.message || 'Failed to delete record');
    }
  };

  const columns = [
    {
      field: 'employee',
      headerName: 'Employee',
      width: 200,
      valueGetter: (params) =>
        params.row.user
          ? `${params.row.user.firstName || ''} ${params.row.user.lastName || ''}`.trim()
          : '—',
    },
    {
      field: 'employeeId',
      headerName: 'Emp ID',
      width: 120,
      valueGetter: (params) => params.row.user?.employeeId || '—',
    },
    {
      field: 'checkIn',
      headerName: 'Check In',
      width: 120,
      renderCell: (params) => formatTime(params.value),
    },
    {
      field: 'checkOut',
      headerName: 'Check Out',
      width: 120,
      renderCell: (params) => formatTime(params.value),
    },
    {
      field: 'workHours',
      headerName: 'Hours',
      width: 90,
      renderCell: (params) => (params.value ? params.value.toFixed(2) : '—'),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const c = STATUS_COLORS[params.value] || { bg: 'rgba(255,255,255,0.1)', text: '#999' };
        return (
          <Box
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: c.bg,
              color: c.text,
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {isManager && (
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
                  sx={{ color: '#e53935' }}
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
    <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: t.heading, letterSpacing: '0.5px' }}>
          Attendance
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<LoginIcon />} onClick={handleCheckIn} sx={goldOutlinedBtn}>
            Check In
          </Button>
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleCheckOut} sx={goldOutlinedBtn}>
            Check Out
          </Button>
          {isManager && (
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={goldContainedBtn}>
              Mark Attendance
            </Button>
          )}
        </Box>
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

      <Box sx={{ mb: 2, maxWidth: 240 }}>
        <TextField
          fullWidth
          type="date"
          label="Filter by date"
          InputLabelProps={{ shrink: true }}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          sx={formFieldStyles}
        />
      </Box>

      <Paper
        sx={{
          backgroundColor: t.paperBg,
          border: t.border,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={records}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-main': { backgroundColor: t.paperBg },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: t.headerBg,
              borderBottom: '2px solid #D4AF37',
              color: '#B8941F',
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            },
            '& .MuiDataGrid-columnHeaderTitle': { color: '#B8941F', fontWeight: 700 },
            '& .MuiDataGrid-row': {
              backgroundColor: t.rowBg,
              borderBottom: t.divider,
              '&:hover': { backgroundColor: t.rowHover },
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
            '& .MuiTablePagination-root': { color: t.cellText },
            '& .MuiTablePagination-selectIcon': { color: '#D4AF37' },
            '& .MuiIconButton-root': { color: '#D4AF37' },
            '& .MuiDataGrid-overlay': { backgroundColor: t.paperBg, color: t.cellText },
          }}
        />
      </Paper>

      {/* Mark / Edit Attendance Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
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
            letterSpacing: '0.5px',
          }}
        >
          {editing ? 'Edit Attendance' : 'Mark Attendance'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Employee"
                required
                disabled={!!editing}
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                sx={formFieldStyles}
              >
                {users.length === 0 && (
                  <MenuItem value="" disabled>
                    No employees available
                  </MenuItem>
                )}
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.firstName} {u.lastName}
                    {u.employeeId ? ` (${u.employeeId})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="time"
                label="Check In"
                InputLabelProps={{ shrink: true }}
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                sx={formFieldStyles}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="time"
                label="Check Out"
                InputLabelProps={{ shrink: true }}
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                sx={formFieldStyles}
              />
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
        <DialogActions sx={{ backgroundColor: t.footerBg, borderTop: '2px solid #D4AF37', px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: isDark ? '#ffffff' : '#2d3748',
              '&:hover': { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!editing && !formData.user}
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
            {editing ? 'Update' : 'Mark'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
