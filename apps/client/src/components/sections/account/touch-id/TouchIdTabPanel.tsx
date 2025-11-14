import { Divider, Stack } from '@mui/material';
import AccountTabPanelSection from '../common/AccountTabPanelSection';
import Biometrics from './Biometrics';
import TwoFactorFeatures from './TwoFactorFeatures';

const TouchIDTabPanel = () => {
  return (
    <Stack direction="column" divider={<Divider />} spacing={5}>
      <AccountTabPanelSection
        title="Passkey"
        subtitle="Passkey enables for quick login with secure biometric authentication methods like Touch ID."
        icon="material-symbols:lock-person-outline"
      >
        <Biometrics />
      </AccountTabPanelSection>
      <AccountTabPanelSection
        title="Two Factor Authentication"
        subtitle="Enable two-factor authentication to add an extra layer of security to your account."
        icon="material-symbols:lock-clock-outline"
      >
        <TwoFactorFeatures />
      </AccountTabPanelSection>
    </Stack>
  );
};

export default TouchIDTabPanel;
