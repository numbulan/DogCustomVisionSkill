const { ActivityTypes, EndOfConversationCodes, ConsoleTranscriptLogger, MessageFactory } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');

const { HandlePictureDialog, HANDLE_PICTURE_DIALOG } = require('./handlePictureDialog');

const { NoPictureDialog, NO_PICTURE_DIALOG } = require('./noPictureDialog');


const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

/*
starting dialog of the bot. determins to which dialog to send the incoming message
*/
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
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async initialStep(stepContext) {
        if(await checkForAttachment(stepContext.context.activity.attachments)){
            return await stepContext.beginDialog(HANDLE_PICTURE_DIALOG);
        }
        else{
            return await stepContext.beginDialog(NO_PICTURE_DIALOG);
        }

    }

    async finalStep(stepContext) {
        try {
        await stepContext.context.sendActivity({
            type: ActivityTypes.EndOfConversation,
            code: EndOfConversationCodes.CompletedSuccessfully
        });}
        catch(err){
            console.log(err);
        }
        return await stepContext.cancelAllDialogs();
    }

}

/*
checkst if there is an attachment, that is not a text or html file
@param attachments attachments of the messages
@return true or false
*/
async function checkForAttachment (attachmentsOfMessage){
    if (attachmentsOfMessage && attachmentsOfMessage.filter(x => x.contentType != "text/html").length > 0) {
        return true;
    } else {
        return false;
    }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;