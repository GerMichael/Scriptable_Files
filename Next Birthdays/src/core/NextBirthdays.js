ArgumentsHandler.init();

const persistenceService = PersistenceService.getInstance();

const app = Initializer.init();

console.log(app.metaFile);
console.log(app.entrypoint);

console.log(ArgumentsHandler.getArg("assigned"));
console.log(ArgumentsHandler.hasArg("single"));
console.log(ArgumentsHandler.getArg("undefined"));

let widget = new ListWidget();

widget.addText(ArgumentsHandler.getArg("assigned") + "");
widget.addText(ArgumentsHandler.hasArg("single") + "");
widget.addText(ArgumentsHandler.getArg("undefined") + "");

Script.setWidget(widget);
Script.complete();

if(!config.runsInWidget){
  widget.presentLarge();
}