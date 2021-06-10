const express = require("express");
const app = express();
const thanksRouter = require("./routes/thanks");

const port = 3000;
const hostname = "127.1.0.0";

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/static"));
app.use("/thanks", thanksRouter);
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.render("index");
});

app.listen(process.env.port || 3000, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
