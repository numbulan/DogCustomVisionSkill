const { ActivityTypes, EndOfConversationCodes, ConsoleTranscriptLogger, MessageFactory, UserState, MemoryStorage } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, WaterfallStepContext } = require('botbuilder-dialogs');
const { HandlePictureDialog, HANDLE_PICTURE_DIALOG } = require('../../dialogs/handlePictureDialog');
const assert = require('assert');
const { DialogTestClient } = require('botbuilder-testing');

describe('handlePictureDialog', () =>{
    it('Attachments', async()=>{
    const testDialog = new HandlePictureDialog(HANDLE_PICTURE_DIALOG);
    const client = new DialogTestClient('test', testDialog);
    const message ={
        "attachments": [{
          "content": {
            "downloadUrl" : "https://tobomed2.blob.core.windows.net/images/n02106662_104.jpg",
            "fileType": "jpg"
          }
        }]
      }
    let reply = await client.sendActivity(message);
    assert.strictEqual(reply.text, 'I will analyse your picture...');
    reply = client.getNextReply();
    assert.strictEqual(reply.text, 'german shepherd with an 99.89% probability' );
    })
})