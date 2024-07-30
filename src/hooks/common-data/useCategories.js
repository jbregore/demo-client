import  { useEffect, useState } from 'react';
import axios from 'axios';
import { dashboardStore } from '../../redux/admin/dashboard/store';

const useCategories = () => {
  const [refreshProducts, setRefreshProducts] = useState(dashboardStore.getState().refreshProducts);

  const [categoryOptions, setCategoryOptions] = useState([]);

  const fetchCategories = async () => {
    try {
      const allCategories = await axios.get(
        `${process.env.REACT_APP_API_URL}/inventory/all-categories`
      );

      // eslint-disable-next-line 
      if (allCategories.status == 200) {
        const options = allCategories?.data?.data?.map((item) => ({
          value: item._id,
          label: item.name
        }));

        setCategoryOptions(options);
      }
    } catch (err) {
      console.log('err ', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const unsubscribe = dashboardStore.subscribe(() => {
      const newRefreshProducts = dashboardStore.getState().refreshProducts;
      if (newRefreshProducts !== refreshProducts) {
        setRefreshProducts(newRefreshProducts);
        fetchCategories();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refreshProducts]);


  return { categoryOptions };
};

export default useCategories;
