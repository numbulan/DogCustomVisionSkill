const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const axios = require('axios');

const HANDLE_PICTURE_DIALOG = 'HANDLE_ATTACHMENT_DIALOG';

const WATERFALL_DIALOG = 'WATTERFALL_DIALOG';

class HandlePictureDialog extends ComponentDialog {
    constructor() {
        super(HANDLE_PICTURE_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initStep.bind(this),
            this.sendToCustomVisionStep.bind(this),
            this.finalStep.bind(this)
        ]));
        
        this.initialDialogId = WATERFALL_DIALOG;
    }

    async initStep(stepContext) {
        await stepContext.context.sendActivity('handlePictureDialog');
        return await stepContext.next();
    }

    async sendToCustomVisionStep(stepContext) {
//Send to cv
        return await stepContext.next();
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }
}

module.exports.HandlePictureDialog = HandlePictureDialog;
module.exports.HANDLE_PICTURE_DIALOG = HANDLE_PICTURE_DIALOG;