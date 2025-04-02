import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import { useApolloClient  } from "@apollo/client";



const App = () => {
  const [page, setPage] = useState("authors");
  const [token,setToken] = useState(null)
  const client = useApolloClient()

  const logout = () => {    
    setToken(null)    
    localStorage.clear()    
    client.resetStore()
    setPage('login')  
  }
  console.log("token",token)
  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {!token && <button onClick={()=>setPage("login")}>login</button>}
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={logout}>logout</button>}    
      </div>

      <Authors show={page === "authors"}/>

      <Books show={page === "books"}/>

      <Login show={page === "login"} setToken={setToken} setPage={setPage}/>

      <NewBook show={page === "add"} />

    </div>
  );
};

export default App;
