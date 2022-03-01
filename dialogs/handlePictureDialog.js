const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const { createContext } = require('vm');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const HANDLE_PICTURE_DIALOG = 'HANDLE_PICTURE_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const Content_Type_Application = "application/json";
const TEXT_ANALYSE_START = 'I will analyse your picture...';
const PROBABILITY = "% probability";
const WITH_AN = " with an ";
const METHODE_FOR_AXIOS = 'post';
const PREDICTION_KEY = process.env.predictionKey;
const PREDICTION_ENDPOINT = process.env.predictionEndpoint;

/*
dialog that hadles a messge that contains a picture and sends it to the custom vision
*/

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
        await stepContext.context.sendActivity(TEXT_ANALYSE_START);
        return await stepContext.next();
    }

    async sendToCustomVisionStep(stepContext) {
        let response = await sendPictureRequestToCustomVision(stepContext.context.activity.attachments[0].content.downloadUrl);
        await stepContext.context.sendActivity(await createResponseTextFromData(response));
        return await stepContext.next();
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }

}

/*
sends the picture to the custom vison and returns the received answer
@param pictureUrl download Url of the picture that will be send to the custom vision
@return response-object from the custom vision 
*/
async function sendPictureRequestToCustomVision(pictureUrl){
    return await axios({
        method: METHODE_FOR_AXIOS,
        url: PREDICTION_ENDPOINT,
        headers: {
            "Prediction-Key": PREDICTION_KEY,
            "Content-Type": Content_Type_Application
        },
        data: {
            Url: pictureUrl
        }
    })
}

/*
receives the response object and creates a response text from it
@param response response-object from the custom vision
@return string with the respons to the user
*/
async function createResponseTextFromData(response){
    const percent= response.data.predictions[0].probability.toFixed(4)*100;
    return response.data.predictions[0].tagName + WITH_AN + percent + PROBABILITY;
}

module.exports.HandlePictureDialog = HandlePictureDialog;
module.exports.HANDLE_PICTURE_DIALOG = HANDLE_PICTURE_DIALOG;