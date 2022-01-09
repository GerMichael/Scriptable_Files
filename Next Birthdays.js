// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: birthday-cake;
// TODO:
// - Parameters like # of items, color, ...



//  Util
const log = (...m)=> console.log(m);

// constants
const TODAY = new Date();
const PRIMARY_TEXT_COLOR = new Color("#efefef");
const BIRTHDAYS_CACHE_FILE_NAME = "_birthdaysCache";

// config
let numContacts = getNumContacts();
let [titleSize, textSize] = getTextSizes();
let [vSpacerSize, hSpacerSize] = getSpacerSizes();
let [sWhiteChr, lWhiteChr] = getWhiteChars();
let [dayTherm, todayTherm] = getDayTherminology();
let displAge = displayAge();
let displBday = displayBirtdayDate();


// ==========================================
// main
// ==========================================
const widget = await createWidget(numContacts, BIRTHDAYS_CACHE_FILE_NAME,   
                        PRIMARY_TEXT_COLOR, titleSize, textSize, vSpacerSize, 
                        hSpacerSize, sWhiteChr, lWhiteChr, dayTherm, todayTherm,
                        displAge, displBday);

Script.setWidget(widget);
Script.complete();

if(!config.runsInWidget){
  widget.presentLarge();
}





// ==========================================
// config methods
// ==========================================

// gets the number of contacts qccording to widget size
function getNumContacts(){
  switch(config.widgetFamily){
    case "medium":
      return 4;
    case "small":
      return 6;
    case "extraLarge":
    case "large":
    default: 
      return 8;
  }
}

// returns the [titleSize, textSize] appropiate to the widget size
function getTextSizes(){
  switch(config.widgetFamily){
    case "small":
      return [12, 12];
    case "extraLarge":
    case "large":
    case "medium":
    default: 
      return [24, 20];
  }
}

// returns the [vSpacerSize, hSpacerSize] appropiate to the widget size
function getSpacerSizes(){
  switch(config.widgetFamily){
    case "small":
      return [4, 2];
    case "medium":
      return [2, 5];
    case "extraLarge":
    case "large":
    default: 
      return [10, 5];
  }
}

// returns the [sWhiteChr, lWhiteChr] appropiate to the widget size
// https://en.wikipedia.org/wiki/Whitespace_character
function getWhiteChars(){
  switch(config.widgetFamily){
    case "small":
      return ["  ", " "]; // 8199 and 8199
    case "extraLarge":
    case "large":
    case "medium":
    default: 
      return [" ", "  "]; // 160 and 2x 8199
  }
}

// returns the therminolgy for [day, today] with leading space 
// appropiate to the widget size
function getDayTherminology(){
  switch(config.widgetFamily){
    case "small":
      return ["d", "🎉"];
    case "extraLarge":
      return [" days", "🔔 today"];
    case "large":
    case "medium":
    default: 
      return ["d", "🎉"]; //🎉
  }
}

function displayAge(){
  switch(config.widgetFamily){
    case "small":
      return false;
    case "extraLarge":
    case "large":
    case "medium":
    default: 
      return true;
  }
}

function displayBirtdayDate(){
  switch(config.widgetFamily){
    case "extraLarge":
      return true;
    case "small":
    case "large":
    case "medium":
    default: 
      return false;
  }
}


// ==========================================
// widget
// ==========================================

// creates a widget with n contacts. if it runs as widget, the items
// will be received by the cache file to prevend memory overflow. 
// ios currently supports 30M, however, receiving the contact 
// information will exceed this limit. 
async function createWidget(numContacts, birthdaysCacheFileName, 
                  primaryTextColor, titleSize, textSize, vSpacerSize, 
                  hSpacerSize, sWhiteChr, lWhiteChr, dayTherm, todayTherm,
                  displayAge, displBday){
  
  let contacts;
  let widget = new ListWidget();
  setBackground(widget);
    
  // just for debugging
//   widget.addText();
//   return widget;
  
  contacts = await getContacts(numContacts, birthdaysCacheFileName);
  
  if (contacts == null && !config.runsInApp){
    widget.addText("Please run this script in the app Scriptable first to use it as widget!");
    return widget;
  }
  
  const today = new Date()
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  widget.refreshAfterDate = tomorrow;

  // Title
  addWidgetTitle(widget, "Next Birthdays 🎁", titleSize, primaryTextColor);
  
  widget.addSpacer(vSpacerSize)
  
  let stack = widget.addStack();
  
  addDateStack(stack, contacts, vSpacerSize, textSize, primaryTextColor, 
                sWhiteChr, lWhiteChr, dayTherm, todayTherm);
  stack.addSpacer(hSpacerSize);
  if(displayAge){
    addAgeStack(stack, contacts, vSpacerSize, textSize, primaryTextColor);
    stack.addSpacer(hSpacerSize);
  }
  addNameStack(stack, contacts, vSpacerSize, textSize, primaryTextColor);
  if(displBday){
    stack.addSpacer(2 * hSpacerSize);
    addBdayDate(stack, contacts, vSpacerSize, textSize, primaryTextColor);
  }
  
  return widget
}

function addWidgetTitle(widget, title, titleSize, primaryTextColor){
  let titleText = widget.addText(title);
  titleText.textColor = primaryTextColor;
  titleText.font = Font.boldSystemFont(titleSize);
}

function setBackground(widget){
  let gradient = new LinearGradient();
  gradient.colors = [    
      new Color(`#f44336`),
      new Color(`#b71c1c`)
  ];
  gradient.locations = [0.0, 1];
  widget.backgroundGradient = gradient;
}

// adds a vertical stack with all remaining dates. the font size 
// has to match the one of the other stack, see addNameStack()
function addDateStack(stack, contacts, vSpacerSize, textSize, 
            primaryTextColor, sWhiteChr, lWhiteChr, dayTherm){
  let dayStack = stack.addStack();
  
  dayStack.layoutVertically();
  
  let longestBdayDiff = getDaysUntilContactsBirthday(contacts[contacts.length - 1]);

  let padStartLength = new String(longestBdayDiff).length;
  
  for(var contact of contacts){
    
    let daysBetween = getDaysUntilContactsBirthday(contact);
    
    var daysBetweenAsString = "";
    
    switch(daysBetween){
      case 0:
//         daysBetweenAsString = sWhiteChr + "🔔" + todayTherm;
         daysBetweenAsString = todayTherm;
        daysBetweenAsString = daysBetweenAsString.padStart(padStartLength + 1, lWhiteChr);
        break;
      default:
        daysBetweenAsString = daysBetweenAsString + daysBetween;  
        daysBetweenAsString = daysBetweenAsString.padStart(padStartLength, lWhiteChr);
        daysBetweenAsString = daysBetweenAsString + dayTherm;
    }
    
    let days = dayStack.addText(daysBetweenAsString)
    
    days.textColor = primaryTextColor;
    days.font = Font.boldMonospacedSystemFont(textSize);
    days.lineLimit = 1
    
    dayStack.addSpacer(vSpacerSize)
  }
}


function addAgeStack(stack, contacts, vSpacerSize, textSize, primaryTextColor){
  let ageStack = stack.addStack();
  
  ageStack.layoutVertically();
  
  for(var contact of contacts){
    
    let bdayYear = getBirthdayYear(contact);
    let yearsBetween;
    
    if(bdayYear <= 1){
      yearsBetween = "--";
    } else{
      yearsBetween = getYearsBetween(bdayYear);
    }
    
    let text = ageStack.addText("(" + yearsBetween + ")")
    
    text.textColor = primaryTextColor;
    text.font = Font.lightSystemFont(textSize);
    text.lineLimit = 1
    
    ageStack.addSpacer(vSpacerSize)
  }
}

// adds a vertical stack with all names. the font size 
// has to match the one of the other stack, see addDateStack()
function addNameStack(stack, contacts, vSpacerSize, textSize, primaryTextColor){
  let nameStack = stack.addStack();
  
  nameStack.layoutVertically();
  
  for(var contact of contacts){
    let text = nameStack.addText(contact.givenName + " " + contact.familyName)
    
    text.textColor = primaryTextColor;
    text.font = Font.lightSystemFont(textSize);
    text.lineLimit = 1
    
    nameStack.addSpacer(vSpacerSize)
  }
}

function addBdayDate(stack, contacts, vSpacerSize, textSize, primaryTextColor){
  let bdayStack = stack.addStack();
  
  bdayStack.layoutVertically();
  
  for(var contact of contacts){
    let [day,month] = getDayAndMonth(contact);
    let text = bdayStack.addText(twoDigit(day) + ". " + monthText(month))
    
    text.textColor = primaryTextColor;
    text.font = Font.lightSystemFont(textSize);
    text.lineLimit = 1
    
    bdayStack.addSpacer(vSpacerSize)
  }
}




// ==========================================
// data provider
// ==========================================
async function getContacts(numContacts, birthdaysCacheFileName){
  let monthMap;
  
  if(config.runsInWidget){
    monthMap = loadBirthdaysFromCache(birthdaysCacheFileName);
  } else {
    monthMap = await getBirthdayStructureAndCacheIt(birthdaysCacheFileName);
  }
  
  return nextBirthdayContacts(monthMap, numContacts);
}






// ==========================================
// caching
// ==========================================
function getDefaultPath(fm, birthdaysCacheFileName){
  return fm.joinPath(fm.documentsDirectory(), birthdaysCacheFileName);
}

function storeContactsToCache(contacts, birthdaysCacheFileName){
  let fm = FileManager.local();
  
  fm.writeString(getDefaultPath(fm, birthdaysCacheFileName), JSON.stringify(contacts));
}

function loadBirthdaysFromCache(birthdaysCacheFileName){
  let fm = FileManager.local();
  
  if(!fm.fileExists(getDefaultPath(fm, birthdaysCacheFileName))){
    return null;
  }
  
  let data = fm.readString(getDefaultPath(fm, birthdaysCacheFileName));
  return JSON.parse(data);
}






// ==========================================
// data generation
// ==========================================
async function getBirthdayStructureAndCacheIt(birthdaysCacheFileName){
  
  let allContactContainers = await ContactsContainer.all();
  
  log(allContactContainers);
  
  let contacts = await Contact.all(allContactContainers);
  
  let monthMap = {};
  
  fillStructure(contacts, monthMap);
  
  storeContactsToCache(monthMap, birthdaysCacheFileName);
  
  return monthMap;
}

// fills the month-day-structure with leightweigt contact data. duplicate contacts 
// identified by the same family-, given-name and birthday get added only once
function fillStructure(contacts, monthMap){
  
  for(const contact of contacts){
    let result = getDayAndMonth(contact);
  
    if(result == null){
      continue;
    }
    
    let [day, month] = result;
    
    if(!(month in monthMap)){
        monthMap[month] = {};
    }
    
    let dayMap = monthMap[month];
    
    if(!(day in dayMap)){
    	dayMap[day] = [];
    }
    
    let contactList = dayMap[day];
    let c = {
      birthday: contact.birthday,
      givenName: contact.givenName,
      familyName: contact.familyName,
    };
    
    if(!contactList.some(e => e.givenName == c.givenName && 
                        e.familyName == c.familyName &&
                        new Date(e.birthday).getTime() == new Date(c.birthday).getTime())){
      contactList.push(c);
    }
    
  }
  
  return monthMap;
}


function nextBirthdayContacts(monthMap, numContacts){
  let nextContacts = [];
  let month = TODAY.getMonth();
  let day = TODAY.getDate();
  let initial = true;
  
  while(nextContacts.length < numContacts){
    
  //   log('month', month)
    
    if(!initial && month == TODAY.getMonth()){
      break;
    } 
  
    if(!(month in monthMap)){
      log("month not found", month)
      month++;
      if(month > 11){
        log("reached years end")
        month = 0;
      }
      day = 1;
      continue;
    }
    
    const dayMap = monthMap[month];
    
    while(nextContacts.length < numContacts){
      
//     log('day', day)
      
      if((day in dayMap)){

        const contactsForDay = dayMap[day];
        
        let i = 0;
        while(nextContacts.length < numContacts && i < contactsForDay.length){
          nextContacts.push(contactsForDay[i]);
          
  //         log("pushing contact")
          
          i++
        }
      }
      
      day++;
      
      if(day > 31){
//           log("reached month end")
        if(month > 11){
//             log("reached years end")
          month = -1;
        }
        day = 1;
        break;
      }
    }
    
//     log("month before", month)
    month++;
//     log("month after", month)
    
    if(month > 11){
//       log('reset')
      month = 0;
    }
    
    day = 1;
    initial = false;
    
  }
  
//   log(nextContacts)
  
  return nextContacts;
}



function twoDigit(txt){
  return new String(txt).padStart(2, "0")
}

function getDaysUntilContactsBirthday(contact){
  let [day,month] = getDayAndMonth(contact);
  let bday = getNextBday(day, month);
  let daysBetween = getDaysBetween(bday, TODAY);    
  return daysBetween;
}

function getYearsBetween(bdayYear){
  return TODAY.getFullYear() - bdayYear;
}

function getBirthdayYear(contact){
  const bday = contact.birthday;
  if(!bday){
    return null;
  }
  
  const bDate = new Date(bday);
  
  return bDate.getFullYear();
}

function getDayAndMonth(contact) {
  const bday = contact.birthday;
  if(!bday){
    return null;
  }
  
  const bDate = new Date(bday);
  
  return [bDate.getDate(), bDate.getMonth()];
}

function getNextBday(day, month){
  const date = new Date();
  
  date.setDate(day);
  date.setMonth(month);
  const year = (date.getTime() < TODAY.getTime() ? TODAY.getFullYear() + 1 : TODAY.getFullYear())
  date.setYear(year);
  
  return date;
}
function getDaysBetween(dateA, dateB){
  var difference = dateA.getTime() - dateB.getTime();
//   log(dateA, dateB)
  return Math.floor(difference / (1000 * 3600 * 24));
}

function monthText(month){
  let months = ["January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December"];
                
  return month >= 0 && month < months.length ? months[month] : month; 
}