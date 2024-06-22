import { ApolloProvider } from '@apollo/client';
import { UserProvider } from './providers/userContext';
import { apolloClient } from './graphql/apolloConfig';
import Header from './components/header';
import Main from './components/main';
import Footer from './components/footer';


function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <UserProvider>
        <Header />
        <Main />
        <Footer />
      </UserProvider>
    </ApolloProvider>
  );
}

export default App;
