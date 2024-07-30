
import axios from 'axios';
import { ordersStore } from '../../../redux/orders/store';
// material
import { alpha, styled } from '@mui/material/styles';
import { Grid, Box, Card, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Endpoints } from '../../../enum/Endpoints';
import { setCategory } from '../../../redux/orders/action';

// ----------------------------------------------------------------------

const CardStyled = styled(Card)(({ theme }) => ({

  borderRadius: 8,
  height: 74,
  color: theme.palette.text.secondary,
  textTransform: 'capitalize',
  cursor: 'pointer',
  border: '1px solid transparent'
}));

const categoryStyle = {
  backgroundColor: (theme) => alpha(theme.palette.primary.darker, 0.08),
  color: 'primary.dark',
  borderColor: (theme) => theme.palette.primary.dark
};
const activeCategoryStyle = {
  backgroundColor: (theme) => alpha(theme.palette.primary.main, 1),
  color: 'primary.contrastText',
  borderColor: (theme) => theme.palette.primary.lighter
};

// ----------------------------------------------------------------------

// CategoriesList.propTypes = {
//   currentCategory: PropTypes.string.isRequired,
//   setCategory: PropTypes.func.isRequired
// };

export default function CategoriesList({ ...other }) {
  const [ordersState, setOrdersState] = useState(ordersStore.getState());
  const [cats, setCategories] = useState([{ _id: -1, name: "All" }]);

  useEffect(() => {
    // eslint-disable-next-line
    if (cats.length == 1)
      fetchCategories();
    const updateOrdersState = () => {
      setOrdersState(ordersStore.getState());
    };

    ordersStore.subscribe(updateOrdersState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCategories() {
    try {
      const { data } = await axios.get(`${Endpoints.INVENTORY}/all-categories`);
      setCategories([...cats, ...data.data]);
    } catch (err) {
      console.error(err);
    }
  };



  function handleOnClickCatergory(category) {
    ordersStore.dispatch(setCategory(category));
  }


  return (
    <Box mb={5} {...other} sx={{
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      paddingBottom: 1,
      '&::-webkit-scrollbar': {
        height: '5px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#b4bcc3',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#555',
      },
    }}>
      <Grid container spacing={2} wrap="nowrap" sx={{ display: 'flex' }}>
        {cats.map(({ _id, name }) => {
          return (
            <Grid item key={_id} onClick={() => handleOnClickCatergory(_id)} sx={{ flex: '0 0 auto', width: '200px' }}>
              <CardStyled sx={(ordersState.category === _id) ? activeCategoryStyle : categoryStyle}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ lineHeight: '74px', fontSize: '12px' }}>
                    {name}
                  </Typography>
                </Box>
              </CardStyled>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
