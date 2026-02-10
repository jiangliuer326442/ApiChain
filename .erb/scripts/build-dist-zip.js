const fs = require('fs-extra');
const { spawn } = require('child_process')
const { path7za } = require('7zip-bin')
const path = require('path');

const rootPath = path.join(__dirname, '../..');
const releasePath = path.join(rootPath, 'release');
const buildPath = path.join(releasePath, 'build');
const appPath = path.join(releasePath, 'app');

if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath, { recursive: true });
}

spawn(path7za, [
  'a',           // add
  path.join(buildPath, `app_${process.platform}.7z`),     // 输出文件
  '.', // 要压缩的目录或文件
  '-mx=9'        // 压缩等级
], {
  stdio: 'inherit',
  cwd: appPath // 设置工作目录为 release/app
})