const util = require("util");
const fs = require("fs");
const TrainingApi = require("@azure/cognitiveservices-customvision-training");
const msRest = require("@azure/ms-rest-js");
const dotenv = require("dotenv");
const path = require("path");
const { count } = require("console");
const throttledQueue = require("throttled-queue");

const ENV_FILE = path.join(__dirname, ".env");
dotenv.config({ path: ENV_FILE });

const TRAINING_KEY = "8a5ab94436364051ad63c9dd6d8afe40";
const TRAINING_ENDPOINT =
  "https://customvisiondogbreed.cognitiveservices.azure.com/";
const PROJECT_NUMBER = "8e1119b4-96d9-4676-9814-cc71b4b26aa7";

const CREDENTIALS = new msRest.ApiKeyCredentials({
  inHeader: { "Training-key": TRAINING_KEY },
});
const TRAINER = new TrainingApi.TrainingAPIClient(
  CREDENTIALS,
  TRAINING_ENDPOINT
);

const throttle = throttledQueue(5, 1000);
let counter = 0;

let folders = [];
let folder = fs.readdirSync("./images");
let size = fs.readdirSync("./images").length;
let tagObjectArrey = [];

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

async function sendImage(image) {
  await image;
  console.log("picture upload...");
}

/* async function waiting(fileUploadPromises) {
  throttle(() => {
    Promise.all(fileUploadPromises);
  });
} */
async function upload(sampleProject) {
  for (let i = 0; i < size; i++) {
    await splitName(folder[i], sampleProject);
    console.log("Tag: " + i);
    sleep(500);
  }
  for (let i = 0; i < tagObjectArrey.length; i++) {
    await sendPictures(folder[i], tagObjectArrey[i], sampleProject);
  }
}

async function splitName(name, sampleProject) {
  let tag = name.split("-");
  tag = tag[1];
  folders.push(tag);
  tagName = tag.replaceAll("_", " ");
  tagObject = await TRAINER.createTag(sampleProject.id, `${tagName}`);
  tagObjectArrey.push(tagObject);
  global[tag + "Dir"] = `./images/${name}`;
  global[tag + "Files"] = fs.readdirSync(`./images/${name}`);
  return;
}

async function sendPictures(name, tagObject, sampleProject) {
  counter += 1;
  console.log("Adding images... " + counter);
  //let fileUploadPromises = [];
  fs.readdirSync(`./images/${name}`).forEach((file) => {
    sendImage(
      TRAINER.createImagesFromData(
        sampleProject.id,
        fs.readFileSync(`./images/${name}/${file}`),
        { tagIds: [tagObject.id] }
      )
    );
    /*     console.log("filesize before: " + fileUploadPromises.length);
    waiting(fileUploadPromises);
    console.log("filesize after: " + fileUploadPromises.length);
    fileUploadPromises = []; */
  });
  console.log("end of file " + name);

  /*   for (let i = 0; i < fileUploadPromises.length; i++) {
    await Promise.resolve(fileUploadPromises[i]);
    console.log("Picture: " + i);
    sleep(1000);
  } */
}
(async () => {
  const sampleProject = await TRAINER.getProject(PROJECT_NUMBER);
  upload(sampleProject);
})();
