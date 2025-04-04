import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import { useApolloClient, useSubscription  } from "@apollo/client";
import Recommend from "./components/Recommend";
import { BOOK_ADDED } from "./queries";



const App = () => {
  const [page, setPage] = useState("authors");
  const [token,setToken] = useState(null)
  const client = useApolloClient()

  //subscription
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log('book added subscription',data)
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
