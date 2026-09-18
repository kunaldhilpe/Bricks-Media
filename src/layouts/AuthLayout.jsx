import { Outlet } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useColorMode } from '@/context/ColorModeContext';

export default function AuthLayout() {
  const { mode, toggleMode } = useColorMode();

  return (
    <Box sx={{ minHeight: '100dvh', position: 'relative' }}>
      <Tooltip title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
        <IconButton
          onClick={toggleMode}
          aria-label="Toggle colour mode"
          sx={{ position: 'absolute', top: 18, right: 20, zIndex: 2 }}
        >
          {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>
      </Tooltip>
      <Outlet />
    </Box>
  );
}
