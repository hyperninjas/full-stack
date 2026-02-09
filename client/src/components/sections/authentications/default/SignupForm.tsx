"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Link,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  TextField,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import * as yup from "yup";
import { useState } from "react";
import QRCode from "react-qr-code";
import { authClient } from "@/auth";
import Grid from "@mui/material/Grid";
import SocialAuth from "./SocialAuth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import paths, { rootPaths } from "routes/paths";
import IconifyIcon from "components/base/IconifyIcon";
import { yupResolver } from "@hookform/resolvers/yup";
import PasswordTextField from "components/common/PasswordTextField";

interface SignupFormProps {
  socialAuth?: boolean;
}

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
}

const schema = yup
  .object({
    name: yup.string().required("This field is required"),
    email: yup
      .string()
      .email("Please provide a valid email address.")
      .required("This field is required"),
    password: yup.string().required("This field is required"),
  })
  .required();

const SignupForm = ({
  socialAuth,
}: SignupFormProps) => {
  const router = useRouter();
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const [authenticatorType, setAuthenticatorType] = useState<"platform" | "cross-platform">("platform");
  const [passkeyError, setPasskeyError] = useState("");
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [totpCode, setTotpCode] = useState('');
  const [totpURI, setTotpURI] = useState('');
  const [qrError, setQrError] = useState('');
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    const { data: signupData, error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (signupData) {
      setShowSecurityDialog(true);
      await fetch2FAuth(data.password);
    }
    if (error) {
      setError('root.credential', { type: 'manual', message: error.message });
    }
  };

  const fetch2FAuth = async (password: string) => {
    try {
      const { data, error } = await authClient.twoFactor.enable({
        password,
      });

      if (!error && data) {
        const totpRes = await authClient.twoFactor.getTotpUri({
          password
        });

        if (totpRes.data?.totpURI) {
          setTotpURI(totpRes.data.totpURI);
        }
      }
    } catch (err) {
      console.error('Failed to fetch 2FA URI:', err);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setQrError('Please enter a valid 6-digit code');
      return;
    }

    setIsSettingUp2FA(true);
    setQrError('');

    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: totpCode,
      });

      if (error) {
        setQrError(error.message || 'Invalid TOTP code');
        return;
      }

      setShowSecurityDialog(false);
      router.push(rootPaths.root);
    } catch (err: any) {
      setQrError(err.message || 'An error occurred');
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  const handleAddPasskey = async () => {
    setIsAddingPasskey(true);
    setPasskeyError("");

    try {
      const response = await authClient.passkey.addPasskey({
        name: passkeyName || "My Device",
        authenticatorAttachment: authenticatorType,
      });

      if (response?.error) {
        setPasskeyError(response.error.message || "Failed to add passkey");
      } else if (response?.data) {
        router.push(rootPaths.root);
      } else {
        router.push(rootPaths.root);
      }
    } catch (err) {
      setPasskeyError("An unexpected error occurred");
    } finally {
      setIsAddingPasskey(false);
    }
  };

  const handleSkipPasskey = () => {
    setShowSecurityDialog(false);
    router.push(rootPaths.root);
  };

  return (
    <>
      <Stack
        direction='column'
        sx={{
          height: 1,
          alignItems: "center",
          justifyContent: "space-between",
          pt: { md: 10 },
          pb: 10,
        }}>
        <div />

        <Grid
          container
          sx={{
            height: 1,
            maxWidth: "35rem",
            rowGap: 4,
            alignContent: { md: "center" },
            p: { xs: 3, sm: 5 },
            mb: 5,
          }}>
          <Grid size={12}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "flex-end" },
              }}>
              <Typography variant='h4'>Sign up</Typography>
              <Typography
                variant='subtitle2'
                sx={{
                  color: "text.secondary",
                }}>
                Already have an account?
                <Link
                  href={paths.login}
                  sx={{ ml: 1 }}>
                  Log in
                </Link>
              </Typography>
            </Stack>
          </Grid>
          {socialAuth && (
            <>
              <Grid size={12}>
                <SocialAuth />
              </Grid>
              <Grid size={12}>
                <Divider sx={{ color: "text.secondary" }}>or use email</Divider>
              </Grid>
            </>
          )}
          <Grid size={12}>
            <Box component='form' noValidate onSubmit={handleSubmit(onSubmit)}>
              {errors.root?.credential?.message && (
                <Alert severity='error' sx={{ mb: 3 }}>
                  {errors.root?.credential?.message}
                </Alert>
              )}
              <Grid container>
                <Grid
                  sx={{
                    mb: 3,
                  }}
                  size={12}>
                  <TextField
                    fullWidth
                    size='large'
                    id='name'
                    type='text'
                    label='Name'
                    variant='filled'
                    error={!!errors.name}
                    helperText={<>{errors.name?.message}</>}
                    {...register("name")}
                  />
                </Grid>
                <Grid
                  sx={{
                    mb: 3,
                  }}
                  size={12}>
                  <TextField
                    fullWidth
                    size='large'
                    id='email'
                    type='email'
                    label='Email'
                    variant='filled'
                    error={!!errors.email}
                    helperText={<>{errors.email?.message}</>}
                    {...register("email")}
                  />
                </Grid>
                <Grid
                  sx={{
                    mb: 4,
                  }}
                  size={12}>
                  <PasswordTextField
                    fullWidth
                    size='large'
                    id='password'
                    label='Password'
                    variant='filled'
                    error={!!errors.password}
                    helperText={<>{errors.password?.message}</>}
                    {...register("password")}
                  />
                </Grid>
                <Grid
                  sx={{
                    mb: 2.5,
                  }}
                  size={12}>
                  <Typography variant='body2' sx={{ color: "text.secondary" }}>
                    <IconifyIcon
                      icon='material-symbols:info-outline-rounded'
                      fontSize={16}
                      color='warning.main'
                      sx={{ verticalAlign: "text-bottom" }}
                    />{" "}
                    This site is protected by reCAPTCHA and the Google Privacy
                    Policy and Terms of Service apply. By clicking the Create
                    Account button, you are agreeing to the{" "}
                    <Link href='#!'>terms and conditions.</Link>
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Button
                    fullWidth
                    type="submit"
                    size="large"
                    variant="contained"
                    loading={isSubmitting}
                    loadingPosition="start"
                  >
                    Create Account
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
        {/* <Link href='#!' variant='subtitle2' sx={{ flex: 1 }}>
          Trouble signing in?
        </Link> */}
      </Stack>

      <Dialog open={showSecurityDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab
              icon={<IconifyIcon icon="mdi:fingerprint" />}
              iconPosition="start"
              label="Set Up Passkey"
            />
            <Tab
              icon={<IconifyIcon icon="mdi:qrcode" />}
              iconPosition="start"
              label="Set QR Code"
            />
          </Tabs>
        </DialogTitle>
        <DialogContent>
          {activeTab === 0 && (
            <>
              <DialogContentText sx={{ mb: 3 }}>
                Enhance your account security with a passkey. Use your fingerprint, face, or device PIN for quick and secure access.
              </DialogContentText>

              {passkeyError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passkeyError}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Passkey Name"
                placeholder="e.g., My iPhone, Work Laptop"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                sx={{ mb: 3 }}
                variant="outlined"
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
            </>
          )}

          {activeTab === 1 && (
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

              {qrError && (
                <Alert severity="error">
                  {qrError}
                </Alert>
              )}

              <TextField
                type="text"
                label="6-digit TOTP Code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                fullWidth
                autoFocus
                error={!!qrError}
                inputProps={{ maxLength: 6 }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleSkipPasskey} color="inherit">
            Skip for Now
          </Button>
          {activeTab === 0 ? (
            <Button
              onClick={handleAddPasskey}
              variant="contained"
              loading={isAddingPasskey}
              loadingPosition="start"
              startIcon={<IconifyIcon icon="mdi:shield-check" />}
            >
              Set Up Passkey
            </Button>
          ) : (
            <Button
              onClick={handleVerifyTOTP}
              variant="contained"
              disabled={isSettingUp2FA || totpCode.length !== 6}
              loading={isSettingUp2FA}
              loadingPosition="start"
              startIcon={<IconifyIcon icon="mdi:shield-check" />}
            >
              Verify & Enable
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SignupForm;
