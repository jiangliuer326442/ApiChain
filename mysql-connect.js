// 引入 mysql2 库，优先使用 promise 版本以便于异步操作
import mysql from 'mysql2/promise';

// 数据库连接配置（替换为你的实际信息）
const dbConfig = {
  host: '127.0.0.1',     // 数据库地址（本地为 localhost）
  user: 'root',          // 你的 MySQL 账号
  password: '@Fangha326442', // 你的 MySQL 密码
  database: 'apichain260318',  // 要连接的数据库名
  port: 3306,            // MySQL 端口（默认 3306）
  charset: 'utf8mb4'     // 字符集（支持 emoji 等特殊字符）
};

/**
 * 执行 SQL 语句的通用函数
 * @param {string} sql - 要执行的 SQL 语句
 * @param {Array} [params=[]] - SQL 语句的参数（防止 SQL 注入）
 * @returns {Promise<Array>} - 返回查询结果
 */
async function executeSql(sql, params = []) {
  let connection;
  try {
    // 1. 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 2. 执行 SQL 语句（使用参数化查询防止 SQL 注入）
    const [results] = await connection.execute(sql, params);
    
    // 3. 返回执行结果
    return results;
  } catch (error) {
    console.error('❌ 数据库操作失败:', error.message);
    throw error; // 抛出错误让调用方处理
  } finally {
    // 4. 无论成功失败，都关闭连接
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 示例：调用函数执行 SQL
(async () => {
  try {
    // 示例 1：查询数据（参数化查询）
    const selectSql = 'SELECT title, address, category FROM apichain_link WHERE team_id = ?';
    const selectResult = await executeSql(selectSql, ["team_id_260318"]);
    console.log('查询结果:', selectResult);

    // 示例 2：插入数据（参数化查询）
    // const insertSql = 'INSERT INTO apichain_link (team_id, title, address, category, create_uid, create_time, del_flg) VALUES (?, ?, ?, ?, ?, NOW(), 0)';
    // const insertResult = await executeSql(insertSql, ['team_id_260318', '示例标题2', '示例地址2', 1, '示例用户2']);
    // console.log('插入结果:', insertResult);

    // 示例 3：更新数据
    // const updateSql = 'UPDATE users SET age = ? WHERE name = ?';
    // const updateResult = await executeSql(updateSql, [26, '张三']);
    // console.log('更新结果:', updateResult);

    // 示例 4：删除数据
    // const deleteSql = 'DELETE FROM users WHERE name = ?';
    // const deleteResult = await executeSql(deleteSql, ['张三']);
    // console.log('删除结果:', deleteResult);
  } catch (error) {
    console.error('执行示例失败:', error);
  }
})();