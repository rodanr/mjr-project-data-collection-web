//imports
const express = require("express");
const dotenv = require("dotenv");
const assert = require("assert");
//for unique name generation
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");
const WebSocket = require("ws");
//initialization
dotenv.config();
const app = express();
const thanksRouter = require("./routes/thanks");
const { log } = require("console");
const hostname = "127.1.0.0";
var sentenceToDisplay;

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/static"));
app.use("/thanks", thanksRouter);
app.use(express.urlencoded({ extended: false }));
let fileName;
function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function fetchSentence() {
  let sentenceId = randomIntFromInterval(0, 10109);
  let mySentence;
  fs.readFile("data.json", (err, data) => {
    if (err) throw err;
    let jsonData = JSON.parse(data);
    sentenceToDisplay = jsonData[sentenceId]["sentences"];
  });
}
fetchSentence();
//creating global fileName variable to use the value while saving to the cloud storage
function generateFileName() {
  fileName = uuidv4();
}
app.get("/", async function (req, res) {
  generateFileName();
  fetchSentence();
  res.render("index", {
    filename: fileName,
    sentence: sentenceToDisplay,
  });
});

//Receiving the audio data
const wss = new WebSocket.Server({ port: process.env.port });
wss.on("connection", (ws, req) => {
  ws.on("message", (message) => {
    fs.writeFile(
      `uploads/${fileName}.wav`,
      Buffer.from(new Uint8Array(message), function (err) {
        if (err) throw err;
        console.log("Upload success");
      })
    ).then(() => {
      //triggers onmessage in client side sending event.data as "uploaded" string
      ws.send("uploaded");
    });
  });
});

app.listen(process.env.port, hostname, () => {
  console.log(`Server running at http://${hostname}:${process.env.port}/`);
});
