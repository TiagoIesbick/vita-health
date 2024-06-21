import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './graphql/apolloConfig';
import Header from './components/header';
import Main from './components/main';
import Footer from './components/footer';


function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Header />
      <Main />
      <Footer />
    </ApolloProvider>
  );
}

export default App;
