import fs from "fs";
import juice from "juice";
import { fileURLToPath } from "url";
import path from "path";

const __fileName = fileURLToPath(import.meta.url)
const __dirName = path.dirname(__fileName)

const css = fs.readFileSync(path.join(__dirName, "../output.css"), "utf-8");

export const getWelcomeEmail = (affiliateLink, uniqueCode, associate) => {
  const date = new Date().getFullYear();
  const rawHtml = ` <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body class="bg-gray-50 font-sans">
    <div class="max-w-2xl mx-auto p-5">
      <div class="bg-black text-white p-8 text-center rounded-t-xl">
        <h1 class="text-3xl font-bold m-0">Account Activated</h1>
        <p class="mt-2 mb-0 opacity-90">Welcome to Gauge Affiliate Program</p>
      </div>

      <div class="bg-gray-50 p-8 rounded-b-xl">
        <p class="mb-4">Hi <strong>${associate.fullName}</strong>,</p>

        <p class="mb-6">
          Congratulations. Your email has been verified and your account is now
          <strong class="text-green-600">ACTIVE</strong>.
        </p>

        <div
          class="bg-black border-2 border-dashed p-6 my-6 rounded-lg text-center"
        >
          <p class="text-sm text-gray-500 mb-3 uppercase tracking-wide">
            Your Unique Referral Code is:
          </p>
          <span class="text-2xl font-bold text-white tracking-wider"
            >${uniqueCode}</span
          >
        </div>

        <div class="p-4 my-6 rounded-lg break-all">
          <p class="mb-2 m-0"><strong> Your Affiliate Link:</strong></p>
          <a
            href="${affiliateLink}"
            class="underline text-sm break-all text-indigo-600"
            >${affiliateLink}</a
          >
        </div>

        <hr class="border-0 border-t border-gray-200 my-8" />
        <div class="text-sm text-gray-500 space-y-2 mb-2">
          <p>
            Need help? Contact us at
            <a href="mailto:support@gaugesolution.com" class="text-indigo-600"
              >support@gaugesolution.com</a
            >
          </p>
          <p class="text-center">&copy; ${date} All rights reserved</p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

  return juice.inlineContent(rawHtml, css);
};
