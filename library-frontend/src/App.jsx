import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import { useApolloClient, useSubscription  } from "@apollo/client";
import Recommend from "./components/Recommend";
import { ALL_BOOKS, BOOK_ADDED } from "./queries";

export const updateCache = (cache, query, addedBook) => {
  console.log("cache",cache)
  console.log("query",query)
  console.log("added book",addedBook)
  // helper that is used to eliminate saving same person twice
  const uniqByTitle = (a) => {
    let seen = new Set()
    return a.filter((book) => {
      let k = book.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(
      query,
    (data) => {
      console.log('data',data)
      if (!data) return;
  
      return {
        allBooks: uniqByTitle(data.allBooks.concat(addedBook)),
      };
    }
  );
  
  
}

const App = () => {
  const [page, setPage] = useState("authors");
  const [token,setToken] = useState(null)
  const client = useApolloClient()

  //subscription
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log('book added subscription',data?.data?.bookAdded?.title)
      //window.alert(`book ${data?.data?.bookAdded?.title} added `)

      updateCache(client.cache, { query: ALL_BOOKS, variables : {genre:''} }, data?.data?.bookAdded)
    }
  })

  const logout = () => {    
    setToken(null)    
    localStorage.clear()    
    client.resetStore()
    setPage('login')  
  }
  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {!token && <button onClick={()=>setPage("login")}>login</button>}
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={logout}>logout</button>}    
        {token && <button onClick={() => setPage("recommend")}>recommend</button>}
      </div>

      <Authors show={page === "authors"}/>

      <Books show={page === "books"}/>

      <Login show={page === "login"} setToken={setToken} setPage={setPage}/>

      <NewBook show={page === "add"} />

      <Recommend show={page === "recommend"}/>

    </div>
  );
};

export default App;
