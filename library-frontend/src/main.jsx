import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ApolloClient, InMemoryCache, gql, ApolloProvider, createHttpLink,
  split
  } from "@apollo/client";
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

const authLink = setContext((_, { headers }) => {  
  const token = localStorage.getItem('token')  
  return {    
    headers: {      
      ...headers,      
      authorization: token ? `Bearer ${token}` : null,    
    }  }})


    const wsLink = new GraphQLWsLink(createClient({
      url: 'ws://localhost:4001',
    }))
    

    const httpLink = createHttpLink({
      uri: 'http://localhost:4001',
    }) 
    
    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query)
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        )
      },
      wsLink,
      authLink.concat(httpLink)
    )    

//create client similar to how we created server in the gql backend
const client = new ApolloClient({
  // uri: 'http://localhost:4001',
  //link: authLink.concat(httpLink),  
  link : splitLink,
  cache : new InMemoryCache()
})



ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
    </ApolloProvider>
);
