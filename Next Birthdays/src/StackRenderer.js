class StackRenderer {

    constructor(widget) {
        this.widget = widget;
        this.setBackground(widget);
    }

    renderData(contacts) {
        let primaryTextColor = new Color("#efefef");

        let numContacts = this.getNumContacts();
        let [titleSize, textSize] = this.getTextSizes();
        let [vSpacerSize, hSpacerSize] = this.getSpacerSizes();
        let [sWhiteChr, lWhiteChr] = this.getWhiteChars();
        let [dayTherm, todayTherm] = this.getDayTherminology();
        let displAge = this.displayAge();
        let displBday = this.displayBirtdayDate();

        this.addWidgetTitle(widget, "Next Birthdays 🎁", titleSize, primaryTextColor);

        widget.addSpacer(vSpacerSize)
    
        let stack = widget.addStack();

        const contactsToDisplay = ContactService.getNextNContacts(contacts, numContacts);

        this.addDateStack(stack, contactsToDisplay, vSpacerSize, textSize, primaryTextColor,
            sWhiteChr, lWhiteChr, dayTherm, todayTherm);
        stack.addSpacer(hSpacerSize);
        if (displAge) {
            this.addAgeStack(stack, contactsToDisplay, vSpacerSize, textSize, primaryTextColor);
            stack.addSpacer(hSpacerSize);
        }
        this.addNameStack(stack, contactsToDisplay, vSpacerSize, textSize, primaryTextColor);
        if (displBday) {
            stack.addSpacer(2 * hSpacerSize);
            this.addBdayDate(stack, contactsToDisplay, vSpacerSize, textSize, primaryTextColor);
        }
    }

    renderNotification(text) {
        let t = this.widget.addText(text);
    }






    addWidgetTitle(widget, title, titleSize, primaryTextColor) {
        let titleText = widget.addText(title);
        titleText.textColor = primaryTextColor;
        titleText.font = Font.boldSystemFont(titleSize);
    }

    // adds a vertical stack with all remaining dates. the font size 
    // has to match the one of the other stack, see addNameStack()
    addDateStack(stack, contacts, vSpacerSize, textSize,
        primaryTextColor, sWhiteChr, lWhiteChr, dayTherm) {
        let dayStack = stack.addStack();

        dayStack.layoutVertically();

        let longestBdayDiff = ContactService.getDaysUntilContactsBirthday(contacts[contacts.length - 1]);

        let padStartLength = new String(longestBdayDiff).length;

        for (var contact of contacts) {

            let daysBetween = ContactService.getDaysUntilContactsBirthday(contact);

            var daysBetweenAsString = "";

            switch (daysBetween) {
                case 0:
                    //         daysBetweenAsString = sWhiteChr + "🔔" + todayTherm;
                    daysBetweenAsString = todayTherm;
                    daysBetweenAsString = daysBetweenAsString.padStart(padStartLength + 1, lWhiteChr);
                    break;
                default:
                    daysBetweenAsString = daysBetweenAsString + daysBetween;
                    daysBetweenAsString = daysBetweenAsString.padStart(padStartLength, lWhiteChr);
                    daysBetweenAsString = daysBetweenAsString + dayTherm;
            }

            let days = dayStack.addText(daysBetweenAsString)

            days.textColor = primaryTextColor;
            days.font = Font.boldMonospacedSystemFont(textSize);
            days.lineLimit = 1

            dayStack.addSpacer(vSpacerSize)
        }
    }


    addAgeStack(stack, contacts, vSpacerSize, textSize, primaryTextColor) {
        let ageStack = stack.addStack();

        ageStack.layoutVertically();

        for (var contact of contacts) {

            let bdayYear = ContactService.getBirthdayYear(contact);
            let yearsBetween;

            if (bdayYear <= 1) {
                yearsBetween = "--";
            } else {
                yearsBetween = ContactService.getYearsBetween(bdayYear);
            }

            let text = ageStack.addText("(" + yearsBetween + ")")

            text.textColor = primaryTextColor;
            text.font = Font.lightSystemFont(textSize);
            text.lineLimit = 1

            ageStack.addSpacer(vSpacerSize)
        }
    }

    // adds a vertical stack with all names. the font size 
    // has to match the one of the other stack, see addDateStack()
    addNameStack(stack, contacts, vSpacerSize, textSize, primaryTextColor) {
        let nameStack = stack.addStack();

        nameStack.layoutVertically();

        for (var contact of contacts) {
            let text = nameStack.addText(contact.givenName + " " + contact.familyName)

            text.textColor = primaryTextColor;
            text.font = Font.lightSystemFont(textSize);
            text.lineLimit = 1

            nameStack.addSpacer(vSpacerSize)
        }
    }

    addBdayDate(stack, contacts, vSpacerSize, textSize, primaryTextColor) {
        let bdayStack = stack.addStack();

        bdayStack.layoutVertically();

        for (var contact of contacts) {
            let [day, month] = ContactService.getDayAndMonth(contact);
            let text = bdayStack.addText(this.twoDigit(day) + ". " + this.monthText(month))

            text.textColor = primaryTextColor;
            text.font = Font.lightSystemFont(textSize);
            text.lineLimit = 1

            bdayStack.addSpacer(vSpacerSize)
        }
    }


    twoDigit(txt) {
        return new String(txt).padStart(2, "0")
    }

    getDaysUntilContactsBirthday(contact) {
        const today = new Date();
        let [day, month] = ContactService.getDayAndMonth(contact);
        let bday = ContactService.getNextBday(day, month);
        let daysBetween = ContactService.getDaysBetween(bday, today);
        return daysBetween;
    }

    monthText(month) {
        let months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        return month >= 0 && month < months.length ? months[month] : month;
    }

    setBackground(widget){
        let gradient = new LinearGradient();
        gradient.colors = [    
            new Color(`#f44336`),
            new Color(`#b71c1c`)
        ];
        gradient.locations = [0.0, 1];
        widget.backgroundGradient = gradient;
    }







    // gets the number of contacts qccording to widget size
    getNumContacts() {
        switch (config.widgetFamily) {
            case "medium":
                return 4;
            case "small":
                return 6;
            case "extraLarge":
            case "large":
            default:
                return 8;
        }
    }

    // returns the [titleSize, textSize] appropiate to the widget size
    getTextSizes() {
        switch (config.widgetFamily) {
            case "small":
                return [12, 12];
            case "extraLarge":
            case "large":
            case "medium":
            default:
                return [24, 20];
        }
    }

    // returns the [vSpacerSize, hSpacerSize] appropiate to the widget size
    getSpacerSizes() {
        switch (config.widgetFamily) {
            case "small":
                return [4, 2];
            case "medium":
                return [2, 5];
            case "extraLarge":
            case "large":
            default:
                return [10, 5];
        }
    }

    // returns the [sWhiteChr, lWhiteChr] appropiate to the widget size
    // https://en.wikipedia.org/wiki/Whitespace_character
    getWhiteChars() {
        switch (config.widgetFamily) {
            case "small":
                return ["  ", " "]; // 8199 and 8199
            case "extraLarge":
            case "large":
            case "medium":
            default:
                return [" ", "  "]; // 160 and 2x 8199
        }
    }

    // returns the therminolgy for [day, today] with leading space 
    // appropiate to the widget size
    getDayTherminology() {
        switch (config.widgetFamily) {
            case "small":
                return ["d", "🎉"];
            case "extraLarge":
                return [" days", "🔔 today"];
            case "large":
            case "medium":
            default:
                return ["d", "🎉"]; //🎉
        }
    }

    displayAge() {
        switch (config.widgetFamily) {
            case "small":
                return false;
            case "extraLarge":
            case "large":
            case "medium":
            default:
                return true;
        }
    }

    displayBirtdayDate() {
        switch (config.widgetFamily) {
            case "extraLarge":
                return true;
            case "small":
            case "large":
            case "medium":
            default:
                return false;
        }
    }
}