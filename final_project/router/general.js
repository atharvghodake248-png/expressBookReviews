
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'Username already exists.'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered. Now you can log in.'
  });
});

// Get all books
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get book by numeric key (starter project calls this ISBN)
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.status(200).json(book);
});

// Search books by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const matches = Object.values(books).filter((book) =>
    book.author.toLowerCase().includes(author)
  );

  return res.status(200).json(matches);
});

// Search books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const matches = Object.values(books).filter((book) =>
    book.title.toLowerCase().includes(title)
  );

  return res.status(200).json(matches);
});

// Get reviews for a book
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.status(200).json(book.reviews);
});


// Search an external book catalogue using Axios
public_users.get('/external-books/:query', async (req, res) => {
  try {
    const response = await axios.get(
      'https://openlibrary.org/search.json',
      {
        params: {
          q: req.params.query,
          limit: 10
        },
        timeout: 10000
      }
    );

    const results = (response.data.docs || []).map((book) => ({
      title: book.title,
      author: book.author_name || [],
      first_publish_year: book.first_publish_year || null,
      isbn: book.isbn ? book.isbn[0] : null,
      key: book.key
    }));

    return res.status(200).json(results);
  } catch (error) {
    const status = error.response ? error.response.status : 502;

    return res.status(502).json({
      message: 'Unable to fetch books from Open Library.',
      upstreamStatus: status,
      error: error.code || error.message
    });
  }
});
module.exports.general = public_users;

