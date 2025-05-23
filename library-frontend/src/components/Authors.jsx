import { useMutation, useQuery  } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries.js";
import { useState } from "react";


const Authors = (props) => {

  if (!props.show) {
    return null
  }

  const [name,setName] = useState('')
  const [year,setYear] = useState('')  

  const [changeAuthor] = useMutation(EDIT_AUTHOR,{
   refetchQueries:[{query:ALL_AUTHORS}]
   })  

  const result = useQuery(ALL_AUTHORS)
  if(result.loading){
    return(<div>Loading...</div>)
  }
  
  const authors = result?.data?.allAuthors || []

  const handleSubmit = (e)=>{
    e.preventDefault()
    console.log('name',name)
    console.log('year',year)      
    //update
    changeAuthor({ variables: { name,year } })
    setName(authors[0].name)
    setYear('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={handleSubmit}>
      <label>
        <select name='name'
                value={name}
                onChange={e=>setName(e.target.value)}>
          {authors.map( author => (
            <option key={author.name}
                    value={author.name}>{author.name}</option>
           ))}
        </select>
      </label>
        <div>
          born
          <input name='year' 
            value={year}
            onChange={e=>setYear(Number(e.target.value))}
            />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
