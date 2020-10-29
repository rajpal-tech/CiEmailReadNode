// getBodyContent.js
/**
 * Get the recent email from your Gmail account
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

'use strict';

const fs = require('fs');
const {promisify} = require('util');
const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');
const gmail = google.gmail('v1');

// Promisify with promise
const readFileAsync = promisify(fs.readFile);
const gmailGetMessagesAsync = promisify(gmail.users.messages.get);
const gmailListMessagesAsync = promisify(gmail.users.messages.list);

// const TOKEN_DIR = __dirname;
const TOKEN_PATH = 'token.json'; // Specify the access token file

const main = async () => {
    // Get credential information  & specify the client secret file
    const content = await readFileAsync('credentials.json');
    const credentials = JSON.parse(content); // credential

    // console.log("credentials",content);

    // authentication
    // const clientSecret = credentials.installed.client_secret;
    // const clientId = credentials.installed.client_id;
    // const redirectUrl = credentials.installed.redirect_uris[0];

    const clientSecret = "7ZhsCPKdyG54NwHD8QCOu0xH";
    const clientId = "175550324366-8e8r7vc3i3u3tjup08iibhhl199thujp.apps.googleusercontent.com";
    const redirectUrl = "urn:ietf:wg:oauth:2.0:oob";

    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
    const token = await readFileAsync(TOKEN_PATH);
    oauth2Client.credentials = JSON.parse(token);

    console.log("oauth2Client",oauth2Client);

// Access the gmail via API
let res = await gmailListMessagesAsync({
        auth: oauth2Client,
        userId: "me",
        maxResults: 1,
       // Only get the recent email - 'maxResults' parameter
      });

      console.log("res====",res["data"])

      // Get the message id which we will need to retreive tha actual message next.
    //   const newestMessageId = res["data"]["messages"][0]["id"];
    //   // Retreive the actual message using the message id
    //   res = await gmailGetMessagesAsync({
    //     auth: oauth2Client,
    //     userId: "me",
    //     id: newestMessageId,
    //   });

    //   console.log("res====",res)

      //Then we will need to decode the base64 encoded message.
        // let body_content = JSON.stringify(res.data.payload.body.data);
        // let data, buff, text;

        //     data = body_content;
        //     buff = new Buffer.from(data, "base64");
        //     mailBody = buff.toString();
        //     // display the result
        //     console.log(mailBody);
};

main();