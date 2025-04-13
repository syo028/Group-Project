const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// SQLite Database
const db = new sqlite3.Database('dragonote.db', (err) => {
    if (err) console.error(err);
    console.log('Connected to SQLite database.');
});

// Create tables
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        followers TEXT DEFAULT '[]',
        following TEXT DEFAULT '[]'
    )
`);
db.run(`
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        likes TEXT DEFAULT '[]',
        comments TEXT DEFAULT '[]',
        FOREIGN KEY (userId) REFERENCES users(id)
    )
`);

// API Routes

// Register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            function (err) {
                if (err) return res.status(400).json({ error: 'Username exists' });
                res.status(201).json({ id: this.lastID, username });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });
        res.json({ id: user.id, username: user.username });
    });
});

// Create Post
app.post('/api/posts', (req, res) => {
    const { userId, title, imageUrl } = req.body;
    db.run(
        'INSERT INTO posts (userId, title, imageUrl) VALUES (?, ?, ?)',
        [userId, title, imageUrl],
        function (err) {
            if (err) return res.status(500).json({ error: 'Failed to create post' });
            res.json({ id: this.lastID, userId, title, imageUrl });
        }
    );
});

// Get Posts
app.get('/api/posts', (req, res) => {
    db.all(
        'SELECT posts.*, users.username FROM posts JOIN users ON posts.userId = users.id ORDER BY createdAt DESC',
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            res.json(rows.map(row => ({
                ...row,
                likes: JSON.parse(row.likes),
                comments: JSON.parse(row.comments)
            })));
        }
    );
});

// Like/Unlike Post
app.post('/api/posts/:id/like', (req, res) => {
    const { userId } = req.body;
    const postId = req.params.id;
    db.get('SELECT likes FROM posts WHERE id = ?', [postId], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Post not found' });
        let likes = JSON.parse(row.likes);
        if (likes.includes(userId)) {
            likes = likes.filter(id => id !== userId);
        } else {
            likes.push(userId);
        }
        db.run('UPDATE posts SET likes = ? WHERE id = ?', [JSON.stringify(likes), postId], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to update likes' });
            res.json({ likes });
        });
    });
});

// Comment on Post
app.post('/api/posts/:id/comment', (req, res) => {
    const { userId, content } = req.body;
    const postId = req.params.id;
    db.get('SELECT comments FROM posts WHERE id = ?', [postId], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Post not found' });
        let comments = JSON.parse(row.comments);
        comments.push({ userId, content, createdAt: new Date().toISOString() });
        db.run('UPDATE posts SET comments = ? WHERE id = ?', [JSON.stringify(comments), postId], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to add comment' });
            res.json({ comments });
        });
    });
});

// Follow/Unfollow User
app.post('/api/users/:id/follow', (req, res) => {
    const { followerId } = req.body;
    const followingId = parseInt(req.params.id);

    // Get follower's following list
    db.get('SELECT following FROM users WHERE id = ?', [followerId], (err, follower) => {
        if (err || !follower) return res.status(404).json({ error: 'User not found' });
        let following = JSON.parse(follower.following);

        // Get following user's followers list
        db.get('SELECT followers FROM users WHERE id = ?', [followingId], (err, followingUser) => {
            if (err || !followingUser) return res.status(404).json({ error: 'User not found' });
            let followers = JSON.parse(followingUser.followers);

            // Toggle follow status
            if (following.includes(followingId)) {
                following = following.filter(id => id !== followingId);
                followers = followers.filter(id => id !== followerId);
            } else {
                following.push(followingId);
                followers.push(followerId);
            }

            // Update both users
            db.run('UPDATE users SET following = ? WHERE id = ?', [JSON.stringify(following), followerId], (err) => {
                if (err) return res.status(500).json({ error: 'Failed to update following' });
                db.run('UPDATE users SET followers = ? WHERE id = ?', [JSON.stringify(followers), followingId], (err) => {
                    if (err) return res.status(500).json({ error: 'Failed to update followers' });
                    res.json({ following, followers });
                });
            });
        });
    });
});

// Get User Profile
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    db.get('SELECT id, username, followers, following FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        res.json({
            ...user,
            followers: JSON.parse(user.followers),
            following: JSON.parse(user.following)
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});