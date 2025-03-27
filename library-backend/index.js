const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
  type Author{
    name : String!
    born : Int
    bookCount : String
  }

  type Book{
    title : String!
    author : String
    published : Int
    genres : [String]
  }

  type Query {
    bookCount : Int!
    authorCount : Int!
    allBooks(author:String,genre:String) : [Book!]
    allAuthors : [Author!]
  }

  type Mutation {
    addBook(
      title : String!
      author : String!
      published : Int!
      genres : [String!]
    ):Book

    editAuthor(
      name : String!
      setBornTo : Int!
    ):Author
  }
`

const resolvers = {
  Query: {
    bookCount : () => books.length,
    authorCount : () => authors.length,
    allBooks : (root,args) => {
      //if no arguments passed - ie no filter on author
      //then pass all
      if(!args.author &&!args.genre){
        return books
      }
      //filter the books by the author
      let filteredBooks = args.author ? 
      books.filter(book => book.author === args.author) : 
      books
      // //filter the books by the genre
      filteredBooks = args.genre ? 
      filteredBooks.filter(book => book.genres.includes(args.genre)):
      filteredBooks
      return filteredBooks
    },
    allAuthors : () => authors      
  },
  Author : {
    bookCount : ({name}) => books.filter(book => book.author === name).length  
  },
  Mutation : {
    addBook : (root,args) => {
      //if author is not added create Author
      const author = authors.find(author => author.name === args.author)
      console.log("author",author)
      if(!author){
        console.log("createing author")
        //create author
        const author = { name:args.author, id:uuid()}
        console.log("new author",author)
        authors = authors.concat(author)
        console.log("authors",authors)
      }

      //create new book with arguments and generated id
      const book = {...args,id:uuid()}
      //add book
      books = books.concat(book)
      return book
    },
    editAuthor : (root,args) => {
      console.log('---edit author---')
      //find author
      const author = authors.find(author => author.name === args.name)
      if(!author){
        return null
      }
      console.log('author',author)
      const updatedAuthor = {...author,born:args.setBornTo}
      console.log('updated author',updatedAuthor)
      authors = authors.map( author => author.name === args.name ? updatedAuthor : author)
      console.log('authors',authors)
      return updatedAuthor
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4001 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})