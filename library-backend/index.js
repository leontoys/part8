const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author.js')
const Book = require('./models/book.js')
const author = require('./models/author.js')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
  type Author{
    name : String!
    born : Int
    bookCount : String
  }

  type Book{
    title : String!
    author : Author!
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
    bookCount : async () => await Book.collection.countDocuments(),
    authorCount : async () => await Author.collection.countDocuments(),
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
    allAuthors : async () => await Author.find({})     
  },
  Author : {
    bookCount : async ({id}) => await Book.countDocuments({author:id})
  },
  Mutation : {
    addBook : async (root,args) => {
      console.log('---adding Book----')
      //if author is not added create Author
      let author = await Author.findOne({name:args.author})
      console.log("existing author",author)
      if(!author){
        console.log("creating new author")
        //create author
        author = new Author({name:args.author})
        console.log("new author",author)
        await author.save()
        console.log("saved")
      }
      //create new book with arguments and generated id
      const book = new Book({...args,author:author})
      console.log('new book',book)
      //add book
      await book.save()
      console.log('saved')
      return book
    },
    editAuthor : async (root,args) => {
      console.log('---edit author---')
      //find author
      let author = await Author.findOne({name:args.name})
      if(!author){
        return null
      }
      console.log('author found',author)
      author.born = args.setBornTo
      await author.save()
      console.log('updated')
      return author
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