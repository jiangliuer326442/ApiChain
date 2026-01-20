export function addNewlineBeforeTripleBackticks(str) {
  let ret = str.replace(/([^\n]|^)(\s*)```/g, '$1\n$2```');
  ret = ret.replaceAll("```#", "```\n\n#");
  return ret;
}

export function addCodeMarkdown(codeStr) {
  let ret = "```java\n";
  ret += codeStr + "\n";
  ret += "```\n";
  return ret;
}