import { useEffect, useState } from 'react';
import './App.css';
import Map from "./Map.jsx"
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: "http://localhost:1337/graphql",
  cache: new InMemoryCache()
})

function App() {

  const [hasId, setHasId] = useState(false)
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (id) setHasId(true)
  })

  const handleClick = () => {
    setClicked(true)
  }

  return <ApolloProvider client={client}>
    {(hasId || clicked) ? (
      <Map />
    ) : (
      <div id="home">
        <h1>RMS</h1>
        <button onClick={() => handleClick()}>Créer une nouvelle carte</button>
      </div>
    )}
  </ApolloProvider>
}

export default App;
