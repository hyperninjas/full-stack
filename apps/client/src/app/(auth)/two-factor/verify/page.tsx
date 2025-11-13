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
    Link,
} from "@mui/material";
import { authClient } from "@/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { rootPaths } from "routes/paths";
import IconifyIcon from "components/base/IconifyIcon";

export default function VerifyTwoFactorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [useBackupCode, setUseBackupCode] = useState(false);

    const handleVerify = async () => {
        setIsLoading(true);
        setError("");

        try {
            const { data, error } = await authClient.twoFactor.verifyTotp({
                code,
            });

            if (error) {
                setError(error.message || "Invalid code");
            } else if (data) {
                const redirectTo = searchParams.get("callbackURL") || rootPaths.root;
                router.push(redirectTo);
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: "auto", p: 3, mt: 10 }}>
            <Stack spacing={3}>
                <Stack alignItems="center" spacing={1}>
                    <IconifyIcon icon="mdi:shield-check" fontSize={48} color="primary.main" />
                    <Typography variant="h4" textAlign="center">
                        Two-Factor Authentication
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Enter the {useBackupCode ? "backup code" : "6-digit code"} from your authenticator app
                    </Typography>
                </Stack>

                <Card>
                    <CardContent>
                        <Stack spacing={3}>
                            {error && <Alert severity="error">{error}</Alert>}

                            <TextField
                                fullWidth
                                label={useBackupCode ? "Backup Code" : "Authentication Code"}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                variant="outlined"
                                placeholder={useBackupCode ? "Enter backup code" : "000000"}
                                inputProps={{
                                    maxLength: useBackupCode ? 20 : 6,
                                    style: { textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" },
                                }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleVerify}
                                loading={isLoading}
                                disabled={!code}
                            >
                                Verify
                            </Button>

                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => setUseBackupCode(!useBackupCode)}
                                sx={{ textAlign: "center" }}
                            >
                                {useBackupCode ? "Use authenticator code" : "Use backup code instead"}
                            </Link>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}
