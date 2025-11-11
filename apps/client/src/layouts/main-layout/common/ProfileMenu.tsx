'use client';

import { PropsWithChildren, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Divider,
  Link,
  listClasses,
  ListItemIcon,
  listItemIconClasses,
  MenuItem,
  MenuItemProps,
  paperClasses,
  Stack,
  Switch,
  SxProps,
  Typography,
} from '@mui/material';
import { authPaths } from 'routes/paths';
import { authClient } from '@/auth';
import Menu from '@mui/material/Menu';
import { useThemeMode } from 'hooks/useThemeMode';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusAvatar from 'components/base/StatusAvatar';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';

interface ProfileMenuProps {
  type?: 'default' | 'slim';
}

interface ProfileMenuItemProps extends MenuItemProps {
  icon: string;
  href?: string;
  sx?: SxProps;
}

const ProfileMenu = ({ type = 'default' }: ProfileMenuProps) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { up } = useBreakpoints();
  const upSm = up('sm');
  const {
    config: { textDirection },
  } = useSettingsContext();

  const { isDark, setThemeMode } = useThemeMode();

  const STATIC_USER = useMemo(
    () => ({ name: 'John Doe', image: '', designation: 'Member' }),
    []
  );

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuButton = (
    <Button
      color="neutral"
      variant="text"
      shape="circle"
      onClick={handleClick}
      sx={[
        {
          height: 44,
          width: 44,
        },
        type === 'slim' && {
          height: 30,
          width: 30,
          minWidth: 30,
        },
      ]}
    >
      <StatusAvatar
        alt={STATIC_USER.name}
        status="online"
        src={STATIC_USER.image || undefined}
        sx={[
          {
            width: 40,
            height: 40,
            border: 2,
            borderColor: 'background.paper',
          },
          type === 'slim' && { width: 24, height: 24, border: 1, borderColor: 'background.paper' },
        ]}
      />
    </Button>
  );

  const handleSignout = async () => {
    await authClient.signOut();
    router.push(authPaths.login);
  }

  return (
    <>
      {type === 'slim' && upSm ? (
        <Button color="neutral" variant="text" size="small" onClick={handleClick}>
          {STATIC_USER.name}
        </Button>
      ) : (
        menuButton
      )}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'bottom',
        }}
        sx={{
          [`& .${paperClasses.root}`]: { minWidth: 320 },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <StatusAvatar
            status="online"
            alt={STATIC_USER.name}
            src={STATIC_USER.image || undefined}
            sx={{ width: 48, height: 48 }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {STATIC_USER.name}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'warning.main',
              }}
            >
              {STATIC_USER.designation}
              <IconifyIcon
                icon="material-symbols:diamond-rounded"
                color="warning.main"
                sx={{ verticalAlign: 'text-bottom', ml: 0.5 }}
              />
            </Typography>
          </Box>
        </Stack>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem icon="material-symbols:accessible-forward-rounded" onClick={handleClose}>
            Accessibility
          </ProfileMenuItem>

          <ProfileMenuItem icon="material-symbols:settings-outline-rounded" onClick={handleClose}>
            Preferences
          </ProfileMenuItem>

          <ProfileMenuItem
            onClick={() => setThemeMode()}
            icon="material-symbols:dark-mode-outline-rounded"
          >
            Dark mode
            <Switch checked={isDark} onChange={() => setThemeMode()} sx={{ ml: 'auto' }} />
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            icon="material-symbols:manage-accounts-outline-rounded"
            onClick={handleClose}
            href="#!"
          >
            Account Settings
          </ProfileMenuItem>
          <ProfileMenuItem
            icon="material-symbols:question-mark-rounded"
            onClick={handleClose}
            href="#!"
          >
            Help Center
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            onClick={handleSignout}
            icon="material-symbols:logout-rounded"
          >
            Sign Out
          </ProfileMenuItem>
        </Box>
      </Menu>
    </>
  );
};

const ProfileMenuItem = ({
  icon,
  onClick,
  children,
  href,
  sx,
}: PropsWithChildren<ProfileMenuItemProps>) => {
  const linkProps = href ? { component: Link, href, underline: 'none' } : {};
  return (
    <MenuItem onClick={onClick} {...linkProps} sx={{ gap: 1, ...sx }}>
      <ListItemIcon
        sx={{
          [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' },
        }}
      >
        <IconifyIcon icon={icon} sx={{ color: 'text.secondary' }} />
      </ListItemIcon>
      {children}
    </MenuItem>
  );
};

export default ProfileMenu;
