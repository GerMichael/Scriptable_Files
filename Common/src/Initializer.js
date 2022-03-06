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