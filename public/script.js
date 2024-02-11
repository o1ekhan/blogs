// script.js

// Function to create a new blog post
async function createPost() {
    const title = document.getElementById('title').value;
    const body = document.getElementById('body').value;
    const author = document.getElementById('author').value;

    const post = { title, body, author };

    const response = await fetch('/blogs', { // Ensure this URL matches your API endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
    });

    if (response.ok) {
        console.log('Post created successfully');
        fetchPosts(); // Refresh the list of posts
    } else {
        console.error('Error creating post');
    }
}

// Function to fetch and display all blog posts
async function fetchPosts() {
    const response = await fetch('/blogs'); // Ensure this URL matches your API endpoint
    const posts = await response.json();

    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = ''; // Clear existing posts

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        const createdAt = new Date(post.createdAt).toLocaleString();
        const updatedAt = new Date(post.updatedAt).toLocaleString();
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <small>Author: ${post.author}</small>
            <small>Created at: ${createdAt}</small>
            <small>Last updated: ${updatedAt}</small>
            <button onclick="editPost('${post._id}')">Edit</button>
            <button onclick="deletePost('${post._id}')">Delete</button>
        `;
        postsContainer.appendChild(postElement);
    });
}

async function deletePost(postId) {
    const response = await fetch(`/blogs/${postId}`, { // Ensure this URL matches your API endpoint
        method: 'DELETE'
    });

    if (response.ok) {
        console.log('Post deleted successfully');
        fetchPosts(); // Refresh the list of posts
    } else {
        console.error('Error deleting post');
    }
}

// Fetch and display posts when the page loads
document.addEventListener('DOMContentLoaded', fetchPosts);

let isEditing = false;

// Function to handle form submission for both creating and updating posts
async function submitPost() {
    const postId = document.getElementById('postId').value;
    const title = document.getElementById('title').value;
    const body = document.getElementById('body').value;
    const author = document.getElementById('author').value;

    const post = { title, body, author };
    let url = '/blogs';
    let method = 'POST';

    // If we're editing an existing post, change the URL and method
    if (isEditing) {
        url = `/blogs/${postId}`;
        method = 'PUT';
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
    });

    if (response.ok) {
        console.log('Post submitted successfully');
        fetchPosts(); // Refresh the list of posts
        clearForm(); // Clear the form
    } else {
        console.error('Error submitting post');
    }
}

// Function to populate the form for editing
async function editPost(postId) {
    const response = await fetch(`/blogs/${postId}`);
    const post = await response.json();

    // Populate form fields with post data
    document.getElementById('postId').value = post._id;
    document.getElementById('title').value = post.title;
    document.getElementById('author').value = post.author;
    document.getElementById('body').value = post.body;

    isEditing = true; // Set the form to edit mode
}

// Function to clear the form and reset edit mode
function clearForm() {
    document.getElementById('postId').value = '';
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('body').value = '';
    isEditing = false; // Reset the form to create mode
}