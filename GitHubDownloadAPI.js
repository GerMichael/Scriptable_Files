// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
const github = "https://raw.githubusercontent.com/GerMichael/Scriptable_Files/main/";
const metaFile = "meta.json";

let url = github + metaFile;

let req = new Request(url);
let json = await req.loadJSON();

console.log(json);

if(json && json.scripts){
  for(let script of json.scripts){
    url = github + script;
    req = new Request(url);
    
    let fileContent = await req.loadString();
    
    await writeScript(script, fileContent);
  }
}

async function writeScript(scriptName, fileContent){
  let fm = importModule("FileManaging").get();
  
  let docsDir = fm.documentsDirectory();
  
  let path = fm.joinPath(docsDir, scriptName);
  
  fm.writeString(path, fileContent);
}