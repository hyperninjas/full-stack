import { authClient } from '@/auth';
import { useState, useEffect } from 'react';
import { FormControl, FormControlLabel, Stack, Switch, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, CircularProgress } from '@mui/material';

const TwoFactorFeatures = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'enable' | 'disable'>('enable');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await authClient.getSession();
        setTwoFactorEnabled(data?.user?.twoFactorEnabled || false);
      } catch (err) {
        console.error('Failed to fetch user session:', err);
      }
    };
    fetchUser();
  }, []);

  const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setDialogMode('enable');
      setOpenPasswordDialog(true);
    } else {
      setDialogMode('disable');
      setOpenPasswordDialog(true);
    }
  };

  const handleEnable2FA = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await authClient.twoFactor.enable({
        password,
        issuer: 'my-app-name',
      });

      if (error) {
        setError(error.message || 'Failed to enable 2FA');
        return;
      }

      if (data) {
        setTwoFactorEnabled(true);
        setOpenPasswordDialog(false);
        setPassword('');
        console.log('2FA enabled:', data);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await authClient.twoFactor.disable({
        password,
      });

      if (error) {
        setError(error.message || 'Failed to disable 2FA');
        setTwoFactorEnabled(true);
        return;
      }

      setTwoFactorEnabled(false);
      setOpenPasswordDialog(false);
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setTwoFactorEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenPasswordDialog(false);
    setPassword('');
    setError('');
  };

  const handleSubmit = () => {
    if (dialogMode === 'enable') {
      handleEnable2FA();
    } else {
      handleDisable2FA();
    }
  };

  return (
    <>
      <Stack direction="column" spacing={3}>
        <FormControl
          component="fieldset"
          variant="standard"
          sx={{ gap: 2, alignItems: 'flex-start' }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Manage 2FA Features
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorEnabled}
                onChange={handleSwitchChange}
                disabled={loading}
              />
            }
            label="Enable Two-Factor Authentication (2FA)"
            sx={{ gap: 2, ml: 0 }}
          />
        </FormControl>
      </Stack>

      <Dialog open={openPasswordDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogMode === 'enable' ? 'Enable' : 'Disable'} Two-Factor Authentication
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <Typography variant="body2">
              Please enter your password to {dialogMode === 'enable' ? 'enable' : 'disable'} 2FA
            </Typography>
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              autoFocus
              error={!!error}
              helperText={error}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !password}
            color={dialogMode === 'disable' ? 'error' : 'primary'}
          >
            {loading ? <CircularProgress size={24} /> : dialogMode === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TwoFactorFeatures;
