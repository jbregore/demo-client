import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Box, Drawer } from '@mui/material';
// components
import Logo from '../../components/Logo';
import Scrollbar from '../../components/Scrollbar';
import NavSection from '../../components/NavSection';
//
import sidebarConfig from './SidebarConfig';
import { Icon } from '@iconify/react';
import globeOutline from '@iconify/icons-eva/globe-outline';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 120;

const RootStyle = styled('div')(() => ({
  flexShrink: 0,
  width: DRAWER_WIDTH
}));

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func
};

const getIcon = (name) => <Icon icon={name} width={28} height={28} />;

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar }) {
  const { pathname } = useLocation();
  const uid = localStorage.getItem('uid')

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navConfig = [
    ...sidebarConfig,
    ...(uid === process.env.REACT_APP_USER_SECRET ? [{
      title: 'Organizations',
      path: '/app/organization',
      icon: getIcon(globeOutline),
      notAllowed: ['cashier', 'supervisor', 'manager'],
      key: ''
    }] : [])
  ];

  const renderContent = (
    <Scrollbar
      sx={{
        height: 'calc(100% - 115px)',
        '& .simplebar-content': {
          height: 'calc(100% - 30px)',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}
        >
          <Logo />
        </Box>
      </Box>

      <NavSection navConfig={navConfig} />
    </Scrollbar>
  );

  return (
    <RootStyle>
      <Drawer
        open
        variant="persistent"
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            border: 0
          }
        }}
      >
        {renderContent}
      </Drawer>
    </RootStyle>
  );
}
