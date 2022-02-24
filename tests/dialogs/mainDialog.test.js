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

})

