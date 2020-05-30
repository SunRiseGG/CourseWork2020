'use strict';

let nodemailer = require('nodemailer');
let inquirer = require('inquirer');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
let mailer = require('./mailer.js');
mailer = new mailer();

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), checkInbox);
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
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
      callback(oAuth2Client);
    });
  });
}

function checkInbox(auth) {
  let gmail = google.gmail({version: 'v1', auth});
  console.log(gmail.users.messages);
  gmail.users.messages.list({
    userId: 'me'
  }, (err, res) => {
      if(!err) {
        checkForMediumMails(auth, res.data.messages);
      } else {
        console.log(err);
      }
    }
  )
}

function checkForMediumMails(auth, msgId){
  let gmail = google.gmail({version: 'v1', auth});
    var query = "from:ostl@ukr.net";
    gmail.users.messages.list({
        userId: 'me',
        q: query
    }, (err, res) => {
        if(!err){
            var mails = res.data.messages;
            getMail(auth, mails);
        }
        else{
            console.log(err);
        }
    });
}


function getMail(auth, msgId){
  let gmail = google.gmail({version: 'v1', auth});
  for(let msg of msgId) {
        gmail.users.messages.get({
            'userId': 'me',
            'id': msg.id
        }, (err, res) => {
            if(!err){
                var body = res.data;

                console.log(body);
            }
        });
    }
  }



let login = function() {
  inquirer
  .prompt([
    {
      type: "input",
      name: "userName",
      message: "Email:",
      validate: checkEmail
    },
    {
      type: "password",
      name: "userPass",
      mask: "*",
      message: "Password:",
      validate: checkPass
    },
    {
      type: "rawlist",
      name: "smtp",
      message: "Choose your service:",
      choices: [
        "smtp.gmail.com",
        "smtp.live.com",
        "smtp.office365.com",
        "smtp.mail.yahoo.com",
        "smtp.comcast.com"
      ]
  }])
  .then(answers => {
    mailer.createTransport(answers.userName, answers.userPass, answers.smtp);
    chooseCommand();
  })
  .catch(error => {
    console.log("TI SHO EBANYTI?");
    console.log(error);
  })
}

let chooseCommand = function() {
  inquirer
  .prompt([
    {
      type: "rawlist",
      name: "command",
      message: "Command:",
      choices: [
        {
          name: 'Compose a letter',
          value: 'writeMail'
        },
        {
          name: 'View mail',
          value: 'viewMail'
        },
        {
          name: 'Change user',
          value: 'logout'
      }]
  }])
  .then(answers => {
    answers.command === 'writeMail' ? writeMail() :
      answers.command === 'logout' ? login() : chooseCommand();

  })
  .catch(error => {
    console.log("TI SHO EBANYTI?");
    console.log(error);
  })
}

let writeMail = function() {
  inquirer
  .prompt([
    {
      type: "input",
      name: "to",
      message: "To:",
      validate: checkEmail
    },
    {
      type: "input",
      name: "subject",
      message: "Subject:"
    },
    {
      type: "input",
      name: "text",
      message: "Text:"
    },
    {
      type: "input",
      name: "attachmentPath",
      message: "Attachment Path:"
    },
  ])
  .then(answers => {
    console.log(answers.attachmentPath);
    mailer.createMail(answers.from, answers.to, answers.subject, answers.text, answers.attachmentPath);
    inquirer
    .prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Send?"
    }])
    .then(answers => {
      answers.confirm === true ? mailer.sendMail() : chooseCommand();
    })
    .catch(error => {
      console.log("TI SHO EBANYTI?");
      console.log(error);
    })
  })
  .catch(error => {
    console.log("TI SHO EBANYTI?");
    console.log(error);
  })
}

let checkEmail = function(userName) {
  const dummy = /\S+@\S+\.\S+/;
  let check = dummy.test(userName) ? true : "Please enter a valid email adress.";
  return check;
}

let checkPass = function(userPass) {
  let check = userPass.length >= 8 ? true : "Password should be at least 8 symbols.";
  return check;
}

login();
