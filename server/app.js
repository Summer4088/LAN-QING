const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// 使用 body-parser 中间件解析 JSON 数据
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 获取所有留言
app.get('/messages', (req, res) => {
  pool.query('SELECT * FROM messages', (error, results) => {
    if (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

// 添加新留言
app.post('/messages', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  pool.query('INSERT INTO messages (title, content) VALUES (?, ?)', [title, content], (error, results) => {
    if (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Message added successfully' });
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});