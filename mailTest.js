// 4/2wFDge4O1tSBVjmEmwwitPXFNV7AGq2Tcm9KLPNA2hGECGFJ9LBpqc-jcSfHKpKhazyaidn3kFaqpYeMwc4--G0
//4/2wG6Ewa4vPEg9lhcqqo9cfl6Jt5fkglF6OknTf7oQe7RGFmQUuNgU8Iny8X8QI2y71dDh5yv_9_DOjrGCLQqdAw
// http://localhost/?code=4/2wG6Ewa4vPEg9lhcqqo9cfl6Jt5fkglF6OknTf7oQe7RGFmQUuNgU8Iny8X8QI2y71dDh5yv_9_DOjrGCLQqdAw&scope=https://mail.google.com/

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const gmail = google.gmail('v1');
var mysql = require('mysql');
const { promiseImpl } = require('ejs');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Techugo@123",
  database: "lal10"
});


// If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']; // only gmail reading
const SCOPES = ['https://mail.google.com/'];   // full access to gmail

// const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];  // read,send,update,draft ,delete and send to gmail

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const TOKEN_PATH = 'token.json';

// Load client secrets from a local file."
fs.readFile('credentials.json', (err, content) =>   {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.

  // console.log("content",content)
  // authorize(JSON.parse(content), listLabels);
  authorize(JSON.parse(content), displayInbox);
  // authorize(JSON.parse(content), listMessages);

});


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */


function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}



/**
 * Get the recent email from your Gmail account
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

 function displayInbox(auth) {

  let request = gmail.users.messages.list({auth: auth,
    'userId': 'me',
    'labelIds': 'INBOX',
    // 'maxResults': 1
  }, async function(err, response) {
      if (err) {
          console.log('The API returned an error: ' + err);
          return;
      }

     let result=response['data']['messages'];
     console.log("result===",result)
     let dt= await saveData(result,auth);
     console.log("dt===",dt)

    })
}


async function saveData(result2,auth){

    return new Promise((resolve, reject) => {

  var itemsProcessed = 0;

  result2.forEach((element, i) => {

    gmail.users.messages.get({auth: auth, userId: 'me', 'id': element.id}, function( err, response ) {
      if (err) {
          console.log('The API returned an error: ' + err);
          return;
      }

      itemsProcessed++;

     let header=response['data']['payload']['headers'];
     let headerJson = JSON.stringify(header);
         headerJson = headerJson.replace("'", "");

      let body,body2;
      if(response['data']['payload']['parts']){
        body = new Buffer.from(response['data']['payload']['parts'][0]['body']['data'], 'base64');
        body = body.toString()
        body = body.replace(/'/g,"");
        body = body.replace("'","");

      }else{
        body = new Buffer.from(response['data']['payload']['body']['data'],'base64');
        body=body.toString()
        body = body.replace(/'/g,"");
        body = body.replace("'","");
      }


        let sql=`INSERT INTO email_data (header,body,messageId) SELECT * FROM (SELECT '${headerJson}' as t1 ,'${body}' as t2,'${response['data']['id']}' as t4) AS tmp WHERE NOT EXISTS (SELECT messageId FROM email_data WHERE messageId = '${response['data']['id']}')`;
        console.log("sql===",sql);
          con.query(sql, function (err, result) {

            // if (err) throw err;
            console.log("result===",result);
            console.log(response['data']['id'],result);
          if(itemsProcessed === result2.length) {
            resolve("true");
          }
        });
      });
    })
  })
}
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

async function listMessages(auth) {
  return new Promise((resolve, reject) => {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.messages.list({userId: 'me'},
     (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        if (!res.data.messages) {
          resolve([]);
          return;
        }

        console.log("res.data.message=>>>>>ID",res.data.messages);

        // console.log("res.data.message=>>>>>ThreadId",res.data.messages[0]['threadId']);

        // con.connect(function(err) {
        //   if (err) throw err;
        //   console.log("Connected!");

        //   // let sql = `INSERT INTO email_data (header,body) VALUES ('${saveData}')`;
        //   let sql = `INSERT INTO email_data (header) VALUES ('${res.data.messages}')`;

        //   console.log("sql===",sql);

        //   con.query(sql, function (err, result) {

        //     console.log("result===",result);

        //     if (err) throw err;
        //     console.log(" record inserted");
        //   });
        // });

        resolve(res.data.messages);
      });
  });
};

// /**
//  * Lists the labels in the user's account.
//  *
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */
// async function listLabels(auth) {

//   const gmail = google.gmail({version: 'v1', auth});

//   gmail.users.labels.list({
//     userId: 'me',
//   }, async (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);

//     const labels = res.data.labels;
//     if (labels.length) {

//       console.log('Labels:');
//       labels.forEach((label) => {
//         console.log(`- ${label.name}`);
//       });
//     } else {
//       console.log('No labels found.');
//     }

//   });
// }
