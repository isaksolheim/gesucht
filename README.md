# 🤖 Gesucht Bot

`gesucht` is a bot that automatically sends personalized, context-aware messages to new listings posted on wg-gesucht.de using ChatGPT.

## A Quick Note

This project was born from my curiosity, after I saw an opportunity to automate the repetitive task of messaging housing listings. I urge its use for personal, non-commercial purposes only. While automation _might_ make things a tad bit easier, the underlying housing concerns persist.

## Features 

- **Email Monitoring**: Uses a webhook from Google Cloud Pub/Sub to monitor a Gmail inbox for alerts from wg-gesucht.de
- **Link Detection**: Efficiently parses incoming emails to identify wg-gesucht.de links
- **Automated Web Interaction**: Utilizes Playwright to automate tasks like sign-ins and messaging on wg-gesucht.de
- **Personalized Messaging**: Generates unique messages using ChatGPT 3.5 Turbo
- **Docker Support**: The bot can be dockerized easy deployment

## Dependencies

- **@google-cloud/local-auth**: For authentication purposes
- **axios**: Handles HTTP requests
- **dotenv**: Used to manage environment variables
- **express**: Provides web framework capabilities
- **googleapis**: Connects with Google Cloud services
- **openai**: OpenAI SDK to generate messages
- **playwright**: Enables web automation tasks

## Getting Started

### Prerequisites

- Node.js
- `pnpm` for package management
- A wg-gesucht.de account with email alerts configured
- Gmail account receiving email alerts from wg-gesucht.de
- Google Cloud Pub/Sub service set up (refer to this [guide](https://livefiredev.com/step-by-step-gmail-api-webhook-to-monitor-emails-node-js/) for a step-by-step walkthrough)

### Setup

1. **Obtain Google Cloud Credentials**:
   Navigate to the Google Cloud credentials page and retrieve your `credentials.json` file. Place this file in the root of the project.

2. **Install Dependencies**:
    ```bash
    pnpm install
    ```

3. **Configure Environment Variables**:
   Set up a `.env` file in the root of the project with the following structure:

```
EMAIL=your_wg_email
PASSWORD=your_wg_password
API_KEY=your_openai_api_key
TOPIC_NAME=your_google_cloud_pub_sub_topic_name
STARTER_TEXT=Hello! I'm Nimrodel, an elf currently living in Prifddinas. Fishing by the moonlit ponds is my favorite pastime. I cherish the company of squirrels and often share my catch with them.
```

`STARTER_TEXT` is a customizable text template that the bot will use as a base when generating personalized messages for listings using the OpenAI API.

4. **Authenticate with Google Cloud**:
Before running the bot, execute `node auth.js` to generate a `token.json` file for Google Cloud authentication. You'll need to repeat this step approximately every 7 days, by deleting the existing `token.json` file and running `node auth.js` again.

### Running the Bot

Start the bot with:

```bash
node index.js
```
Once the bot is running, you'll need to provide a push endpoint to the Pub/Sub service in Google Cloud. I use [ngrok](https://ngrok.com/docs) to expose the bot running locally.


## Author

👤 [@isaksolheim](https://github.com/isaksolheim)

