import { useState } from 'react';
import { authClient } from '@/auth';
import IconifyIcon from 'components/base/IconifyIcon';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

interface PasskeySetupDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const PasskeySetupDialog = ({ open, onClose, onSuccess }: PasskeySetupDialogProps) => {
    const [passkeyName, setPasskeyName] = useState("");
    const [passkeyError, setPasskeyError] = useState("");
    const [isAddingPasskey, setIsAddingPasskey] = useState(false);
    const [authenticatorType, setAuthenticatorType] = useState<"platform" | "cross-platform">("platform");

    const handleAddPasskey = async () => {
        if (!passkeyName.trim()) {
            setPasskeyError("Passkey name is required");
            return;
        }

        setIsAddingPasskey(true);
        setPasskeyError("");

        try {
            const response = await authClient.passkey.addPasskey({
                name: passkeyName.trim(),
                authenticatorAttachment: authenticatorType,
            });

            if (response?.error) {
                setPasskeyError(response.error.message || "Failed to add passkey");
            } else {
                setPasskeyName("");
                setAuthenticatorType("platform");
                onSuccess?.();
                onClose();
            }
        } catch (err) {
            setPasskeyError("An unexpected error occurred");
        } finally {
            setIsAddingPasskey(false);
        }
    };

    const handleClose = () => {
        setPasskeyName("");
        setPasskeyError("");
        setAuthenticatorType("platform");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconifyIcon icon="mdi:fingerprint" fontSize={28} />
                    <Typography variant="h6">Set Up Passkey</Typography>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 3 }}>
                    Enhance your account security with a passkey. Use your fingerprint or device PIN for quick and secure access.
                </DialogContentText>

                {passkeyError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {passkeyError}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    required
                    label="Passkey Name"
                    placeholder="e.g., My iPhone, Work Laptop"
                    value={passkeyName}
                    onChange={(e) => {
                        setPasskeyName(e.target.value);
                        if (passkeyError === "Passkey name is required") {
                            setPasskeyError("");
                        }
                    }}
                    sx={{ mb: 3 }}
                    variant="outlined"
                    error={passkeyError === "Passkey name is required"}
                />

                <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ mb: 1 }}>
                        Authentication Method
                    </FormLabel>
                    <RadioGroup
                        value={authenticatorType}
                        onChange={(e) => setAuthenticatorType(e.target.value as "platform" | "cross-platform")}
                    >
                        <FormControlLabel
                            value="platform"
                            control={<Radio />}
                            label={
                                <Stack>
                                    <Typography variant="body1" sx={{ mr: 0.5 }}>
                                        <IconifyIcon icon="mdi:cellphone-key" sx={{ verticalAlign: "middle", mr: 1 }} />
                                        This Device
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        (Use biometrics or PIN on this device)
                                    </Typography>
                                </Stack>
                            }
                        />
                        <FormControlLabel
                            value="cross-platform"
                            control={<Radio />}
                            label={
                                <Stack>
                                    <Typography variant="body1" sx={{ mr: 0.5 }}>
                                        <IconifyIcon icon="mdi:usb-flash-drive" sx={{ verticalAlign: "middle", mr: 1 }} />
                                        Security Key
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        (Use a USB security key or another device)
                                    </Typography>
                                </Stack>
                            }
                        />
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleAddPasskey}
                    variant="contained"
                    loading={isAddingPasskey}
                    loadingPosition="start"
                    startIcon={<IconifyIcon icon="mdi:shield-check" />}
                >
                    Set Up Passkey
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PasskeySetupDialog;
