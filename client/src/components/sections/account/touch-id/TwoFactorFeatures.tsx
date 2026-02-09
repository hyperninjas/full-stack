import { authClient } from '@/auth';
import { useState, useEffect } from 'react';
import { FormControl, FormControlLabel, Stack, Switch, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, CircularProgress, Box } from '@mui/material';
import QRCode from "react-qr-code";

const TwoFactorFeatures = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'enable' | 'disable'>('enable');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpURI, setTotpURI] = useState('');
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
      });

      if (error) {
        setError(error.message || 'Failed to enable 2FA');
        return;
      }

      if (data) {
        const totpRes = await authClient.twoFactor.getTotpUri({
          password
        });

        if (totpRes.error) {
          setError(totpRes.error.message || 'Failed to get QR code');
          return;
        }

        if (totpRes.data?.totpURI) {
          setTotpURI(totpRes.data.totpURI);
          setOpenPasswordDialog(false);
          setOpenQRDialog(true);
          setPassword('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: totpCode,
      });

      if (error) {
        setError(error.message || 'Invalid TOTP code');
        return;
      }

      // Successfully verified - show backup codes
      setTwoFactorEnabled(true);
      setOpenQRDialog(false);
      setTotpCode('');
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

  const handleCloseQRDialog = () => {
    setOpenQRDialog(false);
    setTotpCode('');
    setError('');
    setTotpURI('');
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

      {/* Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ fontSize: 16 }}>
          {dialogMode === 'enable' ? 'Enable' : 'Disable'} Two-Factor Authentication
        </DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={1} sx={{ minWidth: 300 }}>
            <Typography variant="body2">
              Enter password
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

      {/* QR Code and Verification Dialog */}
      <Dialog open={openQRDialog} onClose={handleCloseQRDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2}>
            <Typography variant="body2">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </Typography>
            {totpURI ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: 'white' }}>
                <QRCode value={totpURI} size={200} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            )}
            <Typography variant="body2">
              After scanning, enter the 6-digit code from your authenticator app:
            </Typography>
            <TextField
              type="text"
              label="6-digit TOTP Code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              fullWidth
              autoFocus
              error={!!error}
              helperText={error}
              inputProps={{ maxLength: 6 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQRDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleVerifyTOTP}
            variant="contained"
            disabled={loading || totpCode.length !== 6}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify & Enable'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TwoFactorFeatures;
