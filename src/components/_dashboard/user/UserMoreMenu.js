import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
// icon
import { Icon } from '@iconify/react';
import timeLogsOutline from '@iconify/icons-ant-design/clock-circle-outlined';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import uploadOutline from '@iconify/icons-eva/upload-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import closeCirlceOutline from '@iconify/icons-eva/close-circle-fill';
import TransferFill from '@iconify/icons-ant-design/swap-outlined';
import viewFill from '@iconify/icons-ant-design/eye-outline';
import printFill from '@iconify/icons-ant-design/printer-outline';
import restoreFill from '@iconify/icons-ic/outline-restore';
import receiptFill from '@iconify/icons-ion/receipt-outline';
import refundFill from '@iconify/icons-ic/outline-restore-page';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';

// ----------------------------------------------------------------------

UserMoreMenu.propTypes = {
  actions: PropTypes.array
};

const getIcon = (name) => {
  const txt = {
    delete: trash2Outline,
    return: uploadOutline,
    void: closeCirlceOutline,
    cancel: closeCirlceOutline,
    edit: editFill,
    logs: timeLogsOutline,
    transfer: TransferFill,
    view: viewFill,
    print: printFill,
    restore: restoreFill,
    receipt: receiptFill,
    refund: refundFill
  }[name];

  return txt;
};

export default function UserMoreMenu({ actions }) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (actions) => {
    const checker = (arr) => arr.every((v) => v === false);
    if (!checker(actions)) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => handleChange(actions)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {actions.map((action, index) => {
          if (action)
            return (
              <MenuItem id={action.key && action.key} key={index} sx={{ color: 'text.secondary' }}>
                <ListItemIcon>
                  <Icon icon={getIcon(action.id)} width={24} height={24} />
                </ListItemIcon>
                <ListItemText
                  primary={action.label}
                  primaryTypographyProps={{ variant: 'body2' }}
                  sx={{ textTransform: 'capitalize' }}
                  onClick={(evt) => {
                    action.onClick(evt);
                    setIsOpen(false);
                  }}
                />
              </MenuItem>
            );

          return null;
        })}
        {/* <MenuItem sx={{ color: 'text.secondary' }}>
          <ListItemIcon>
            <Icon icon={trash2Outline} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem component={RouterLink} to="#" sx={{ color: 'text.secondary' }}>
          <ListItemIcon>
            <Icon icon={editFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem> */}
      </Menu>
    </>
  );
}
