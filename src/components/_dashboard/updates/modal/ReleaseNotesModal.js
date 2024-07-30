import PropTypes from 'prop-types';
import moment from 'moment';
import Markdown from 'react-markdown';
// material
import { styled } from '@mui/material/styles';
import { Card, Modal, Typography, Box, Divider, Button, Stack } from '@mui/material';
// components
import Scrollbar from '../../../Scrollbar';

// ----------------------------------------------------------------------

const StyledModal = styled(Modal)({
  position: 'fixed',
  zIndex: 1300,
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const Backdrop = styled('div')({
  zIndex: '-1px',
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
});

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1),
  width: 400
}));

const mdContainerStyle = {
  'h1,h2,h3,h4,h5,h6': { my: 2, fontSize: '1rem' },
  ul: { listStylePosition: 'inside' },
  li: { my: 1, ml: 4 }
};

// ----------------------------------------------------------------------

ReleaseNotes.propTypes = {
  release: PropTypes.object,
  setSelectedRelease: PropTypes.func,
};

// ----------------------------------------------------------------------

export default function ReleaseNotes({ release, setSelectedRelease }) {
  const handleCloseModal = () => {
    setSelectedRelease(null);
  };

  const notes =
    release && release.body.split('**Full Changelog**')[0].split('## New Contributors')[0];

  return (
    <StyledModal open={!!release} BackdropComponent={Backdrop}>
      <ModalCard sx={{ width: 700 }}>
        <Scrollbar sx={{ maxHeight: '80vh', px: 2 }}>
          <Box component="section" p={2} pb={1}>
            <Typography variant="h6" pb={2} mt={2}>
              Release Notes: {release && release.name} (
              {moment(release && release.published_at).format('MM-DD-YYYY')})
            </Typography>
            <Box sx={mdContainerStyle}>
              <Markdown>{notes}</Markdown>
            </Box>
          </Box>
        </Scrollbar>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="end" spacing={1}>
          <Button size="medium" variant="contained" onClick={handleCloseModal}>
            Close
          </Button>
        </Stack>
      </ModalCard>
    </StyledModal>
  );
}
