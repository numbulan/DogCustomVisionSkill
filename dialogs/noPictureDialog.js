const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const NO_PICTURE_DIALOG = 'NO_PICTURE_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class NoPictureDialog extends ComponentDialog {
    constructor(){
        super(NO_PICTURE_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async initStep(stepContext) {
        await sendText(stepContext);
        return await stepContext.next();
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }
}

async function sendText(stepContext){
    await stepContext.context.sendActivity('No Attachment, please upload an image.');
}

module.exports.NoPictureDialog = NoPictureDialog;
module.exports.NO_PICTURE_DIALOG = NO_PICTURE_DIALOG;