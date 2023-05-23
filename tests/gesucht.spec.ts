import { test } from "@playwright/test";

const listingId = process.env.LISTING_ID ? process.env.LISTING_ID : "0";
const email = process.env.EMAIL ? process.env.EMAIL : "example@mail.com";
const password = process.env.PASSWORD ? process.env.PASSWORD : "password123";

test("send message", async ({ page }) => {
  await page.goto(
    `https://www.wg-gesucht.de/en/${listingId}.html?campaign=suchauftrag_detail`
  );

  if (await page.isVisible("text='Accept all'")) {
    await page.getByRole("button", { name: "Accept all" }).click();
  }

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
    .fill("Hi! I'm interested :)");
  await page.getByRole("button", { name: "󰏢 Attachment" }).click();
  await page.locator("#file_storage_wrapper").getByRole("img").first().click();
  await page.locator("#file_storage_wrapper").getByRole("img").nth(2).click();
  await page.locator("#file_storage_wrapper").getByRole("img").nth(3).click();
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Send message" }).click();
});
