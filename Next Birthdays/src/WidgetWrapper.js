class WidgetWrapper{
    constructor(){

        this.widget = new ListWidget();
        Script.setWidget(this.widget);
        
        const today = new Date()
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.widget.refreshAfterDate = tomorrow;
    }
}