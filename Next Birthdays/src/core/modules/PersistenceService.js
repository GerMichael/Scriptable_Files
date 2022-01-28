class PersistenceService {
    
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