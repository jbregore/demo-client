import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const createApolloClient = (apiKey = null) => {
  const httpLink = createHttpLink({
    uri: process.env.REACT_APP_UMBRA_SYSTEMS_API_URL
  });

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const umbraSystems = JSON.parse(localStorage.getItem('umbraSystemsConfig'));

    return {
      headers: {
        ...headers,
        'x-api-key': apiKey || umbraSystems.apiKey
      }
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network'
      }
    }
  });

  return client;
};

export { createApolloClient };
