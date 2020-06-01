const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const htmlToText = require('html-to-text');
let utils = require('./utils.js');
utils = new utils();

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';

function Reader() {
  this.readCredentials();
}

Reader.prototype.fillAuth = function(auth) {
  this.gmail = google.gmail({version: 'v1', auth});
}

Reader.prototype.readCredentials = function () {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    this.authorize(JSON.parse(content));
  });
}

Reader.prototype.authorize = function (credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return this.getNewToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token));
    this.fillAuth(oAuth2Client);
  });
}

Reader.prototype.getNewToken = function (oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'online',
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
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      this.fillAuth(oAuth2Client);
    });
  });
}

Reader.prototype.getMail = function(msg){
  this.gmail.users.messages.get({
    'userId': 'me',
    'id': msg.id
  }, (err, res) => {
    if(!err){
      let result = utils.parseMessageHeaders(res.data.payload.headers);
      const text = htmlToText.fromString(utils.parseMessageBody(res.data.payload), {
        ignoreImage: true,
        ignoreHref: true,
        preserveNewlines: true
      });
      result['Text'] = text;
      console.log(result);
    }
  });
}

Reader.prototype.checkInbox = function() {
  this.gmail.users.messages.list({
    userId: 'me',
    maxResults: 10
  }, (err, res) => {
      if(!err) {
        for(let msg of res.data.messages) {
          this.getMail(msg);
        }
      } else {
        console.log(err);
      }
    }
  )
}

Reader.prototype.checkForSpecificMails = function(query){
    this.gmail.users.messages.list({
        userId: 'me',
        q: query
    }, (err, res) => {
        if(!err){
            var mails = res.data.messages;
            this.getMail(gmail, mails);
        }
        else{
            console.log(err);
        }
    });
}

module.exports = Reader;
