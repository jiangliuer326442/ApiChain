export function addNewlineBeforeTripleBackticks(str) {
  return str.replace(/([^\n]|^)(\s*)```/g, '$1\n$2```');
}