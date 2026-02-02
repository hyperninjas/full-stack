import { Icon, IconProps } from "@iconify/react";
import { Box, BoxProps } from "@mui/material";

interface IconifyProps extends IconProps {
  sx?: BoxProps["sx"];
  flipOnRTL?: boolean;
  icon: string;
}

const IconifyIcon = ({
  icon,
  flipOnRTL = false,
  sx,
  ...rest
}: IconifyProps) => {
  return (
    <Box
      component={icon ? Icon : "span"}
      {...(icon ? { icon, ssr: true } : ({} as any))}
      className='iconify'
      sx={[
        flipOnRTL && {
          transform: (theme) =>
            theme.direction === "rtl" ? "scaleX(-1)" : "none",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    />
  );
};

export default IconifyIcon;
