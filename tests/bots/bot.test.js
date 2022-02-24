const { TestAdapter, ActivityTypes, TurnContext, ConversationState, MemoryStorage, UserState } = require('botbuilder');
const { DialogSet, DialogTurnStatus, Dialog } = require('botbuilder-dialogs');
const { DialogTestClient } = require('botbuilder-testing');
const { DogCustomVisionBot } = require('../../bot');
const assert = require('assert');

class MockRootDialog extends Dialog {
    constructor() {
        super('mockRootDialog');
    }

    async beginDialog(dc, options) {
        await dc.context.sendActivity(`${ this.id } mock invoked`);
        return await dc.endDialog();
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
    
}

describe('DogCustomVisionBot', () => {
    const testAdapter = new TestAdapter();

    async function processActivity(activity, bot) {
        const context = new TurnContext(testAdapter, activity);
        await bot.run(context);
    }

    it('Starts main dialog', async () => {
        const mockRootDialog = new MockRootDialog();
        const memoryStorage = new MemoryStorage();
        const sut = new DogCustomVisionBot(new ConversationState(memoryStorage), new UserState(memoryStorage), mockRootDialog, console);

        // Create conversationUpdate activity
        const conversationUpdateActivity = {
            type: ActivityTypes.ConversationUpdate,
            channelId: 'test',
            conversation: {
                id: 'someId'
            },
            membersAdded: [
                { id: 'theUser' }
            ],
            recipient: { id: 'theBot' }
        };

        // Send the conversation update activity to the bot.
        await processActivity(conversationUpdateActivity, sut);
    });

    it('Send first message', async() => {
        const mockRootDialog = new MockRootDialog();
        const memoryStorage = new MemoryStorage();
        const sut = new DogCustomVisionBot(new ConversationState(memoryStorage), new UserState(memoryStorage), mockRootDialog, console);
        const testClient = new DialogTestClient('msteams', mockRootDialog);

        let reply = await testClient.sendActivity('hi');
        assert.strictEqual(reply.text, 'mockRootDialog mock invoked');
    })
});
