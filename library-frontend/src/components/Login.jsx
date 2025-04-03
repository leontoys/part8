import React, { useState , useEffect} from 'react'
import { useQuery, useMutation  } from "@apollo/client";
import { LOGIN, ME } from "../queries.js";

const Login = (props) => {

    if (!props.show) {
        return null
      }    

    const [name,setName] = useState('')
    const [password,setPassword] = useState('')
    const setToken = props.setToken
    const setPage = props.setPage

    const [ login, result ] = useMutation(LOGIN, {   
        onError: (error) => {
        console.log(error.graphQLErrors[0].message)
      }
    })    

    useEffect(() => {    
        console.log('result changed')
        if ( result.data ) {      
            const token = result.data.login.value      
            setToken(token)      
            localStorage.setItem('token', token) 
            setPage('add')   
        }  }, [result.data])

    const handleLogin = (e)=>{
        console.log('---logging in')
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