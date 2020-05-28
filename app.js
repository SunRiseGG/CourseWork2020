'use strict';

let nodemailer = require('nodemailer');
let inquirer = require('inquirer');
const {google} = require('googleapis');
let mailer = require('./Mailer');
mailer = new mailer();

let login = function() {
  inquirer
  .prompt([
    {
      type: "input",
      name: "userName",
      message: "Email:"
    },
    {
      type: "password",
      name: "userPass",
      mask: "*",
      message: "Password:"
  }])
  .then(answers => {
    if(answers.userName === '' || answers.userPass === '') {
      console.log("Please fill in your email adress and password.");
      login();
    } else {
      mailer.createTransport(answers.userName, answers.userPass);
      chooseCommand();
    }
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
      type: "expand",
      name: "command",
      message: "Command:",
      choices: [
        {
          key: 'w',
          name: 'Compose a letter',
          value: 'writeMail'
      }]
  }])
  .then(answers => {
    if(answers.command === 'writeMail') {
      writeMail();
    } else {
      console.log("Choose a valid command.");
      chooseCommand();
    }
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
      message: "To:"
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
    if(answers.to === '') {
      console.log("Please enter the recipient\'s email.");
      writeMail();
    } else {
      console.log(answers.attachmentPath);
      mailer.createMail(answers.from, answers.to, answers.subject, answers.text, answers.attachmentPath);
      confirmation();
    }
  })
  .catch(error => {
    console.log("TI SHO EBANYTI?");
    console.log(error);
  })
}

let confirmation = function() {
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
}

login();
