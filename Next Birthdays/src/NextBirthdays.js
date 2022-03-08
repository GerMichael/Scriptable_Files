ArgumentsHandler.init();

let contacts = await ContactService.loadContacts(true);

console.log("Resulting contact list:");
console.log("List head");
for(let c of contacts){
    c.print();
}
console.log("List tail");

let widgetWrapper = new WidgetWrapper();
let widget = widgetWrapper.widget;

if(ArgumentsHandler.hasArg("html")){
  let renderer = new HtmlRenderer(widget);
  await renderer.renderData(contacts);
} else {
  let renderer = new StackRenderer(widget);
  renderer.renderData(contacts);
}

widget.presentLarge();
Script.complete();