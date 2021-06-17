//imports
const express = require("express");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");
const WebSocket = require("ws");
//initialization
dotenv.config();
const app = express();
const thanksRouter = require("./routes/thanks");
const hostname = "127.1.0.0";

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/static"));
app.use("/thanks", thanksRouter);
app.use(express.urlencoded({ extended: false }));
let fileName;
//creating global fileName variable to use the value while saving to the cloud storage
function generateFileName() {
  fileName = uuidv4();
}
app.get("/", (req, res) => {
  generateFileName();
  res.render("index", { filename: fileName });
});
const wss = new WebSocket.Server({ port: process.env.port });
wss.on("connection", (ws, req) => {
  ws.on("message", (message) => {
    fs.writeFile(
      `uploads/${fileName}.wav`,
      Buffer.from(new Uint8Array(message), function (err) {
        if (err) throw err;
        console.log("Upload success");
      })
    );
  });
});

app.listen(process.env.port, hostname, () => {
  console.log(`Server running at http://${hostname}:${process.env.port}/`);
});
