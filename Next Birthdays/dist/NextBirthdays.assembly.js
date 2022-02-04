class Constants{

    static NEW_META_FILE = "meta.new.json";
    static NEW_META_FILE = "meta.json";

    
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

    store(file, data){
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
        let string = JSON.stringify(json);

        this.storeString(file, string);
    }

    storeString(file, string){
      
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