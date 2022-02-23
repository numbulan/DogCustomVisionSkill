const util = require('util');
const fs = require('fs');
const TrainingApi = require("@azure/cognitiveservices-customvision-training");
const PredictionApi = require("@azure/cognitiveservices-customvision-prediction");
const msRest = require("@azure/ms-rest-js");
const dotenv = require('dotenv');
const path = require('path');
const { count } = require('console');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });


const trainingKey = process.env.trainingKey;
const trainingEndpoint = process.env.trainingEndpoint;
const projectNumber = process.env.projectNumber;

const credentials = new msRest.ApiKeyCredentials({ inHeader: { "Training-key": trainingKey } });
const trainer = new TrainingApi.TrainingAPIClient(credentials, trainingEndpoint);

let counter = 0;

(async () => {
    const sampleProject = await trainer.getProject(projectNumber)


    let folders = [];
    //Loop through the files for the tags
    let folder = fs.readdirSync("./images");
    let size = fs.readdirSync("./images").length;
    for ( let i = 0; i < size; i++){
        splitName(folder[i])
        sleep(1000);
        console.log(i);
    }

    async function splitName(name){
        let tag = name.split("-");
        tag = tag[1];
        folders.push(tag);
        tagName = tag.replaceAll("_", " ");
        tagObject = await trainer.createTag(sampleProject.id, `${tagName}`);
        global[tag+"Dir"] = `./images/${name}`;
        global[tag+"Files"] = fs.readdirSync(`./images/${name}`);
        await sendPictures(name, tagObject);
        return;
    }

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
            return fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`./images/${name}/${file}`), {tagIds: [tagObject.id]}));  
        })
        await Promise.all(fileUploadPromises);
        console.log("end");
    }

    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
      }
   /*
    fs.readdirSync("./images").forEach(name => splitName(name));
    const sampleDataRoot = "./images";

    async function splitName(name){
        let tag = name.split("-");
        tag = tag[1];
        folders.push(tag);
        tagName = tag.replaceAll("_", " ");
        //let tagObject = await trainer.createTag(sampleProject.id, `${tagName}`);
        let tagObject = setTimeout(() =>{createTag(tagName)}, 1000);
        global[tag+"Dir"] = `./images/${name}`;
        global[tag+"Files"] = fs.readdirSync(`./images/${name}`);
        await sendPictures(name, tagObject);
        return;
    }
    
    async function sendPictures(name, tagObject){
        counter +=1;
        console.log("Adding images..." + counter);
        let fileUploadPromises = [];
        fs.readdirSync(`./images/${name}`).forEach(file =>{
            return setTimeout(() =>{fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`./images/${name}/${file}`), {tagIds: [tagObject.id]}))}, 1000);  
        })
        await Promise.all(fileUploadPromises);
        console.log("end");
    }

    async function createTag(tagName){
       return tagObject = await trainer.createTag(sampleProject.id, `${tagName}`);
    }
    */
})()