import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ApolloClient, InMemoryCache, gql, ApolloProvider  } from "@apollo/client";

//create client similar to how we created server in the gql backend
const client = new ApolloClient({
  uri: 'http://localhost:4001',
  cache : new InMemoryCache()
})



ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
    </ApolloProvider>
);
