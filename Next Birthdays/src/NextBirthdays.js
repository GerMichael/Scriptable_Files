let contacts = await ContactService.loadContacts(true);

console.log("Resulting contact list:");
console.log("List head");
for(let c of contacts){
    c.print();
}
console.log("List tail");