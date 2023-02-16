import * as React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import {Copyright} from '../src/components/signin/SignIn'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));


export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

export default function Popup(props: any) {
  const {title, openPopup, setOpenPopup} = props;

  const handleClose = () => {
    setOpenPopup(false);
  };

  return (
    <div>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={openPopup}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          About the FML Project!
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Valami velős ahol, valaki aki ismeri értelmesen a projektet leírja, hogy miről szól. Meg lehet pár linket berakni.
          </Typography>
        </DialogContent>
        <DialogActions sx={{display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
            }}
        >
            <Copyright sx={{alignItems: "center"}}></Copyright>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
}