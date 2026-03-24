const mysql = require('mysql');

// 创建连接
const connection = mysql.createConnection({
  host: '55.50.9.184', // 数据库服务器地址
  port: 3306,
  user: 'dev_infra',      // 数据库用户名
  password: 'AcsUat#2023', // 数据库密码
  database: 'apichain' // 使用的数据库名
});

// 连接到数据库
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to the MySQL server.');

  // 查询数据
  connection.query('SELECT * FROM users', (err, results, fields) => {
    if (err) throw err;
    console.log('The solution is: ', results);
  });

  // 插入数据
  const insertSql = 'INSERT INTO users (name, email) VALUES (?, ?)';
  const insertValues = ['John Doe', 'john@example.com'];
  connection.query(insertSql, insertValues, (err, result) => {
    if (err) throw err;
    console.log('1 record inserted, ID:', result.insertId);
  });

  // 更新数据
  const updateSql = 'UPDATE users SET email = ? WHERE name = ?';
  const updateValues = ['john.new@example.com', 'John Doe'];
  connection.query(updateSql, updateValues, (err, result) => {
    if (err) throw err;
    console.log('1 record updated');
  });

  // 删除数据
  const deleteSql = 'DELETE FROM users WHERE name = ?';
  const deleteValues = ['John Doe'];
  connection.query(deleteSql, deleteValues, (err, result) => {
    if (err) throw err;
    console.log('1 record deleted');

    // 关闭连接
    connection.end((err) => {
      if (err) throw err;
      console.log('Connection closed.');
    });
  });
});