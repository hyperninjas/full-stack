import { authClient } from '@/auth';
import InfoCard from '../common/InfoCard';
import { useState, useEffect } from 'react';
import IconifyIcon from 'components/base/IconifyIcon';
import PasskeySetupDialog from './PasskeySetupDialog';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField, Typography } from '@mui/material';

const Biometrics = () => {
  const [open, setOpen] = useState(false);
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [passkeyToDelete, setPasskeyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passkeyToEdit, setPasskeyToEdit] = useState<{ id: string; name: string } | null>(null);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const fetchPasskeys = async () => {
    try {
      const { data, error } = await authClient.passkey.listUserPasskeys();
      if (error) {
        console.error('Error fetching passkeys:', error);
      } else if (data) {
        setPasskeys(data);
      }
    } catch (err) {
      console.error('Failed to fetch passkeys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasskeys();
  }, []);

  const handleDeletePasskey = async (passkeyId: string) => {
    setPasskeyToDelete(passkeyId);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!passkeyToDelete) return;

    setIsDeleting(true);
    try {
      const { data, error } = await authClient.passkey.deletePasskey({
        id: passkeyToDelete,
      });

      if (error) {
        console.error('Error deleting passkey:', error);
      } else {
        setPasskeys((prev) => prev.filter((pk) => pk.id !== passkeyToDelete));
      }
    } catch (err) {
      console.error('Failed to delete passkey:', err);
    } finally {
      setIsDeleting(false);
      setConfirmDialogOpen(false);
      setPasskeyToDelete(null);
    }
  };

  const handleEditPasskey = (passkeyId: string, currentName: string) => {
    setPasskeyToEdit({ id: passkeyId, name: currentName });
    setNewPasskeyName(currentName);
    setEditDialogOpen(true);
    setUpdateError("");
  };

  const confirmUpdate = async () => {
    if (!passkeyToEdit || !newPasskeyName.trim()) {
      setUpdateError("Passkey name is required");
      return;
    }

    setIsUpdating(true);
    setUpdateError("");

    try {
      const { error } = await authClient.passkey.updatePasskey({
        id: passkeyToEdit.id,
        name: newPasskeyName.trim(),
      });

      if (error) {
        setUpdateError(error.message || "Failed to update passkey");
      } else {
        // Refetch passkeys to sync with server
        await fetchPasskeys();
        setEditDialogOpen(false);
        setPasskeyToEdit(null);
        setNewPasskeyName("");
      }
    } catch (err) {
      setUpdateError("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasskeySuccess = () => {
    fetchPasskeys();
  };

  return (
    <>
      <Stack direction="column" spacing={2}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Manage Passkey Features
        </Typography>
        <Stack direction="column" spacing={1}>
          {loading ? (
            <Typography variant="body2" color="text.secondary">Loading...</Typography>
          ) : passkeys.length > 0 ? (
            passkeys.map((passkey, index) => (
              <InfoCard
                key={passkey.id || index}
                sx={{
                  alignItems: 'center',
                  '&:hover': {
                    cursor: 'pointer',
                    bgcolor: 'background.elevation2',
                    '& .iconify': {
                      visibility: 'visible',
                    },
                  },
                }}
              >
                <Stack spacing={2} sx={{ alignItems: 'center' }}>
                  <IconifyIcon icon="material-symbols-light:fingerprint" sx={{ fontSize: 40 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {passkey.name || `Fingerprint ${index + 1}`}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <IconifyIcon
                    icon="material-symbols:edit-outline-rounded"
                    sx={{ fontSize: 20, color: 'neutral.dark', visibility: 'hidden' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPasskey(passkey.id, passkey.name || `Fingerprint ${index + 1}`);
                    }}
                  />
                  <IconifyIcon
                    icon="material-symbols:delete-outline-rounded"
                    sx={{ fontSize: 20, color: 'neutral.dark', visibility: 'hidden' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePasskey(passkey.id);
                    }}
                  />
                </Stack>
              </InfoCard>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No passkeys found</Typography>
          )}
        </Stack>
        {passkeys.length < 1 && (
          <Button
            variant="soft"
            color="neutral"
            fullWidth
            startIcon={<IconifyIcon icon="material-symbols:add" sx={{ fontSize: 20 }} />}
            onClick={() => setOpen(true)}
          >
            Add Passkey
          </Button>
        )}
      </Stack>

      <PasskeySetupDialog
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handlePasskeySuccess}
      />

      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setPasskeyToEdit(null);
          setNewPasskeyName("");
          setUpdateError("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Passkey Name</DialogTitle>
        <DialogContent>
          {updateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updateError}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Passkey Name"
            value={newPasskeyName}
            onChange={(e) => {
              setNewPasskeyName(e.target.value);
              if (updateError === "Passkey name is required") {
                setUpdateError("");
              }
            }}
            variant="outlined"
            sx={{ mt: 1 }}
            error={updateError === "Passkey name is required"}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setPasskeyToEdit(null);
              setNewPasskeyName("");
              setUpdateError("");
            }}
            color="inherit"
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmUpdate}
            variant="contained"
            loading={isUpdating}
            loadingPosition="start"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            width: 450,
          },
        }}
      >
        <DialogTitle
          component="h6"
          sx={{
            pt: 3,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Are you sure to delete?
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <DialogContentText
            component={Typography}
            variant="body2"
            sx={{ color: 'text.secondary', textAlign: 'center' }}
          >
            This action cannot be undone. You will need to set up a new passkey if you want to use this feature again.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            justifyContent: 'center',
          }}
        >
          <Button variant="soft" color="neutral" onClick={() => setConfirmDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            onClick={confirmDelete}
            loading={isDeleting}
            loadingPosition="start"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Biometrics;
