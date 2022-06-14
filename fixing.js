const fs = require("fs");

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

(async () => {
  fs.readdirSync(`./images/n02085620-Chihuahua`).forEach((file) => {
    console.log(file);
    sleep(1000);
  });
})();
