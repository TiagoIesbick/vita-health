import { ApolloProvider } from '@apollo/client';
import { UserProvider } from './providers/userContext';
import { FileProvider } from './providers/fileContext';
import { LanguageProvider } from './providers/languageContext';
import { apolloClient } from './graphql/apolloConfig';
import { useBackgroundImageResize } from './hooks/hooks';
import Header from './components/header';
import Main from './components/main';
import Footer from './components/footer';
import FileDialog from './components/fileDialog';


function App() {
  useBackgroundImageResize();

  return (
    <ApolloProvider client={apolloClient}>
      <LanguageProvider>
        <UserProvider>
          <FileProvider>
            <Header />
            <Main />
            <Footer />
            <FileDialog />
          </FileProvider>
        </UserProvider>
      </LanguageProvider>
    </ApolloProvider>
  );
}

export default App;
