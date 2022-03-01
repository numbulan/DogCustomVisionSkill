const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const NO_PICTURE_DIALOG = 'NO_PICTURE_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const PHRASE = 'No Attachment, please upload an image.';

/*
dialog for the case when no picture was sent to the skill
*/
class NoPictureDialog extends ComponentDialog {
    constructor(){
        super(NO_PICTURE_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initStep.bind(this),
            this.requestPictureStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async initStep(stepContext) {
        return await stepContext.next();
    }

    async requestPictureStep(stepContext){
        await stepContext.context.sendActivity(PHRASE);
        return await stepContext.next();
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }
}

module.exports.NoPictureDialog = NoPictureDialog;
module.exports.NO_PICTURE_DIALOG = NO_PICTURE_DIALOG;