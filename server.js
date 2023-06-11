const express = require("express");
const app = express();
const lib = require("./lib");
app.use(express.json());

app.post("/webhook", async (req, res) => {
  await lib.tryToSendMessage();
  res.sendStatus(200);
});

app.get("/", async (req, res) => {
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
