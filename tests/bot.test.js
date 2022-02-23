const { TestAdapter, ActivityTypes, TurnContext, ConversationState, MemoryStorage, UserState } = require('botbuilder');
const { DialogSet, DialogTurnStatus, Dialog } = require('botbuilder-dialogs');
const { DogCustomVisionBot } = require('../bot');
const assert = require('assert');