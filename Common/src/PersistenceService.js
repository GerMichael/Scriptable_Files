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
            this.useCloudService();
        } else {
            this.useLocalService();
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

    store(file, data){
        console.log("storing data of type " + (typeof data));

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