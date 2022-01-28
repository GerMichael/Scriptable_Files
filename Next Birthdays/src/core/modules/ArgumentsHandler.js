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
                ArgumentsHandler.args.set(argSplitted[0], argSplitted[1]);
            }
        }
    }

    static hasArg(name){
        return ArgumentsHandler.args.has(name);
    }

    static getArg(name){
        return ArgumentsHandler.args.get(name);
    }
}