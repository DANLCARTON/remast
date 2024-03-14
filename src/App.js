import './App.css';
import Map from "./Map.jsx"
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: "http://localhost:1337/graphql",
  cache: new InMemoryCache()
})

function App() {
  return <ApolloProvider client={client}>
    <Map />
  </ApolloProvider>
}

export default App;
