'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogContent,
} from '@mui/material';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { authClient } from '@/auth';
import Grid from '@mui/material/Grid';
import SocialAuth from './SocialAuth';
import { rootPaths } from 'routes/paths';
import useCountdown from 'hooks/useCountdown';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';
import PasswordTextField from 'components/common/PasswordTextField';
import DefaultCredentialAlert from '../common/DefaultCredentialAlert';
import { useState, useEffect, useRef, ChangeEvent, Fragment } from 'react';

interface LoginFormProps {
  signUpLink: string;
  socialAuth?: boolean;
  forgotPasswordLink?: string;
  rememberDevice?: boolean;
  defaultCredential?: { email: string; password: string };
}

const schema = yup.object({
  email: yup
    .string()
    .email('Please provide a valid email address.')
    .required('This field is required'),
  password: yup.string().required('This field is required'),
  rememberMe: yup.boolean().required().default(false),
});

export type LoginFormValues = yup.InferType<typeof schema>;

const totalInputLength = 6;

const LoginForm = ({
  signUpLink,
  forgotPasswordLink,
  socialAuth = true,
  rememberDevice = true,
  defaultCredential,
}: LoginFormProps) => {
  const router = useRouter();
  const [passkeyError, setPasskeyError] = useState("");
  const [isSigningInWithPasskey, setIsSigningInWithPasskey] = useState(false);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);

  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const [otp, setOtp] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpSent, setOtpSent] = useState(false);
  const { time, startTimer } = useCountdown();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      rememberMe: false,
    },
  });

  useEffect(() => {
    const checkPasskeyAvailability = async () => {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setPasskeyAvailable(available);

        if (available) {
          handlePasskeySignIn(true);
        }
      }
    };

    checkPasskeyAvailability();
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    const { data: loginData, error } = await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      },
      {
        async onSuccess(context) {
          if (context.data.twoFactorRedirect) {
            setShow2FADialog(true);
            sentOtp();
          } else {
            router.push(callbackUrl ? callbackUrl : rootPaths.root);
          }
        },
      }
    );

    if (error) {
      setError('root.credential', { type: 'manual', message: error.message });
    }
  };

  const handleVerify2FA = async () => {
    if (!otp || otp.length !== totalInputLength) {
      setTwoFactorError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying2FA(true);
    setTwoFactorError('');

    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code: otp,
      });

      if (error) {
        setTwoFactorError(error.message || 'Invalid verification code');
        inputRefs.current.forEach((input) => {
          if (input) input.value = '';
        });
        setOtp('');
        inputRefs.current[0]?.focus();
        return;
      }

      if (data) {
        setShow2FADialog(false);
        router.push(callbackUrl ? callbackUrl : rootPaths.root);
      }
    } catch (err: any) {
      setTwoFactorError(err.message || 'An error occurred during verification');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleClose2FADialog = () => {
    setShow2FADialog(false);
    setOtp('');
    setTwoFactorError('');
    inputRefs.current.forEach((input) => {
      if (input) input.value = '';
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number): void => {
    const { value } = e.target;
    if (value) {
      [...value].slice(0, totalInputLength).forEach((char, charIndex) => {
        if (inputRefs.current && inputRefs.current[index + charIndex]) {
          inputRefs.current[index + charIndex]!.value = char;
          inputRefs.current[index + charIndex + 1]?.focus();
        }
      });
      const updatedOtp = inputRefs.current.reduce((acc, input) => acc + (input?.value || ''), '');
      setOtp(updatedOtp);
    }
  };

  const handleKeydown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Backspace') {
      inputRefs.current[index]!.value = '';
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();

      const updatedOtp = inputRefs.current.reduce((acc, input) => acc + (input?.value || ''), '');
      setOtp(updatedOtp);
    }
    if (event.key === 'ArrowLeft') {
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    }
    if (event.key === 'ArrowRight') {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const sentOtp = () => {
    setOtpSent(true);
    startTimer(30, () => {
      setOtpSent(false);
    });
  };

  useEffect(() => {
    sentOtp();
  }, []);

  const handlePasskeySignIn = async (autoFill: boolean = false) => {
    setIsSigningInWithPasskey(true);
    setPasskeyError("");

    try {
      const { data, error } = await authClient.signIn.passkey({
        autoFill,
      });

      if (error) {
        if (!autoFill) {
          setPasskeyError(error.message || "Failed to sign in with passkey");
        }
      } else if (data) {
        router.push(callbackUrl ? callbackUrl : rootPaths.root);
      }
    } catch (err) {
      if (!autoFill) {
        setPasskeyError("An unexpected error occurred");
      }
    } finally {
      setIsSigningInWithPasskey(false);
    }
  };

  return (
    <>
      <Stack
        direction="column"
        sx={{
          height: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: { md: 10 },
          pb: 10,
        }}
      >
        <Grid
          container
          sx={{
            maxWidth: '35rem',
            rowGap: 4,
            p: { xs: 3, sm: 5 },
            mb: 5,
          }}
        >
          <Grid size={12}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'flex-end' },
              }}
            >
              <Typography variant="h4">Log in</Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                Don&apos;t have an account?
                <Link href={signUpLink} sx={{ ml: 1 }}>
                  Sign up
                </Link>
              </Typography>
            </Stack>
          </Grid>

          {passkeyAvailable && (
            <Grid size={12}>
              <Button
                fullWidth
                size="large"
                variant="outlined"
                onClick={() => handlePasskeySignIn(false)}
                loading={isSigningInWithPasskey}
                loadingPosition="start"
                startIcon={<IconifyIcon icon="mdi:fingerprint" />}
                sx={{
                  borderStyle: 'dashed',
                  py: 1.5,
                }}
              >
                Sign in with Passkey
              </Button>
              {passkeyError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {passkeyError}
                </Alert>
              )}
            </Grid>
          )}

          {passkeyAvailable && (
            <Grid size={12}>
              <Divider sx={{ color: 'text.secondary' }}>or</Divider>
            </Grid>
          )}

          {socialAuth && (
            <>
              <Grid size={12}>
                <SocialAuth />
              </Grid>
              <Grid size={12}>
                <Divider sx={{ color: 'text.secondary' }}>or use email</Divider>
              </Grid>
            </>
          )}

          <Grid size={12}>
            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              {errors.root?.credential?.message && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errors.root?.credential?.message}
                </Alert>
              )}
              {defaultCredential && <DefaultCredentialAlert />}
              <Grid container>
                <Grid
                  sx={{
                    mb: 3,
                  }}
                  size={12}
                >
                  <TextField
                    fullWidth
                    size="large"
                    id="email"
                    type="email"
                    label="Email"
                    defaultValue={defaultCredential?.email}
                    error={!!errors.email}
                    helperText={<>{errors.email?.message}</>}
                    {...register('email')}
                  />
                </Grid>
                <Grid
                  sx={{
                    mb: 2.5,
                  }}
                  size={12}
                >
                  <PasswordTextField
                    fullWidth
                    size="large"
                    id="password"
                    label="Password"
                    defaultValue={defaultCredential?.password}
                    error={!!errors.password}
                    helperText={<>{errors.password?.message}</>}
                    {...register('password')}
                  />
                </Grid>
                <Grid
                  sx={{
                    mb: 6,
                  }}
                  size={12}
                >
                  <Stack
                    spacing={1}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {rememberDevice && (
                      <FormControlLabel
                        control={<Checkbox color="primary" size="small" {...register('rememberMe')} />}
                        label={
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: 'text.secondary',
                            }}
                          >
                            Remember this device
                          </Typography>
                        }
                      />
                    )}

                    {forgotPasswordLink && (
                      <Link href={forgotPasswordLink} variant="subtitle2">
                        Forgot Password?
                      </Link>
                    )}
                  </Stack>
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
                    Log in
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
        {/* <Link href="#!" variant="subtitle2">
          Trouble signing in?
        </Link> */}
      </Stack>

      {/* 2FA Verification Dialog */}
      <Dialog open={show2FADialog} onClose={handleClose2FADialog} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <Stack
            direction="column"
            sx={{
              flex: 1,
              height: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: { md: 5 },
              pb: 5,
            }}
          >
            <Grid
              container
              sx={{
                maxWidth: '35rem',
                rowGap: 4,
                p: { xs: 3, sm: 5 },
              }}
            >
              <Grid size={12}>
                <Typography
                  variant="h4"
                  sx={{
                    mb: 2,
                  }}
                >
                  Enter the OTP
                </Typography>
                <Typography variant="body1">
                  A 6-digit one time password (OTP) has been sent to your authenticator app
                </Typography>
                {twoFactorError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {twoFactorError}
                  </Alert>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 'medium',
                    display: 'block',
                    mt: 1,
                  }}
                >
                  Didn&apos;t receive the code?{' '}
                  <Link
                    variant="caption"
                    component="button"
                    underline={otpSent ? 'none' : 'always'}
                    disabled={otpSent}
                    onClick={() => sentOtp()}
                    sx={{
                      fontWeight: 'medium',
                      ml: 0.5,
                    }}
                  >
                    Send again {otpSent && <>in {dayjs(time * 1000).format('m:ss')} s</>}
                  </Link>
                </Typography>
              </Grid>
              <Grid size={12}>
                <Box component="form" noValidate>
                  <Grid container>
                    <Grid
                      sx={{
                        mb: 2.5,
                      }}
                      size={12}
                    >
                      <Grid
                        container
                        spacing={{ xs: 1, sm: 2 }}
                        sx={{
                          alignItems: 'center',
                        }}
                      >
                        {Array(totalInputLength)
                          .fill('')
                          .map((_, index) => (
                            <Fragment key={index}>
                              <Grid>
                                <StyledTextField
                                  inputRef={(el: HTMLInputElement) => {
                                    inputRefs.current[index] = el;
                                  }}
                                  type="number"
                                  disabledSpinButton
                                  sx={{ width: '42px', textAlign: 'center' }}
                                  slotProps={{
                                    input: {
                                      sx: {
                                        '& .MuiInputBase-input': {
                                          textAlign: 'center',
                                          px: '12px !important',
                                        },
                                      },
                                    },
                                  }}
                                  onClick={() => inputRefs.current[index]?.select()}
                                  onFocus={() => inputRefs.current[index]?.select()}
                                  onKeyUp={(e) => handleKeydown(e, index)}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e, index)}
                                  size="large"
                                  disabled={isVerifying2FA}
                                />
                              </Grid>
                              {index === totalInputLength / 2 - 1 && (
                                <Grid sx={{ lineHeight: '32px', marginX: '4px' }}>-</Grid>
                              )}
                            </Fragment>
                          ))}
                      </Grid>
                    </Grid>
                    <Grid
                      sx={{
                        mb: 4,
                      }}
                      size={12}
                    >
                      <FormControlLabel
                        control={<Checkbox name="rememberDevice" size="small" />}
                        label={
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: 'text.secondary',
                            }}
                          >
                            Remember this device
                          </Typography>
                        }
                      />
                    </Grid>
                    <Grid
                      sx={{
                        mb: 2,
                      }}
                      size={12}
                    >
                      <Button
                        fullWidth
                        color="primary"
                        size="large"
                        variant="contained"
                        disabled={otp.length < totalInputLength || isVerifying2FA}
                        loading={isVerifying2FA}
                        loadingPosition="start"
                        onClick={handleVerify2FA}
                      >
                        Verify
                      </Button>
                    </Grid>
                    <Grid sx={{ textAlign: 'center' }} size={12}>
                      <Button
                        fullWidth
                        variant="text"
                        size="large"
                        onClick={handleClose2FADialog}
                        disabled={isVerifying2FA}
                      >
                        Cancel
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginForm;