import React, { useState } from 'react';
import { Chip } from '@mui/material';
import SpecificationsDialog from './SpecificationsDialog';

const Badge = (props) => {
  const [open, setOpen] = useState(false);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    props.label ?
      <>
        <Chip
          label={props.label}
          onClick={handleClickOpen}
          sx={{ backgroundColor: props.color, color: 'white', fontFamily: 'Montserrat', zIndex: 10 }}
        />
        <SpecificationsDialog
          open={open}
          onClose={handleClose}
          componentDetails={props.componentDetails}
          color={props.color}
          label={props.label}
          isAdmin={isAdmin}
          onSave={props.onSave}
        />
      </>
      : <></>
  );
};

export default Badge;