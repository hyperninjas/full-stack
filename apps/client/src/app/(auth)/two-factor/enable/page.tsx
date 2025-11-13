"use client";

import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { authClient } from "@/auth";
import { useRouter } from "next/navigation";
import { rootPaths } from "routes/paths";
import IconifyIcon from "components/base/IconifyIcon";
import Image from "next/image";

export default function EnableTwoFactorPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [totpURI, setTotpURI] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"password" | "qr" | "success">("password");

    const handleEnable2FA = async () => {
        setIsLoading(true);
        setError("");

        try {
            const { data, error } = await authClient.twoFactor.enable({
                password,
                issuer: "YourAppName",
            });

            if (error) {
                setError(error.message || "Failed to enable 2FA");
            } else if (data) {
                // setQrCode(data.qrCode);
                setTotpURI(data.totpURI);
                setBackupCodes(data.backupCodes || []);
                setStep("qr");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = () => {
        router.push(rootPaths.root);
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
            <Stack spacing={3}>
                <Typography variant="h4">
                    <IconifyIcon icon="mdi:shield-lock" sx={{ mr: 1, verticalAlign: "middle" }} />
                    Enable Two-Factor Authentication
                </Typography>

                {step === "password" && (
                    <Card>
                        <CardContent>
                            <Stack spacing={3}>
                                <Typography variant="body1" color="text.secondary">
                                    Enter your password to enable two-factor authentication for enhanced security.
                                </Typography>

                                {error && <Alert severity="error">{error}</Alert>}

                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    variant="outlined"
                                />

                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleEnable2FA}
                                    loading={isLoading}
                                    disabled={!password}
                                >
                                    Continue
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {step === "qr" && (
                    <Card>
                        <CardContent>
                            <Stack spacing={3}>
                                <Typography variant="h6">Scan QR Code</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code:
                                </Typography>

                                {qrCode && (
                                    <Box sx={{ textAlign: "center", my: 2 }}>
                                        <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
                                    </Box>
                                )}

                                <Typography variant="body2" color="text.secondary">
                                    Or manually enter this code:
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={totpURI}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />

                                {backupCodes.length > 0 && (
                                    <>
                                        <Alert severity="warning">
                                            Save these backup codes in a secure place. You can use them to access your account if you lose your device.
                                        </Alert>
                                        <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
                                            {backupCodes.map((code, index) => (
                                                <Typography key={index} variant="body2" fontFamily="monospace">
                                                    {code}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </>
                                )}

                                <Button fullWidth variant="contained" onClick={handleComplete}>
                                    Complete Setup
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </Box>
    );
}
