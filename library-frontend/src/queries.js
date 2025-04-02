import { gql  } from "@apollo/client";

export const ALL_AUTHORS = gql `
query {
  allAuthors {
    name
    born
    bookCount
  }
}
`

export const ALL_BOOKS = gql `
query {
  allBooks { 
    title 
    published
    author {
      name
    }     
  }
}
`

export const CREATE_BOOK = gql`
mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    author
  }
}
`

export const EDIT_AUTHOR = gql`
mutation editAuthor($name: String!, $year: Int!) {
    editAuthor(
      name : $name
      setBornTo : $year
    ){
    name
    born
  }
}
`

export const LOGIN = gql`
mutation login($name:String!,$password:String!)
  {
  login (
    username: $name
    password: $password
  ) {
    value
  }
}
`