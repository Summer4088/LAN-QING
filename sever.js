const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// 配置CORS
app.use(cors());

// 解析JSON数据
app.use(express.json());

// 连接数据库
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'love_messages',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 创建留言表
async function createMessagesTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Messages table created successfully.');
  } catch (error) {
    console.error('Error creating messages table:', error);
  }
}

// 初始化数据库
createMessagesTable();

// 获取留言列表
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM messages ORDER BY created_at DESC');
    res.json({ success: true, messages: rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 提交留言
app.post('/api/messages', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO messages (title, content) VALUES (?, ?)', 
      [title, content]
    );
    res.json({ success: true, message: 'Message submitted successfully' });
  } catch (error) {
    console.error('Error submitting message:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, '.')));

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});  