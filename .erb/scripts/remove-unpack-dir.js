const fs = require('fs').promises;   // 推荐用 promises 版
const path = require('path');

module.exports = async function () {   // 改成 async function
  const rootPath = path.join(__dirname, '../..');
  const releasePath = path.join(rootPath, 'release');
  const buildPath = path.join(releasePath, 'build');
  
  const foldersToRemove = [
    path.join(buildPath, 'win-unpacked'),
    path.join(releasePath, 'mac'),          // ← 通常是 mac，而不是 mac-arm64
    path.join(releasePath, 'mac-arm64'),    // 如果你确实分开打包了才留着
    path.join(releasePath, 'linux-unpacked'),
    // path.join(releasePath, 'linux-arm64'),   // 如果有也加上
  ];

  for (const folder of foldersToRemove) {
    try {
      if (await fs.access(folder).then(() => true).catch(() => false)) {
        console.log('正在删除:', folder);
        await fs.rm(folder, { recursive: true, force: true });
        console.log('删除成功:', folder);
      }
    } catch (err) {
      console.error(`删除失败 ${folder}:`, err.code, err.message);
    }
  }
};