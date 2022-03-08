class Person{
    constructor(familyName, givenName, birthday){
        this.familyName = familyName;
        this.givenName = givenName;
        this.birthday = birthday;
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