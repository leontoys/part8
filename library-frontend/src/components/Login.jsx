import React, { useState , useEffect} from 'react'
import { useQuery, useMutation  } from "@apollo/client";
import { LOGIN } from "../queries.js";

const Login = ({setToken}) => {

    const [name,setName] = useState('')
    const [password,setPassword] = useState('')

    const [ login, result ] = useMutation(LOGIN, {    onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      }
    })    

    useEffect(() => {    
        if ( result.data ) {      
            const token = result.data.login.value      
            setToken(token)      
            localStorage.setItem('phonenumbers-user-token', token)    
        }  }, [result.data])

    const handleLogin = (e)=>{
        e.preventDefault()
        login({ variables: { name, password } })
        setName('')
        setPassword('')
    }

  return (
    <div>
        <div>
            <label>name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)}></input>
        </div>
        <div>
            <label>password</label>
            <input type='password' value={password} onChange={(e)=>setPassword(e.target.value)}></input>
        </div>
        <div>
            <button type='submit' onClick={handleLogin}>login</button>
        </div>
    </div>
  )
}

export default Login