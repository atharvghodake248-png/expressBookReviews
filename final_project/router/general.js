
const express = require('express');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
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

// Get book by ISBN (the starter dataset uses keys 1–10)
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.status(200).json(book);
});

// Get books by author (case-insensitive partial match)
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const matches = Object.values(books).filter(book =>
    book.author.toLowerCase().includes(author)
  );

  return res.status(200).json(matches);
});

// Get books by title (case-insensitive partial match)
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const matches = Object.values(books).filter(book =>
    book.title.toLowerCase().includes(title)
  );

  return res.status(200).json(matches);
});

// Get reviews for a particular book
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
