class Updater {

    static async updateAvailable(metaFile){
        let persist = PersistenceService.getInstance();
        let metaData = persist.readAsJSON(metaFile);
        let scriptOrigin = metaData[Constants.SCRIPT_ORIGIN_ATTR];

        let req = new Request(Constants.REPO_URL + scriptOrigin + Constatns.META_FILE_SUFFIX);
        let remoteMetaData = await req.loadJSON();

        let updateAvailable = false;
        if(remoteMetaData[Constants.VERSION_ATTR] != metaData[Constants.VERSION_ATTR]){
            updateAvailable = true;
        }

        return {"result": updateAvailable, remoteMetaData};
    }

    static async update(metaFile){

        let userAccepts = Updater.userWantsToUpdate();

        if(userAccepts){
            let persist = PersistenceService.getInstance();
    
            let scriptContent = await Updater.requestScript(metaFile);
            let scriptName = metaData[Constants.SCRIPT_NAME_ATTR];
            persist.storeString(scriptName, scriptContent);
    
            persist.storeString(Constants.META_FILE_SUFFIX, metaFile);
        }
    }

    static async userWantsToUpdate(){
        let a = new Alert();

        a.title = "Update available"
        a.message = "Do you want to download the new update for this widget?";

        a.addCancelAction("No");
        a.addAction("Yes");


        let result = await a.present();
        
        return result === 0 ? true : false;
    }

    static async requestScript(metaFile){

        let scriptOrigin = metaData[Constants.SCRIPT_ORIGIN_ATTR];

        let req = new Request(Constants.REPO_URL + scriptOrigin);
        let script = await req.loadString();

        return script;
    }
}