// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;
module.exports.get = () => {
  let fm;
  
  try{
    fm = FileManager.iCloud();
  } catch(e){
    fm = FileManager.local();
  }
  
  return fm;
}