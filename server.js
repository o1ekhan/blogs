// server.js

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

//  Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// BlogPost model
const BlogPost = mongoose.model('BlogPost', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  author: { type: String, required: true, trim: true }
}, { timestamps: true }));

// Middleware for validating blog post data
function validateBlogPost(req, res, next) {
  // Destructure the title and body from the request body
  const { title, body } = req.body;

  // Check if title and body are provided and are strings with a length greater than zero when trimmed
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Post title is required.' });
  }
  if (typeof body !== 'string' || !body.trim()) {
    return res.status(400).json({ message: 'Post body is required.' });
  }
  // If validation passes, move to the next middleware/route handler
  next();
}

// CRUD API Endpoints
// Create a new blog post
app.post('/blogs', validateBlogPost, async (req, res) => {
  try {
    const newPost = new BlogPost(req.body);//insertOne in native MongoDB
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    next(err);
  }
});

// Get all blog posts
app.get('/blogs', async (req, res) => {
  try {
    const posts = await BlogPost.find();//find in native MongoDB
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// Get a single blog post by ID
app.get('/blogs/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);//findOne in native MongoDB
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (err) {
    next(err);
  }
});

// Update a blog post by ID
app.put('/blogs/:id', validateBlogPost, async (req, res) => {
  try {
    const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });//updateOne in native MongoDB
    if (updatedPost) {
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (err) {
    next(err);
  }
});

// Delete a blog post by ID
app.delete('/blogs/:id', async (req, res) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);//deleteOne in native MongoDB
    if (deletedPost) {
      res.json({ message: 'Blog post deleted successfully' });
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (err) {
    next(err);
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: 'Invalid request data' });// Determine if it's a validation error
  }
  if (err instanceof DatabaseConnectionError) {
    return res.status(503).json({ error: 'Service temporarily unavailable' });// Determine if it's a database connection error
  }
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
