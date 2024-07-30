import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useRef, useState } from 'react';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import { Icon } from '@iconify/react';

const MenuAction = (props) => {
    const { choices, record } = props
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const handleChange = (actions) => {
    const checker = (arr) => arr.every((v) => v === false);
    if (!checker(actions)) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => handleChange(choices)}>
        <Icon icon={moreVerticalFill} />
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
        {choices.map((action, index) => {
          if (action)
            return (
              <MenuItem id={record._id} key={index} sx={{ color: 'text.secondary' }}>
                <ListItemIcon>
                  <Icon icon={action.icon} width={24} height={24} />
                </ListItemIcon>
                <ListItemText
                  primary={action.name}
                  primaryTypographyProps={{ variant: 'body2' }}
                  sx={{ textTransform: 'capitalize' }}
                  onClick={(evt) => {
                    action.function(record);
                    setIsOpen(false);
                  }}
                />
              </MenuItem>
            );

          return null;
        })}
      </Menu>
    </>
  );
};

export default MenuAction;
