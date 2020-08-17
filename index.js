/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
//getLabels.js
'use strict';

const fs = require('fs');
const {promisify} = require('util');
const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');
const gmail = google.gmail('v1');

// Promisify with promise
const readFileAsync = promisify(fs.readFile);
const gmailListLabesAsync = promisify(gmail.users.labels.list); 
// Gmail label list
const TOKEN_DIR = __dirname;
const TOKEN_PATH = TOKEN_DIR + '/token.json'; // Specify the access token file

const main = async () => {
    // Get credential information
  const content = await readFileAsync('credentials.json'); 

  console.log("content==",content)
  
// specify the client secret file
  const credentials = JSON.parse(content); // credential

    // authentication
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
    const token = await readFileAsync(TOKEN_PATH);
    oauth2Client.credentials = JSON.parse(token);

    // Access the gmail via API
    const response = await gmailListLabesAsync({
        auth: oauth2Client,
        userId: 'me',
    });
    // display the result
    console.log(response.data);
};

main();