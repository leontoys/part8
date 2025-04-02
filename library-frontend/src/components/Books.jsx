import { useQuery  } from "@apollo/client";
import { ALL_BOOKS } from "../queries.js";
import { useState } from "react";

const Books = (props) => {

  if (!props.show) {
    return null
  }

  const [genre,setGenre] = useState('')

  const result = useQuery(ALL_BOOKS,{
    variables : {genre}
  })
  if(result.loading){
    return(<div>Loading...</div>)
  }
  
  const books = result?.data?.allBooks || []

  console.log(books)
  let genres = []
  books.forEach(book => {
    console.log('book',book)
    book.genres.forEach(genre=>{
      console.log('genere',genre)
      genres = genres.includes(genre) ? genres : genres.concat(genre)
    })
  });
  console.log('genres',genres)

  const filterByGenre = (e)=>{
    console.log(e.target.value)
    setGenre(e.target.value)
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((genre)=><button key={genre} value={genre} onClick={filterByGenre}>{genre}</button>)}
    </div>
  )
}

export default Books
