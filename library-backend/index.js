const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author.js')
const Book = require('./models/book.js')
const User = require('./models/user.js')//added user model
const jwt = require('jsonwebtoken')

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
type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}

  type Author{
    name : String
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
    me: User
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

  createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token    
  }
`

const resolvers = {
  Query: {
    //get the logged in user from the context
    me: (root, args, context) => {
      return context.currentUser
    },    
    bookCount : async () => await Book.collection.countDocuments(),
    authorCount : async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let query = {};
      //if author is passed filter
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author){ 
        query.author = author._id;
      }
      }
      //if genere is passed add to query
      if (args.genre) {
        query.genres = args.genre;
      }
      //get book and populate author fields
      return Book.find(query).populate("author");
    },
    allAuthors : async () => await Author.find({})  
  },
  Author : {
    bookCount : async ({id}) => await Book.countDocuments({author:id})
  },
  Mutation : {
    addBook : async (root,args, context) => {
      console.log('---adding book----')
      const currentUser = context.currentUser
      console.log('---current user', currentUser)
      if (!currentUser) {        
        throw new GraphQLError('not authenticated', {          
          extensions: {            
            code: 'BAD_USER_INPUT',          
          }        
        })      
      }      
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
      try {
        await book.save()
        console.log('saved') 
      } 
      catch (error) {
        console.error(error.message)
        throw new GraphQLError('Saving Book failed', {          
          extensions: {            
            code: 'BAD_USER_INPUT',            
            invalidArgs: args.title,            
            error }
          })
      }
      return book
    },
    editAuthor : async (root,args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {        
        throw new GraphQLError('not authenticated', {          
          extensions: {            
            code: 'BAD_USER_INPUT',          
          }        
        })      
      }      
      console.log('---edit author---')
      //find author
      let author = await Author.findOne({name:args.name})
      if(!author){
        return null
      }
      console.log('author found',author)
      author.born = args.setBornTo
      try {
        await author.save()
        console.log('updated')        
      } 
      catch (error) {
        console.error(error.message)
        throw new GraphQLError('Updating Author failed', {          
          extensions: {            
            code: 'BAD_USER_INPUT',            
            invalidArgs: args.setBornTo,            
            error }
          })
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username })
  
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },   
    login: async (root, args) => {
      console.log('---logging in---')
      const user = await User.findOne({ username: args.username })
      console.log('user found',user)
      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })        
      }     
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      console.log('user for token',userForToken)
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }     
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4001 },
  //for handling auth
  context: async ({ req, res }) => {    
    const auth = req ? req.headers.authorization : null    
    if (auth && auth.startsWith('Bearer ')) {      
      const decodedToken = jwt.verify(        
        auth.substring(7), process.env.JWT_SECRET      
      )      
      const currentUser = await User        
      .findById(decodedToken.id)
     
      return { currentUser }    }  },  
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})