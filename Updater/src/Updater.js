class Updater {

    static async updateAvailable(metaFile){
        let persist = PersistenceService.getInstance();
        persist.useCloudService();
        persist.useDocuments();

        let metaData = persist.readAsJSON(metaFile);
        let scriptOrigin = metaData[Constants.SCRIPT_ORIGIN_ATTR];

        let req = new Request(Constants.REPO_URL + scriptOrigin + Constants.META_FILE_SUFFIX);
        let remoteMetaData = await req.loadJSON();
        console.log("new meta-data: " + remoteMetaData);

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

            let persist = PersistenceService.getInstance();
            persist.useCloudService();
            persist.useDocuments();
        
            let metaData = updateAvailableResult.remoteMetaData;
    
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