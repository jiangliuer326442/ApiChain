const mysql = require('mysql');

// 创建连接（无冗余配置，专注核心）
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'your_db'
});

// 连接并执行 SQL
connection.connect((err) => {
  if (err) throw err;
  console.log('已连接 MySQL！');
  
  // 执行查询（核心功能）
  connection.query('SELECT * FROM users LIMIT 1', (err, results) => {
    if (err) throw err;
    console.log('查询结果：', results);
    connection.end(); // 关闭连接
  });
});