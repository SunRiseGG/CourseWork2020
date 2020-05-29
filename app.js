'use strict';

let nodemailer = require('nodemailer');
let inquirer = require('inquirer');
const {google} = require('googleapis');
let mailer = require('./mailer.js');
mailer = new mailer();

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
