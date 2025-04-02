import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ApolloClient, InMemoryCache, gql, ApolloProvider, createHttpLink  } from "@apollo/client";
import { setContext } from '@apollo/client/link/context'

const authLink = setContext((_, { headers }) => {  
  const token = localStorage.getItem('token')  
  return {    
    headers: {      
      ...headers,      
      authorization: token ? `Bearer ${token}` : null,    
    }  }})

    const httpLink = createHttpLink({
      uri: 'http://localhost:4001',
    })    

//create client similar to how we created server in the gql backend
const client = new ApolloClient({
  // uri: 'http://localhost:4001',
  link: authLink.concat(httpLink),  
  cache : new InMemoryCache()
})



ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
    </ApolloProvider>
);
