const util = require('util');
const fs = require('fs');
const TrainingApi = require("@azure/cognitiveservices-customvision-training");
const msRest = require("@azure/ms-rest-js");
const dotenv = require('dotenv');
const path = require('path');
const { count } = require('console');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });


const TRAINING_KEY = process.env.trainingKey;
const TRAINING_ENDPOINT = process.env.trainingEndpoint;
const PROJECT_NUMBER = process.env.projectNumber;

const CREDENTIALS = new msRest.ApiKeyCredentials({ inHeader: { "Training-key": TRAINING_KEY } });
const TRAINER = new TrainingApi.TrainingAPIClient(CREDENTIALS, TRAINING_ENDPOINT);

let counter = 0;

(async () => {
    const sampleProject = await TRAINER.getProject(PROJECT_NUMBER)


    let folders = [];
    //Loop through the files for the tags
    let folder = fs.readdirSync("./images");
    let size = fs.readdirSync("./images").length;
    for ( let i = 0; i < size; i++){
        splitName(folder[i])
        sleep(1000);
        console.log(i);
    }

    /*
    splits the name of the folder, so that it can be used to create a tag and creats the tag
    @param name name of the folder to be used
    */
    async function splitName(name){
        let tag = name.split("-");
        tag = tag[1];
        folders.push(tag);
        tagName = tag.replaceAll("_", " ");
        tagObject = await TRAINER.createTag(sampleProject.id, `${tagName}`);
        global[tag+"Dir"] = `./images/${name}`;
        global[tag+"Files"] = fs.readdirSync(`./images/${name}`);
        await sendPictures(name, tagObject);
        return;
    }

    /*
    sends all picture from a folder to the custom visoin and gives them a tag
    @param name name of the folder
    @param tagObject tagObject from the custom vision
    */
    async function sendPictures(name, tagObject){
        counter +=1;
        console.log("Adding images... " +counter);
        let fileUploadPromises = [];
        let fileCounter=0;
        fs.readdirSync(`./images/${name}`).forEach(file =>{
            fileCounter+=1;
            if(fileCounter % 5 === 0){
                sleep(1000);
            }
            console.log("File-Counter: "+ fileCounter);
            return fileUploadPromises.push(TRAINER.createImagesFromData(sampleProject.id, fs.readFileSync(`./images/${name}/${file}`), {tagIds: [tagObject.id]}));
        })
        console.log("end of file "+ name)
        await Promise.all(fileUploadPromises);
        console.log("end");
    }

    /*
    lets the programm wait for a variable amount of time
    @param milliseconds determines the amount of time the programm waits
    */
    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }
})()