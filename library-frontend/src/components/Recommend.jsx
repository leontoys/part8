import React from 'react';
import { useQuery } from "@apollo/client";
import { ME, ALL_BOOKS } from "../queries.js";

const Recommend = (props) => {
  if (!props.show) {
    return null;
  }

  const { data: meData, loading: meLoading, error: meError } = useQuery(ME, {
    fetchPolicy: "network-only",//always query
  });

  const me = meData?.me || null;
  const genre = me?.favoriteGenre || '' 

  const { data: booksData, loading: booksLoading, error: booksError } = useQuery(ALL_BOOKS, {
    variables: { genre },
    fetchPolicy: "network-only", //always
  });  

//moved all handling to down and queries to up so that the number of queries don't change between renders
  if (meLoading) {
    return <div>Loading...</div>;
  }

  if (meError) {
    console.error("Error fetching user data: ", meError);
    return <div>Error loading user data</div>;
  }
  
  if (!genre) {
    return <div>Your favorite genre is not set.</div>;
  }

  if (booksLoading) {
    return <div>Loading books...</div>;
  }

  if (booksError) {
    console.error("Error fetching books: ", booksError);
    return <div>Error loading books</div>;
  }

  const books = booksData?.allBooks || [];

  return (
    <div>
      <h2>Recommendations</h2>
      <p>Books in your favorite genre is: {genre}</p>
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
    </div>
  );
};

export default Recommend;
