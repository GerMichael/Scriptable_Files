class Constants{

    static META_FILE_SUFFIX = ".meta.json";
    static REPO_URL = "https://raw.githubusercontent.com/GerMichael/Scriptable_Files/new_approach/";
    static SCRIPT_NAME_ATTR = "script";
    static SCRIPT_ORIGIN_ATTR = "origin";
    static VERSION_ATTR = "version";
    
}
class ArgumentsHandler {
    
    static rawArgs = null;
    static args = new Map();

    static init(){
        let rawArgs = args.widgetParameter;
        ArgumentsHandler.rawArgs = rawArgs;

        if(rawArgs && typeof rawArgs === "string"){
            let argsArray = rawArgs.split(" ");

            for(let arg of argsArray){
                let argSplitted = arg.split("=");

                let key = argSplitted[0].toLowerCase();
                let value = argSplitted[1] ? argSplitted[1].toLowerCase() : undefined;
                ArgumentsHandler.args.set(key, value);
            }
        }
    }

    static hasArg(name){
        return ArgumentsHandler.args.has(name.toLowerCase());
    }

    static getArg(name){
        return ArgumentsHandler.args.get(name.toLowerCase());
    }
}
class PersistenceService {
    
    static instance = null;

    static getInstance(){
        if(PersistenceService.instance == null){
            PersistenceService.instance = new PersistenceService();
        }
        return PersistenceService.instance;
    }

    constructor(){
        if(CloudPersistenceService.isAvailable()){
            this.service = new CloudPersistenceService();
        } else {
            this.service = new LocalPersistenceService();
        }
    }

    useLocalService(){
        this.service = new LocalPersistenceService();
    }

    useCloudService(){
        this.service = new CloudPersistenceService();
    }

    useDocuments(){
        this.service.useDocuments();
    }

    useLibrary(){
        this.service.useLibrary();
    }

    useTemporary(){
        this.service.useTemporary();
    }

    store(file, data){
        console.log("storing: " + data);

        if(typeof data === "string"){
            this.service.storeString(file, data);
        } else if(typeof data === "object"){
            this.service.storeJSON(file, data);
        } else {
            throw "Data type not supported. currently only string and serializeable json-objects";
        }
    }

    readAsJSON(file){
        return this.service.readAsJSON(file);
    }

    readAsString(file){
        return this.service.readString(file);
    }

    fileExists(file){
        return this.service.fileExists(file);
    }

    deleteFile(file){
        this.service.deleteFile(file);
    }
}

class AbstractPersistenceService {
    static SERVICE_NOT_AVAILABLE = "File Manager Service is not available.";
    static DIR_NOT_AVAILABLE = "Directory to store file is not available.";

    useDocuments(){
        if(this.fs == null){
            throw AbstractPersistenceService.SERVICE_NOT_AVAILABLE;
        }

        console.log("Setting docuemnts-directory to file-destination");
        this.dir = this.fs.documentsDirectory();
    }

    useLibrary(){
        if(this.fs == null){
            throw AbstractPersistenceService.SERVICE_NOT_AVAILABLE;
        }
        
        console.log("Setting library-directory to file-destination");
        this.dir = this.fs.libraryDirectory();
    }

    useTemporary(){
        if(this.fs == null){
            throw AbstractPersistenceService.SERVICE_NOT_AVAILABLE;
        }

        console.log("Setting temporary-directory to file-destination");
        this.dir = this.fs.temporaryDirectory();
    }

    storeJSON(file, json){
        console.log("store as json");
        let string = JSON.stringify(json);

        this.storeString(file, string);
    }

    storeString(file, string){
        console.log("store as string");
      
        if(this.dir == null){
            throw AbstractPersistenceService.DIR_NOT_AVAILABLE;
        }

        console.log(`Storing data to ${file}`);
        this.fs.writeString(this.getPath(file), string);
    }

    readString(file){
        console.log(`Reading data from ${file}`);
        return this.fs.readString(this.getPath(file));
    }

    readAsJSON(file){
        return JSON.parse(this.readString(file));
    }

    getPath(file){
        if(this.fs == null){
            return file;
        }

        return this.fs.joinPath(this.fs.documentsDirectory(), file);
    }

    fileExists(file){
        if(this.dir == null){
            throw AbstractPersistenceService.DIR_NOT_AVAILABLE;
        }

        return this.fs.fileExists(this.getPath(file));
    }

    deleteFile(file){
        if(this.dir == null){
            throw AbstractPersistenceService.DIR_NOT_AVAILABLE;
        }

        this.fs.remove(this.getPath(file));
    }
}

class LocalPersistenceService extends AbstractPersistenceService {
    
    constructor(){
        super();
        this.fs = FileManager.local();

        console.log("Using local file manager");

        this.useDocuments();
    }

}

class CloudPersistenceService extends AbstractPersistenceService {

    static isAvailable(){
        try{
            FileManager.iCloud();
            return true;
        } catch(e){
            return false;
        }
    }

    constructor(){
        super();
        this.fs = FileManager.iCloud();

        console.log("Using icloud manager");

        this.useDocuments();
    }
}
class Updater {

    static async updateAvailable(metaFile){
        let persist = PersistenceService.getInstance();
        persist.useCloudService();
        persist.useDocuments();

        let metaData = persist.readAsJSON(metaFile);
        let scriptOrigin = metaData[Constants.SCRIPT_ORIGIN_ATTR];

        let req = new Request(Constants.REPO_URL + scriptOrigin + Constants.META_FILE_SUFFIX);
        let remoteMetaData = await req.loadJSON();
        console.log(remoteMetaData);

        let updateAvailable = false;
        if(remoteMetaData[Constants.VERSION_ATTR] != metaData[Constants.VERSION_ATTR]){
            updateAvailable = true;
        }

        return {"result": updateAvailable, remoteMetaData};
    }

    static async update(metaFile){

        let updateAvailableResult = await Updater.updateAvailable(metaFile);

        if(!updateAvailableResult.result){
            return;
        }

        let userAccepts = await Updater.userWantsToUpdate();

        if(userAccepts){
            console.log("Updating...");
        
            let metaData = updateAvailableResult.remoteMetaData;
    
            console.log("load script");
            let scriptContent = await Updater.requestScript(metaData);
            let scriptName = metaData[Constants.SCRIPT_NAME_ATTR];

            console.log("update script with name: " + scriptName);
            persist.store(scriptName, scriptContent);
    
            let metaFileName = scriptName + Constants.META_FILE_SUFFIX;
            console.log("update script meta file with name: " + metaFileName);
            persist.store(metaFileName, metaData);
        } else {
            console.log("Update canceled");
        }
    }

    static async userWantsToUpdate(){
        let a = new Alert();

        a.title = "Update available"
        a.message = "Do you want to download the new update for this widget?";

        a.addCancelAction("No");
        a.addAction("Yes");

        let result = await a.present();
        
        console.log("Update was " + (result === 0 ? "accepted" : "rejected"));

        return result === 0;
    }

    static async requestScript(metaData){
        console.log("requesting script");

        let scriptOrigin = metaData[Constants.SCRIPT_ORIGIN_ATTR];

        let req = new Request(Constants.REPO_URL + scriptOrigin);
        let script = await req.loadString();

        console.log("loaded script successfully");

        return script;
    }
}
class Initializer{

    static init(metaFileName){
        console.log("Initializing...");

        let fileExists = persistenceService.fileExists(metaFileName);
        let metaFile;

        if(fileExists){
            metaFile = persistenceService.readAsJSON(metaFileName);
            console.log("Meta-file loaded successfully!");
        } else {
            throw "Meta file not available!";
        }

        let pluginsMap = new Map();

        console.log("Checking existence of all modules.");
        for(let plugin of metaFile.plugins.modules){
            console.log(` > Checking ${plugin}`);
            let mod = importModule(plugin);
            pluginsMap.set(plugin, mod);

            console.log(` > Module ${plugin} was found!`);
        }

        console.log("All modules are available!");

        let entrypoint = metaFile.plugins.entrypoint;

        if(!entrypoint){
            throw "No entrypoint was provided in the meta-file!";
        }

        if(!pluginsMap.has(entrypoint)){
            throw "The entrypoint has to be declared in the modules-list in the meta-file";
        }

        console.log(`Entrypoint ${entrypoint} exists and was selected!`);

        return {
            "metaFile": metaFile,
            "entrypoint": entrypoint,
        }
    }

}
/*
ArgumentsHandler.init();

const persistenceService = PersistenceService.getInstance();

const app = Initializer.init("meta.json");

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
*/

Updater.update("meta.json");