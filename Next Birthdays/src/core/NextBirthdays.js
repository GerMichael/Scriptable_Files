const persistenceService = new PersistenceService();

const app = Initializer.init();

console.log(app.metaFile);
console.log(app.entrypoint);