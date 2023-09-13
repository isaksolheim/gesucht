const express = require("express");
const app = express();
const lib = require("./lib");
app.use(express.json());

const PORT = 8080;
const HOST = "0.0.0.0";

app.post("/webhook", async (req, res) => {
  await lib.tryToSendMessage();
  res.sendStatus(200);
});

app.get("/", async (req, res) => {
  res.sendStatus(200);
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
