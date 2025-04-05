const { GraphQLError } = require('graphql')
const Author = require('./models/author.js')
const Book = require('./models/book.js')
const User = require('./models/user.js')//added user model
const jwt = require('jsonwebtoken')
//add for subscription
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()
const loaders = require('./loaders.js')

const resolvers = {
    Query: {
      //get the logged in user from the context
      me: (root, args, context) => {
        console.log('--me--')
        console.log(context.currentUser)
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
      allAuthors : async () => {
        console.log('Author.find')
        const result = await Author.find({})  
        return result }
    },
    Author : {
      bookCount: async (author, args, context) => {
        return loaders.bookCountLoader.load(author._id)
      },
      // bookCount : async ({id}) => {
      //   console.log('Book count')
      //   const result = await Book.countDocuments({author:id})
      //   return result }
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
        //FOR SUBSCRIPTION
            pubsub.publish('BOOK_ADDED',{bookAdded : book})
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
        const user = new User({ username: args.username, favoriteGenre : args.favoriteGenre })
    
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
    },
    Subscription : {
        bookAdded : {
            subscribe : () => pubsub.asyncIterator('BOOK_ADDED')
        }
    }
  }

  module.exports = resolvers