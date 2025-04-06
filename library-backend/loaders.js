const DataLoader = require('dataloader')
const Book = require('./models/book')

// keys - array of author IDs
const bookCountLoader = new DataLoader(async (authorIds) => {
    console.log('authorids',authorIds)
  const books = await Book.find({ author: { $in: authorIds } })
  console.log('books',books)

  return authorIds.map(id => books.filter(book => book.author.toString() === id.toString()).length)
})

module.exports = {
  bookCountLoader,
}
