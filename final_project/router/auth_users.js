
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const SECRET = 'fingerprint_customer';

const isValid = (username) =>
  users.some((user) => user.username === username);

const authenticatedUser = (username, password) =>
  users.some(
    (user) => user.username === username && user.password === password
  );

// Login
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

// Add or update a review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  const review = req.body && req.body.review;

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'A non-empty review is required.'
    });
  }

  const username = req.user.username;
  book.reviews[username] = review.trim();

  return res.status(200).json({
    message: 'Review added or updated successfully.',
    reviews: book.reviews
  });
});

// Delete your own review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

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
