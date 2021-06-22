//imports
const express = require("express");
const dotenv = require("dotenv");
const assert = require("assert");
const { MongoClient } = require("mongodb");
//for unique name generation
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");
const WebSocket = require("ws");

//initialization
dotenv.config();
const app = express();
const thanksRouter = require("./routes/thanks");
const welcomeRouter = require("./routes/welcome");
const { log } = require("console");
const hostname = "127.1.0.0";
var sentenceId;
var jsonData;

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/static"));
app.use("/thanks", thanksRouter);
app.use("/", welcomeRouter);
app.use(express.urlencoded({ extended: false }));
let fileName;
function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
async function fetchJSON() {
  //reading data from data.json
  data = fs.readFileSync("data.json", "utf-8");
  return JSON.parse(data);
}
//data is passed to jsonData variable after promise is resolved from fetchJSON
fetchJSON().then((data) => {
  jsonData = data;
});
function getSentence() {
  sentenceId = randomIntFromInterval(0, 10109);
  return jsonData[sentenceId]["sentences"];
}
const uploadDocs = function (db, callback) {
  // Get the documents collection
  const collection = db.collection("data_collection");
  // Insert some documents
  var object = { _id: sentenceId, sentenceId: sentenceId, fileName: fileName };
  collection.insertOne(object, function (err, result) {
    if (err) throw err;
  });
};
async function uploadToCollection() {
  MongoClient.connect(
    process.env.uri,
    { useUnifiedTopology: true },
    function (err, client) {
      assert.equal(null, err);
      // console.log("Connected correctly to server");
      const db = client.db(process.env.dbName);
      uploadDocs(db, function () {
        client.close();
      });
    }
  );
}
//creating global fileName variable to use the value while saving to the cloud storage
function generateFileName() {
  fileName = uuidv4();
}
app.get("/collect", async function (req, res) {
  generateFileName();
  res.render("index", {
    filename: fileName,
    sentence: getSentence(),
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
      uploadToCollection();
      //triggers onmessage in client side sending event.data as "uploaded" string
      ws.send("uploaded");
    });
  });
});

app.listen(process.env.port, hostname, () => {
  console.log(`Server running at http://${hostname}:${process.env.port}/`);
});
