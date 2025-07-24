export function addNewlineBeforeTripleBackticks(str) {
  let ret = str.replace(/([^\n]|^)(\s*)```/g, '$1\n$2```');
  ret = ret.replaceAll("```#", "```\n\n#");
  return ret;
}