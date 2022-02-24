const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const { createContext } = require('vm');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const HANDLE_PICTURE_DIALOG = 'HANDLE_PICTURE_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const ContentTypeApplication = "application/json";
const textAnalyseStart = 'I will analyse your picture...';
const probability = "% probability";
const with_an = " with an ";
const methodeForAxios = 'post';

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
        await stepContext.context.sendActivity(textAnalyseStart);
        return await stepContext.next();
    }

    async sendToCustomVisionStep(stepContext) {
        let response = await sendPictureRequestToCustomVision(stepContext);
        await createResponseTextFromData(response, stepContext);
        return await stepContext.next();
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }

}

async function sendPictureRequestToCustomVision(stepContext){
    return await axios({
        method: methodeForAxios,
        url: process.env.predictionEndpoint,
        headers: {
            "Prediction-Key": process.env.predictionKey,
            "Content-Type": ContentTypeApplication
        },
        data: {
            Url: stepContext.context.activity.attachments[0].content.downloadUrl
        }
    })
}

async function createResponseTextFromData(response, stepContext){
    const percent= response.data.predictions[0].probability.toFixed(4)*100;
    stepContext.context.sendActivity(response.data.predictions[0].tagName + with_an + percent + probability);
}

module.exports.HandlePictureDialog = HandlePictureDialog;
module.exports.HANDLE_PICTURE_DIALOG = HANDLE_PICTURE_DIALOG;