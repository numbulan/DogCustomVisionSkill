const util = require('util');
const fs = require('fs');
const TrainingApi = require("@azure/cognitiveservices-customvision-training");
const PredictionApi = require("@azure/cognitiveservices-customvision-prediction");
const msRest = require("@azure/ms-rest-js");
const dotenv = require('dotenv');
const path = require('path');

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
    fs.readdirSync("./images").forEach(name => splitName(name));
    const sampleDataRoot = "./images";

    async function splitName(name){
        let tag = name.split("-");
        tag = tag[1];
        folders.push(tag);
        tagName = tag.replaceAll("_", " ");
        let tagId = await trainer.createTag(sampleProject.id, `${tagName}`).id;
        setTimeout(() =>{console.log("wait")}, 1000);
        global[tag+"Dir"] = `./images/${name}`;
        global[tag+"Files"] = fs.readdirSync(`./images/${name}`);
        await sendPictures(name, tagId);
        /*
        await eval('const ' + tag + "Tag" +'= trainer.createTag(sampleProject.id, `${tagName}`)');
        await eval('const ' + tag + "Dir" +'=  route');
        await eval('const ' + tag + "Files" +'= fs.readdirSync(`${tag+"Dir"}`)');*/

        return;
    }
    
    async function sendPictures(name, tagId){
        counter +=1;
        console.log("Adding images..." + counter);
    
        let fileUploadPromises = [];
        fs.readdirSync(`./images/${name}`).forEach(file =>{
            setTimeout(() =>{console.log("wait")}, 1000);
            return  fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`./images/${name}/${file}`), {tagIds: [tagId]}));
        })
        await Promise.all(fileUploadPromises);
        console.log("end");
    }


})()