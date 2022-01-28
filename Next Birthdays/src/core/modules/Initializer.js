const persistenceService = new PersistenceService();

let fileExists = persistenceService.fileExists("meta.json");
let metaFile;

if(fileExists){
    metaFile = persistenceService.readAsJSON("meta.json");
    console.log("Meta-file loaded successfully!");
} else {
    throw "Meta file not available!";
}

let pluginsMap = new Map();

console.log("Checking existence of all modules.");
for(let plugin of metaFile.plugins.modules){
    let mod = importModule(plugin);
    pluginsMap.set(plugin, mod);

    console.log(` > Module ${plugin} was found!`);
}

console.log("All modules are available!");

let entryPoint = metaFile.plugins.entrypoint;

if(!entryPoint){
    throw "No entrypoint was provided in the meta-file!";
}

if(!pluginsMap.has(entryPoint)){
    throw "The entrypoint has to be declared in the modules-list in the meta-file";
}

console.log(`Entrypoint ${entryPoint} exists and was selected!`);