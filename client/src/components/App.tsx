import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BotpressTreeView from './Treeview';

export default function App() { 
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Botpress Project
        </Typography>
        <BotpressTreeView />
      </Box>
    </Container>
  );
}
