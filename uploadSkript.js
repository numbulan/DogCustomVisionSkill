const fs = require("fs");
const TrainingApi = require("@azure/cognitiveservices-customvision-training");
const msRest = require("@azure/ms-rest-js");

const trainingKey = process.env.trainingKey;
const trainingEndpoint = process.env.trainingEndpoint;
const projectId = process.env.projectNumber;

const credentials = new msRest.ApiKeyCredentials({
  inHeader: { "Training-key": trainingKey },
});
const trainer = new TrainingApi.TrainingAPIClient(
  credentials,
  trainingEndpoint
);

const sampleDataRoot = "Images";

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function upload(projectId, path, tagId) {
  console.log("upload " + path + " to Tag: " + tagId);
  try {
    let response = await trainer.createImagesFromData(
      projectId,
      fs.readFileSync(path),
      { tagIds: [tagId] }
    );
    console.log(
      "Successful: " + response.isBatchSuccessful,
      "Reason: " + response.images[0].status
    );
  } catch (e) {
    if (e.statusCode === 429) {
      console.log("RETRY");
      await sleep(1000);
      upload(projectId, path, tagId);
    }
  }
}

async function uploadImages() {
  console.log("Start Upload...");
  let tags = await trainer.getTags(projectId);
  const dirs = fs.readdirSync(sampleDataRoot);
  for (const d of dirs) {
    let tagName = d.substring(d.indexOf("-") + 1).replace(/_/g, " ");
    console.log("Start at: " + d + " with tag: " + tagName);
    let tag = tags.filter((t) => t.name === tagName)[0];
    if (!tag) {
      console.log("Creating tag " + tagName);
      tag = await trainer.createTag(projectId, tagName);
      tags.push(tag);
      await sleep(250);
    }
    let imageDir = fs.readdirSync(`${sampleDataRoot}/${d}`);
    for (const f of imageDir) {
      let path = `${sampleDataRoot}/${d}/${f}`;
      upload(projectId, path, tag.id);
      await sleep(250);
    }
  }
  console.log("Finish Upload...");
}

async function training() {
  console.log("Training...");
  let trainingIteration = await trainer.trainProject(projectId);

  // Wait for training to complete
  console.log("Training started...");
  while (trainingIteration.status == "Training") {
    console.log("Training status: " + trainingIteration.status);
    await sleep(1000);
    trainingIteration = await trainer.getIteration(
      projectId,
      trainingIteration.id
    );
  }
  console.log("Training status: " + trainingIteration.status);
}

(async () => {
  console.log("Start Script...");
  await uploadImages();
  //await training();
  console.log("Finish Script...");
})();
