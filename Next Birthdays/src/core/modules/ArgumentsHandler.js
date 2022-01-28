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