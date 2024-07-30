import { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink as RouterLink, matchPath, useLocation, useNavigate } from 'react-router-dom';
// iconify
import { Icon } from '@iconify/react';
import logoutOutline from '@iconify/icons-mdi/exit-to-app';
// material
import { styled } from '@mui/material/styles';
import { Box, List, ListItemText, ListItemIcon, ListItemButton, Typography } from '@mui/material';
// context
import { AuthContext } from '../shared/context/AuthContext';
// components
import { XReadChecker } from './_dashboard/reports';

// ----------------------------------------------------------------------

const ListItemStyle = styled((props) => <ListItemButton disableGutters {...props} />)(
  ({ theme }) => ({
    ...theme.typography.body2,
    position: 'relative',
    textTransform: 'capitalize',
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    color: theme.palette.text.secondary,
    display: 'block',
    textAlign: 'center',
    fontSize: 11,
    borderRadius: '8px'
  })
);

const ListItemIconStyle = styled(ListItemIcon)({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 5,
  '& > svg': {
    width: 28,
    height: 28
  }
});

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
  active: PropTypes.func
};

function NavItem({ item, active }) {
  const isZRead = localStorage.getItem('isZRead');
  const isActiveRoot = active(item.path);
  const { title, path, icon, info, key } = item;

  const activeRootStyle = {
    color: 'primary.contrastText',
    bgcolor: 'primary.main',
    '&:hover': {
      bgcolor: 'primary.main'
    }
  };

  return (
    <ListItemStyle
      component={RouterLink}
      to={path}
      disabled={isZRead && (title === 'orders' || title === 'transactions')}
      sx={{
        ...(isActiveRoot && activeRootStyle)
      }}
    >
      <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
      <ListItemText disableTypography primary={title} />
      {info && info}
      <Typography sx={{ fontSize: 8, position: 'absolute', top: 5, right: 5 }}>{key}</Typography>
    </ListItemStyle>
  );
}

NavSection.propTypes = {
  navConfig: PropTypes.array
};

export default function NavSection({ navConfig, ...other }) {
  const { pathname } = useLocation();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const match = (path) => (path ? !!matchPath({ path, end: false }, pathname) : false);
  const { user } = JSON.parse(localStorage.getItem('userData'));
  const isXRead = localStorage.getItem('isXRead');

  const [openXReadChecker, setOpenXReadChecker] = useState(false);

  useEffect(() => {
    document.addEventListener('keydown', detectKeyDown, true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectKeyDown = (e) => {
    const navigateOnKey = (roles, route) => {
      if (!roles.includes(auth.user.role.toLowerCase())) {
        navigate(`/app/${route}`);
      }

      return true;
    };

    if (e.altKey && e.key === '1') {
      navigateOnKey([], 'order');
    } else if (e.altKey && e.key === '2') {
      navigateOnKey([], 'transactions');
    } else if (e.altKey && e.key === '3') {
      navigateOnKey([], 'reports');
    } else if (e.altKey && e.key === '4') {
      navigateOnKey(['cashier', 'supervisor'], 'employees');
    } else if (e.altKey && e.key === '5') {
      navigateOnKey(['cashier', 'supervisor'], 'promo-codes');
    } else if (e.altKey && e.key === '6') {
      navigateOnKey(['cashier'], 'dashboard');
    } else if (e.altKey && e.key === '7') {
      navigateOnKey(['cashier'], 'activity');
    } else if (e.altKey && e.key === '8') {
      navigateOnKey(['cashier'], 'receipt');
    } else if (e.altKey && e.key === '0') {
      navigateOnKey(['cashier', 'supervisor'], 'updates');
    }
  };

  const handleLogout = () => {
    if (user.role === 'cashier') {
      if (!isXRead) {
        setOpenXReadChecker(true);
      } else {
        auth.logout();
      }
    } else {
      auth.logout();
    }
  };

  return (
    <Box {...other}>
      <List disablePadding sx={{ padding: '5px 15px 75px 15px' }}>
        {navConfig.map(
          (item) =>
            !item.notAllowed.includes(auth.user.role.toLowerCase()) && (
              <NavItem key={item.title} item={item} active={match} />
            )
        )}
      </List>
      <ListItemStyle
        sx={{
          color: 'error.main',
          position: 'fixed',
          bottom: 30,
          left: 0,
          width: 120,
          backgroundColor: 'common.white',
          '&:hover': {
            bgcolor: '#dedede'
          }
        }}
      >
        <ListItemIconStyle onClick={handleLogout}>
          <Icon icon={logoutOutline} width={28} height={28} />
        </ListItemIconStyle>
        <ListItemText disableTypography primary="logout" />
      </ListItemStyle>
      <XReadChecker open={openXReadChecker} setOpen={setOpenXReadChecker} />
    </Box>
  );
}
