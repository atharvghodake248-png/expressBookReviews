
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const SECRET = 'fingerprint_customer';

// Check whether a username is already registered
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Verify username and password
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// Login: registered users only
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password.'
    });
  }

  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });

  return res.status(200).json({
    message: 'Login successful.',
    token
  });
});

// Add or update a review (authentication required)

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  const username = req.user.username;

  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({
      message: 'You have not added a review for this book.'
    });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully.',
    reviews: book.reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
