const { ActivityTypes, EndOfConversationCodes, ConsoleTranscriptLogger, MessageFactory, UserState, MemoryStorage } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, WaterfallStepContext } = require('botbuilder-dialogs');

const { HandlePictureDialog, HANDLE_PICTURE_DIALOG } = require('../../dialogs/handlePictureDialog');

const { NoPictureDialog, NO_PICTURE_DIALOG } = require('../../dialogs/noPictureDialog');
const { MainDialog } = require('../../dialogs/mainDialog');
const fs = require('fs');
const assert = require('assert');
const { DialogTestClient } = require('botbuilder-testing');
const path = require('path');

describe('MainDialog', () =>{
    it('No Attachments', async()=>{
        const mockMemoryStorage = new MemoryStorage();
        const mockUserState = new UserState(mockMemoryStorage);
        const testDialog = new MainDialog(mockUserState);
        const client = new DialogTestClient('test', testDialog);
        const reply = await client.sendActivity('hi');

        assert.strictEqual(reply.text, 'No Attachment, please upload an image.');
    })


    it('Attachments', async()=>{
        const mockMemoryStorage = new MemoryStorage();
        const mockUserState = new UserState(mockMemoryStorage);
        const testDialog = new MainDialog(mockUserState);
        const client = new DialogTestClient('test', testDialog);
        
        function getInlineAttachment(){
            const imageData = fs.readFileSync(path.join(__dirname, '../testdata/testimage.jpg'));
            const base64Image = Buffer.from(imageData).toString('base64');
            return {
                name: 'testimage.jpg',
                contentType: 'image/jpg',
                contentUrl: `data:image/jpg;base64,${ base64Image }`
            };
        }
        let text = { type: ActivityTypes.Message };
        text.attachments = [getInlineAttachment()];
        text.attachments.content.downlaodUrl = path.join(__dirname, '../testdata/testimage.jpg');
        const reply = await client.sendActivity(text)
        assert.strictEqual(reply.text, );
    })
})

