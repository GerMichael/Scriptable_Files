class HtmlRenderer{

    constructor(widget) {
        this.widget = widget;
        this.setBackground();
        this.setForeground();
    }

    setBackground(){
        this.background = `
        background: linear-gradient(180deg, rgba(244,67,54,1) 0%, rgba(183,28,28,1) 100%);
        `;
    }

    setForeground(){
        this.foreground = `
        color: white;
        `;
    }

    async renderData(contacts) {
        let img = await HtmlToImage.htmlToImg(this.getHtmlForContacts(contacts));
        this.widget.backgroundImage = img;
    }

    getHtmlForContacts(contacts){
        return this.escape(`
            <html>
                <head>
                    ${this.getContainerStyle()}
					${this.getContactContainerStyle()}
                </head>
                <body>
                    <h1>Next Birthdays 🎁</h1>
                    <table>
                        ${this.getRowsForContacts(ContactService.getNextNContacts(contacts, 5))}
                    </table>
                </body>
            </html>
        `);
    }

    getRowsForContacts(contacts){
        let html = "";
        for(let contact of contacts){
            html += "<tr>";
            html += `<td>${ContactService.getDaysUntilContactsBirthday(contact)}d</td>
                     <td>(${ContactService.getNextAgeForContact(contact)})</td>
                     <td>${contact.givenName} ${contact.familyName}</td>`;
            html += "</tr>";
        }
        return html;
    }

    async renderNotification(text){
        let img = await HtmlToImage.htmlToImg(this.getHtmlForText(text));
        this.widget.backgroundImage = img;
    }

    getHtmlForText(text){
        return this.escape(`
            <html>
                <head>
                    ${this.getContainerStyle()}
                    ${this.getNotificationStyle()}
                </head>
                <body>
                    <p>${text}</p>
                </body>
            </html>
        `);
    }

    getContactContainerStyle(){
        return `
        <style>
            h1{
                font-size: 10vh;
                font-weight: bold;
                line-height: 10vh;
                margin-bottom: 2vh;
            }
            table {
                width: 100%;
                height: calc(100% - 18vh);
            }
            td{
                padding: 0;
                margin: 0;
                height: 5vh;
                /* border: 1px yellow solid; */
                font-size: 10vh;
                line-height: 5vh;
                box-sizing: border-box;
                overflow: hidden;
            }
            td:nth-child(2){
                font-weight: 200;
            }
            td:nth-child(3){
                white-space: nowrap;
                text-overflow: ellipsis;
                max-width: 50vw;
            }
        </style>
        `;
    }

    getNotificationStyle(){
        return `
        <style>
            p {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 10vh;
                text-align: center;
                box-sizing: border-box;
            }
        </style>
        `;
    }

    getContainerStyle(){

        let bodySize = this.getBodySize(config);

        return `
        <style>
            body {
                margin: 0;
                width: ${bodySize[0]}px;
                height: ${bodySize[1]}px;
                ${this.background}
                ${this.foreground}
                font-family: -apple-system, system-ui, BlinkMacSystemFont, sans-serif;
                box-sizing: border-box;
                padding: 4vh 3vh;
            }
        </style>
        `;
    }

    getBodySize(){
        
        switch (config.widgetFamily) {
            case "small":
                // return [272, 272];
                return [272*2, 272*2];
            case "medium":
                return [600*2, 272*2];
            case "large":
                return [600*2, 600*2];
            case "extraLarge":
                // return [1256, 600]
                return [1256*2, 600*2]
            default:
                return [600, 600];
        }
    }

    escape(str)  {
        return str.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "");
    }
}