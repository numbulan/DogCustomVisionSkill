const { ActivityTypes, EndOfConversationCodes, ConsoleTranscriptLogger, MessageFactory } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');

const { HandlePictureDialog, HANDLE_PICTURE_DIALOG } = require('./handlePictureDialog');

const { NoPictureDialog, NO_PICTURE_DIALOG } = require('./noPictureDialog');


const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class MainDialog extends ComponentDialog {
    constructor(userState){
        super(MAIN_DIALOG);
        this.userState = userState;
        
        this.addDialog(new HandlePictureDialog());
        this.addDialog(new NoPictureDialog());
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
        console.log(results);
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async initialStep(stepContext) {
        return checkForAttachment(stepContext);
    }

    async finalStep(stepContext) {
        sendText(stepContext);
        return await stepContext.cancelAllDialogs();
    }

}

async function checkForAttachment (stepContext){
    if (stepContext.context.activity.attachments && stepContext.context.activity.attachments.filter(x => x.contentType != "text/html").length > 0) {
        return await stepContext.beginDialog(HANDLE_PICTURE_DIALOG);
    } else {
        return await stepContext.beginDialog(NO_PICTURE_DIALOG);
    }
}

async function sendText(stepContext){
    await stepContext.context.sendActivity(MessageFactory.text("Leave Skill"));
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;