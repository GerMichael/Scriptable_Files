class Person{
    constructor(a, b, c){
        if(b !== undefined){
            this.setPersonFromValues(a, b, c);
        } else {
            this.setPersonFromObject(a);
        }
    }

    setPersonFromValues(familyName, givenName, birthday){
        this.familyName = familyName;
        this.givenName = givenName;
        this.birthday = new Date(birthday);
    }

    setPersonFromObject(contact){
        this.setPersonFromValues(contact.familyName, contact.givenName, new Date(contact.birthday));
    }

    equals(person){
        return person.familyName === this.familyName &&
                person.givenName === this.givenName &&
                person.birthday.getTime() === this.birthday.getTime();
    }

    print(){
        console.log(`${this.givenName} ${this.familyName} (${this.birthday})`);
    }
}