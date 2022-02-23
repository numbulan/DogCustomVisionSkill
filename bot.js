const { ActivityHandler } = require ('botbuilder');

class DogCustomVisionBot extends ActivityHandler {
    constructor ( conversationState, userState, dialog){
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');

            await this.dialog.run(context, this.dialogState);
            console.log("you there")
            await next();
        });

        this.onEndOfConversation(async (context, next) => {

            await next();
        });
    }

    async run(context) {
        await super.run(context);

        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.DogCustomVisionBot = DogCustomVisionBot;