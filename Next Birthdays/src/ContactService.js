class ContactService {

    static CONTACTS_CACHE_FILE_NAME = "__contacts_cache.json"

    static async loadContacts(loadFromCache) {
        let contacts;

        if(loadFromCache){
            if(PersistenceService.getInstance().fileExists(this.CONTACTS_CACHE_FILE_NAME)){
                contacts = await this.loadContactsFromCache(this.CONTACTS_CACHE_FILE_NAME);
            } else {
                throw new Error("Cache does not exist!");
            }
        } else {
            contacts = await this.loadContactsFromOS(this.CONTACTS_CACHE_FILE_NAME);
        }

        return contacts;
    }

    static loadContactsFromCache(cacheFileName){
        let contactsRaw = PersistenceService.getInstance().readAsJSON(cacheFileName);
        let contacts = [];

        for(let c of contactsRaw){
            contacts.push(new Person(c));
        }

        return contacts;
    }

    static async loadContactsFromOS(cacheFileName){
        let allContactContainers = await ContactsContainer.all();
        
        let contacts = await Contact.all(allContactContainers);

        console.log(`Loaded ${contacts.length} contacts from OS`);
        
        contacts = this.getSlimifiedContacts(contacts);
        contacts = this.getContactsWithBirthday(contacts);
        contacts = this.getUniqueContacts(contacts);
        contacts = this.getSortedContacts(contacts);

        this.storeContactsToCache(cacheFileName, contacts);
        
        return contacts;
    }

    static getSlimifiedContacts(contacts){
        let slimifiedContacts = [];

        for(let contact of contacts){
            let simplifedContact = new Person(contact.familyName, contact.givenName, contact.birthday);

            slimifiedContacts.push(simplifedContact);
        }

        console.log(`Slimified ${slimifiedContacts.length} contacts`);

        return slimifiedContacts;
    }

    static getContactsWithBirthday(contacts){
        let contactsWithBirthday = [];

        for(let c of contacts){
            if(c.birthday){
                contactsWithBirthday.push(c);
            }
        }

        console.log(`Found ${contactsWithBirthday.length} contacts with birthday`);

        return contactsWithBirthday;
    }

    static getUniqueContacts(contacts){
        let uniqueContacts = [];

        for(let contact of contacts){
            let indexOfSamePerson = -1;

            for(let i = 0; i < uniqueContacts.length; i++){
                if(uniqueContacts[i].equals(contact)){
                    indexOfSamePerson = i;
                    break;
                }
            }

            if(indexOfSamePerson > -1){
                uniqueContacts[indexOfSamePerson] = contact;
            } else {
                uniqueContacts.push(contact);
            }
        }

        console.log(`Removed ${contacts.length - uniqueContacts.length} instances of redundant contact information`);

        return uniqueContacts;
    }

    static getSortedContacts(contacts){
        let sortedContacts = contacts.sort((p1, p2)=> {
            let p1Day = p1.birthday.getDate();
            let p2Day = p2.birthday.getDate();

            let p1Month = p1.birthday.getMonth();
            let p2Month = p2.birthday.getMonth();

            let p1DayMonth = p1Day + p1Month * 31;
            let p2DayMonth = p2Day + p2Month * 31;

            return p1DayMonth - p2DayMonth;
        });

        console.log(`Sorted contacts by month and day`);

        return sortedContacts;
    }

    static storeContactsToCache(cacheFileName, contacts){
        PersistenceService.getInstance().store(cacheFileName, contacts);
    }

    static getNextNContacts(contacts, numContacts){

        let today = new Date();
        let nextNContacts = undefined;

        for(let i = 0; i < contacts.length; i++){
            let c = contacts[i];

            if( c.birthday.getMonth() > today.getMonth() ||
                c.birthday.getMonth() === today.getMonth() &&  
                c.birthday.getDate() >= today.getDate()){

                nextNContacts = contacts.slice(i, i + numContacts);

                if(nextNContacts.length < numContacts){
                    nextNContacts = nextNContacts.concat(contacts.slice(0, numContacts - nextNContacts.length));
                }

                return nextNContacts;
            }
        }

        if(nextNContacts === undefined){
            throw new Error("No contacts were found having birthday in the future.")
        }
    }

    static getNextAgeForContact(contact){
        let bdayYear = this.getBirthdayYear(contact);
        let yearsBetween;

        if (bdayYear <= 1) {
            yearsBetween = 0;
        } else {
            yearsBetween = this.getYearsBetween(bdayYear);
        }

        return yearsBetween;
    }

    static getYearsBetween(bdayYear) {
        return new Date().getFullYear() - bdayYear;
    }

    static getBirthdayYear(contact) {
        const bday = contact.birthday;
        if (!bday) {
            return null;
        }

        const bDate = new Date(bday);

        return bDate.getFullYear();
    }

    static getDaysUntilContactsBirthday(contact) {
        const today = new Date();
        let [day, month] = this.getDayAndMonth(contact);
        let bday = this.getNextBday(day, month);
        let daysBetween = this.getDaysBetween(bday, today);
        return daysBetween;
    }

    static getDayAndMonth(contact) {
        const bday = contact.birthday;
        if (!bday) {
            return null;
        }

        const bDate = new Date(bday);

        return [bDate.getDate(), bDate.getMonth()];
    }

    static getNextBday(day, month) {
        const today = new Date();
        const date = new Date();

        date.setDate(day);
        date.setMonth(month);
        const year = (date.getTime() < today.getTime() ? today.getFullYear() + 1 : today.getFullYear())
        date.setYear(year);

        return date;
    }

    static getDaysBetween(dateA, dateB) {
        var difference = dateA.getTime() - dateB.getTime();
        // og(dateA, dateB)
        return Math.floor(difference / (1000 * 3600 * 24));
    }
}