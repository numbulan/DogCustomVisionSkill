/*
starting script of the application, that creates the necessary ressources
*/

const dotenv = require('dotenv');
const path = require('path');
const restify = require('restify');

const {
    ActivityTypes,
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration,
    InputHints,
    ConversationState,
    MemoryStorage,
    UserState
} = require('botbuilder');

const {
    allowedCallersClaimsValidator,
    AuthenticationConfiguration,
    AuthenticationConstants
} = require('botframework-connector');

const { MainDialog } = require('./dialogs/mainDialog');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const { DogCustomVisionBot } = require('./bot');

const SKILLERROR = 'The skill encountered an error or bug.';
const INFORMPROVIDER = 'Please inform your bot provider of your error';


const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT ||39783, () => {
    console.log (`\n${server.name} listening to ${server.url}`);
});

server.get('/manifest/*', restify.plugins.serveStatic({ directory: './manifest', appendRequestPath: false }));

const allowedCallers = (process.env.AllowedCallers || '').split(',').filter((val) => val) || [];

const claimsValidators = allowedCallersClaimsValidator(allowedCallers);

let validTokenIssuers = [];
const { MicrosoftAppTenantId } = process.env;

if (MicrosoftAppTenantId){
    validTokenIssuers = [
        `${AuthenticationConstants.ValidTokenIssuerUrlTemplateV1}${MicrosoftAppTenantId}/`,
        `${AuthenticationConstants.ValidTokenIssuerUrlTemplateV2}${MicrosoftAppTenantId}/v2.0/`,
        `${AuthenticationConstants.ValidGovernmentTokenIssuerUrlTemplateV1}${MicrosoftAppTenantId}/`,
        `${AuthenticationConstants.ValidGovernmentTokenIssuerUrlTemplateV2}${MicrosoftAppTenantId}/v2.0/`
    ];
}

const authConfig = new AuthenticationConfiguration([], claimsValidators, validTokenIssuers);

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppType: process.env.MicrosoftAppType,
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory, authConfig);

const adapter = new CloudAdapter(botFrameworkAuthentication);

const memoryStorage = new MemoryStorage();

const userState = new UserState(memoryStorage);
const conversationalState = new ConversationState(memoryStorage);

const dialog = new MainDialog(userState);

const myBot = new DogCustomVisionBot(conversationalState, userState, dialog);

// writes errors to consol log
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);

    await sendErrorMessage(context, error);
    await sendEoCToParent(context, error);
};

async function sendErrorMessage(context, error) {
    try {
        let onTurnErrorMessage = SKILLERROR;
        await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);

        onTurnErrorMessage = INFORMPROVIDER;
        await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
        await context.sendTraceActivity('OnTurnError Trace', error.toString(), 'https://www.botframework.com/schemas/error', 'TurnError');
    } catch (err) {
        console.error(`\n [onTurnError] Exception caught in sendErrorMessage: ${err}`);
    }
}


async function sendEoCToParent(context, error) {
    try {
        const endOfConversation = {
            type: ActivityTypes.EndOfConversation,
            code: 'SkillError',
            text: error.toString()
        };
        await context.sendActivity(endOfConversation);
    } catch (err) {
        console.error(`\n [onTurnError] Exception caught in sendEoCToParent: ${err}`);
    }
}
server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (context) => myBot.run(context));
});