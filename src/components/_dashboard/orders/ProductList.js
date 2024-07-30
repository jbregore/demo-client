import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
// material
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import { debounce } from 'lodash';
// components
import ProductCard from './ProductCard';
// redux
import { ordersStore } from '../../../redux/orders/store';
import { setProducts, setIsLoadingProducts, setSearchParams } from '../../../redux/orders/action';
import { Endpoints } from '../../../enum/Endpoints';

// ----------------------------------------------------------------------

const Scrollbar = styled(Grid)({
  '::-webkit-scrollbar': {
    width: 5
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent'
  },
  '::-webkit-scrollbar-thumb': {
    background: '#b4bcc3',
    borderRadius: 10
  }
});

// ----------------------------------------------------------------------

export default function ProductList({ ...other }) {
  const [ordersState, setOrdersState] = useState(ordersStore.getState());

  const [hasMore, setHasMore] = useState(true);
  const debouncedHandleSearch = useRef();

  useEffect(() => {
    const updateOrdersState = () => {
      setOrdersState(ordersStore.getState());
    };

    ordersStore.subscribe(updateOrdersState);
  }, []);

  useEffect(() => {
    fetchProducts({ category: ordersState.category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersState.category]);

  if (!debouncedHandleSearch.current)
    debouncedHandleSearch.current = debounce((searchParams) => {
      if (searchParams.length > 0) {
        fetchProducts({
          search: searchParams
        });
      } else {
        fetchProducts({ category: ordersState.category });
      }
    }, 300);

  useEffect(() => {
    debouncedHandleSearch.current(ordersState.searchParams);
  }, [ordersState.searchParams]);


  useEffect(() => {
    fetchProducts({
      category: ordersState.category,
      productCode: ordersState.searchProductsKey
    }, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersState.searchProductsKey]);

  const fetchProducts = async (filter, merge) => {
    if (ordersState.setIsLoadingProducts) return;
    ordersStore.dispatch(setIsLoadingProducts(true));
    if (!filter) ordersStore.dispatch(setSearchParams(''));

    try {

      const parsedFilter = JSON.stringify(filter);
      const res = await axios.get(`${Endpoints.INVENTORY}/products`, {
        params: {
          page: merge ? parseInt(ordersState.products.length / 10) : 1,
          pageSize: 10,
          ...filter && {
            filter: parsedFilter
          }
        }
      });
      const { data, meta } = res.data;
      setHasMore(meta.totalRecords > data.length + ((merge) ? ordersState.products.length : 0));
      if (merge) ordersStore.dispatch(setProducts([...ordersState.products, ...data]));
      else ordersStore.dispatch(setProducts(data));
    } catch (err) {
      console.error(err);

    }
  };


  const handleScroll = async (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (clientHeight + scrollTop >= scrollHeight && hasMore) {
      await fetchProducts(true, {
        category: ordersState.category
      });
    }
  };

  return (
    <>{!ordersState.setIsLoadingProducts &&
      <Scrollbar
        onScroll={handleScroll}
        container
        spacing={2}
        sx={{
          height: 'calc(100vh - 370px)',
          px: 2,
          overflow: 'auto',
          justifyContent: 'start',
          alignContent: 'start'
        }}
        {...other}
      >
        {ordersState.products.map((product, index) => (
          <Grid key={index} item xs={4}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Scrollbar>

    }</>
  );
}
