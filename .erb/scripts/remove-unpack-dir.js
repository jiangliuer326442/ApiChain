const { rimrafSync } = require('rimraf');
const fs = require('fs');
const path = require('path');

module.exports = function () {

  const rootPath = path.join(__dirname, '../..');
  const releasePath = path.join(rootPath, 'release');
  const buildPath = path.join(releasePath, 'build');
  const buildWindowsPath = path.join(buildPath, 'win-unpacked');
  const buildMacosPath = path.join(releasePath, 'mac-arm64');
  const buildLinuxPath = path.join(releasePath, 'linux-unpacked');

  const foldersToRemove = [
    buildWindowsPath,
    buildMacosPath,
    buildLinuxPath,
  ];

  foldersToRemove.forEach((folder) => {
    if (fs.existsSync(folder)) rimrafSync(folder);
  });

}