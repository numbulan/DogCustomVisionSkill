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

server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (context) => myBot.run(context));
});