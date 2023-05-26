const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { google } = require("googleapis");
const { chromium } = require("playwright");
const { Configuration, OpenAIApi } = require("openai");
const starterText = require("./prompt");

require("dotenv").config();

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const listingId = process.env.LISTING_ID ? process.env.LISTING_ID : "0";
const email = process.env.EMAIL ? process.env.EMAIL : "example@mail.com";
const password = process.env.PASSWORD ? process.env.PASSWORD : "password123";

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

async function performPlaywrightMessage(link) {
  console.log(`💃 Visiting ${link}`);
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(link);

  if (await page.isVisible("text='Accept all'")) {
    await page.getByRole("button", { name: "Accept all" }).click();
  }

  const listingText = await page
    .locator("div#ad_description_text")
    .allTextContents();

  const listingString = JSON.stringify(listingText);

  console.log("🎇Generating ChatGPT reponse...");
  const gptResponse = await GPT35Turbo(listingString);
  console.log("🎇Done!");

  console.log(gptResponse);

  /*
  await page
    .locator("#rhs_column")
    .getByRole("link", { name: "Send Message" })
    .click();

  if (await page.isVisible("text='Please sign in here.'")) {
    await page.getByRole("link", { name: "Please sign in here." }).click();
    await page.locator("#login_email_username").click();
    await page.locator("#login_email_username").fill(email);
    await page.locator("#login_basic #login_password").click();
    await page.locator("#login_basic #login_password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();
  }

  await page
    .getByRole("button", { name: "Yes, I have read the Security Advice" })
    .click();

  await page
    .getByPlaceholder(
      "Write your message with a personal touch and detailed information and refer to the Ad description. You can mention your availability to visit the flat and additional contact information such as your mobile phone number, where appropriate."
    )
    .click();
  await page
    .getByPlaceholder(
      "Write your message with a personal touch and detailed information and refer to the Ad description. You can mention your availability to visit the flat and additional contact information such as your mobile phone number, where appropriate."
    )
    .fill(gptResponse);
  await page.getByRole("button", { name: "󰏢 Attachment" }).click();
  await page.locator("#file_storage_wrapper").getByRole("img").first().click();
  await page.locator("#file_storage_wrapper").getByRole("img").nth(2).click();
  await page.locator("#file_storage_wrapper").getByRole("img").nth(3).click();
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Send message" }).click();

  */
  await browser.close();

  console.log("🍏 Message successfully sent!");
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

function getLatestMessageId(entries) {
  const latestMessage = entries.reduce((acc, obj) => {
    if (obj.id > acc.id) {
      return obj;
    }
    return acc;
  });

  return latestMessage.messages[0].id;
}

function unicodeBase64Decode(text) {
  text = text.replace(/\s+/g, "").replace(/\-/g, "+").replace(/\_/g, "/");
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(text), function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

function logCompleteJsonObject(jsonObject) {
  const base = jsonObject.payload.parts.filter(
    (part) => part.mimeType === "text/plain"
  )[0].body.data;

  const decodedText = unicodeBase64Decode(base);

  const regex = /VIEW OFFER <(https[^>]+)>/;
  const match = decodedText.match(regex);

  if (match && match.length >= 2) {
    const link = match[1];
    performPlaywrightMessage(link);
  } else {
    console.log("No link found.");
  }
}

async function parseHistoryResponse(jsonObject) {
  let cred = await loadSavedCredentialsIfExist();
  const entries = jsonObject.history.filter((entry) => entry.messagesAdded);
  const messageId = getLatestMessageId(entries);
  await getMessage(cred, messageId);
}

async function getMessage(auth, messageId) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });
  logCompleteJsonObject(res.data);
}

async function getHistory(auth, historyId) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.history.list({
    userId: "me",
    startHistoryId: historyId,
  });
  parseHistoryResponse(res.data);
}

async function tryToSendMessage() {
  let cred = await loadSavedCredentialsIfExist();
  let historyId = 1;
  await getHistory(cred, historyId);
}

let GPT35Turbo = async (listingText) => {
  const prompt = `
    Add 1-3 sentences to the following text: "${starterText}". The new sentences should explain why I would fit the flatshare, listed with the following text: "${listingText}". Add some emojies as well!;
  `;

  const turboMessage = [
    { role: "system", content: `I am applying to a flatshare listing.` },
    { role: "user", content: prompt },
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: turboMessage,
    max_tokens: 1000,
    temperature: 0.8,
  });

  return response.data.choices[0].message.content;
};

module.exports = { tryToSendMessage };