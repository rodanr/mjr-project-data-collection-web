//imports
const express = require('express');
const dotenv = require('dotenv');
const assert = require('assert');
const { MongoClient } = require('mongodb');
//for unique name generation
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const WebSocket = require('ws');
const os = require('os');
const crypto = require('crypto');

// for google drive uploads
const { google } = require('googleapis');
const path = require('path');
const fsa = require('fs');

const CLIENT_ID =
  '425991307248-p93kkhatt8qgk7qqj4chh83prolcn7af.apps.googleusercontent.com';
const CLIENT_SECRET = 'gs71h1y506xfuItD4YoRsUWg';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground/';

const REFRESH_TOKEN =
  '1//04yv1C5kNFVG6CgYIARAAGAQSNwF-L9IrscrFqPPN5BnEd4ZeaSmPJYqIJLirA8hJ9hPOy7NIB_lKbElh0TZtsR2CSpiu6Mt4M2c';

//initialization
dotenv.config();
const app = express();
const thanksRouter = require('./routes/thanks');
const welcomeRouter = require('./routes/welcome');
const { log } = require('console');
const hostname = '127.1.0.0';
var sentenceId;
var jsonData, gender, mac;

app.set('view engine', 'ejs');
app.use((req, res, next) => {
  // Giving user an Id
  let values = os.networkInterfaces();
  if ('Ethernet' in values) {
    mac = values['Ethernet'][0]['mac'];
  } else if ('WiFi' in values) {
    mac = values['WiFi'][0]['mac'];
  } else {
    mac = Date.now() + Math.random();
  }
  mac = crypto.createHash('sha256').update(mac).digest('base64');
  next();
});
app.use(express.static(__dirname + '/static'));
app.use('/thanks', thanksRouter);
app.use('/', welcomeRouter);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let fileName;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

async function uploadFile(name) {
  const dirPath = path.join(__dirname, 'uploads');
  try {
    const filePath = path.join(dirPath, name);
    const response = await drive.files.create({
      requestBody: {
        name: name,
        mimeType: 'audio/wav',
        parents: ['1u6_4EijMdM8OZBFrcjNSQE9SqNgDP-e3'],
      },
      media: {
        mimeType: 'audio/wav',
        body: fsa.createReadStream(filePath),
      },
    });
    console.log(response.data);
  } catch (error) {
    console.log(error.message);
  }

  fs.emptyDir(dirPath, () => {
    console.log('Dir is now empty');
  });
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
async function fetchJSON() {
  //reading data from data.json
  data = fs.readFileSync('data.json', 'utf-8');
  return JSON.parse(data);
}
//data is passed to jsonData variable after promise is resolved from fetchJSON
fetchJSON().then((data) => {
  jsonData = data;
});
function getSentence() {
  sentenceId = randomIntFromInterval(0, 10109);
  return jsonData[sentenceId]['sentences'];
}
const uploadDocs = function (db, callback) {
  // Get the documents collection
  const collection = db.collection('data_collection');
  // Insert some documents
  var object = {
    userId: mac,
    sentenceId: sentenceId,
    fileName: fileName,
    gender: gender,
  };
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

app.post('/collect', function (req, res) {
  generateFileName();
  gender = req.body.gender;
  res.render('index', {
    filename: fileName,
    sentence: getSentence(),
  });
});

//Receiving the audio data
const wss = new WebSocket.Server({ port: process.env.port });
wss.on('connection', (ws, req) => {
  ws.on('message', (message) => {
    fs.writeFile(
      `uploads/${fileName}.wav`,
      Buffer.from(new Uint8Array(message), function (err) {
        if (err) throw err;
        console.log('Upload success');
      })
    ).then(() => {
      uploadFile(`${fileName}.wav`);
      uploadToCollection();
      //triggers onmessage in client side sending event.data as "uploaded" string
      ws.send('uploaded');
    });
  });
});

app.listen(process.env.port, hostname, () => {
  console.log(`Server running at http://${hostname}:${process.env.port}/`);
});
