const { ActivityTypes, EndOfConversationCodes, MessageFactory } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');



const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class MainDialog extends ComponentDialog {
    constructor(userState){
        super(MAIN_DIALOG);
        this.userState = userState;
        
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async initialStep(stepContext) {

        if (stepContext.context.activity.attachments && stepContext.context.activity.attachments.filter(x => x.contentType != "text/html").length > 0) {
            await stepContext.context.sendActivity('Attachment');
        } else {
            await stepContext.context.sendActivity('no Attachment');
        }
        return await stepContext.next();
    }

    async finalStep(stepContext) {
        await stepContext.context.sendActivity(MessageFactory.text("Leave Skill"))
        await stepContext.context.sendActivity({
            type: ActivityTypes.EndOfConversation,
            code: EndOfConversationCodes.CompletedSuccessfully
        });
        return await stepContext.cancelAllDialogs();
    }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;