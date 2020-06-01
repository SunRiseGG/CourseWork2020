'use strict';

let nodemailer = require('nodemailer');
let inquirer = require('inquirer');
let mailer = require('./mailer.js');
let reader = require('./reader.js');
let utils = require('./utils.js');
mailer = new mailer();
reader = new reader();
utils = new utils();

let login = function() {
  inquirer
  .prompt([
    utils.createInput("userName", "Email:", utils.checkEmail),
    utils.createPassword("userPass", "*", "Password:", utils.checkPass),
    utils.createList("service", "Choose your service:", [
      "smtp.gmail.com",
      "smtp.live.com",
      "smtp.office365.com",
      "smtp.mail.yahoo.com",
      "smtp.comcast.com"
    ])
  ])
  .then(answers => {
    mailer.createTransport(answers.userName, answers.userPass, answers.service);
    chooseCommand(answers.service !== "smtp.gmail.com" ? true : false);
  })
  .catch(error => {
    console.log(error);
  })
}

let chooseCommand = function(service) {
  let choices = [];
  utils.addChoice(choices, "Compose a letter", "writeMail");
  utils.addChoice(choices, "View mail", "viewMail", service);
  utils.addChoice(choices, "Change user", "logout");
  inquirer
  .prompt([
    utils.createList("command", "Command:", choices)
  ])
  .then(answers => {
    answers.command === 'writeMail' ? writeMail() :
      answers.command === 'logout' ? login() : viewMail();

  })
  .catch(error => {
    console.log(error);
  })
}

let viewMail = function() {
  reader.checkInbox();
  chooseCommand();
}

let writeMail = function() {
  inquirer
  .prompt([
    utils.createInput("to", "To:", utils.checkEmail),
    utils.createInput("subject", "Subject:"),
    utils.createInput("text", "Text:"),
    utils.createInput("attachmentPath", "Attachment path:")
  ])
  .then(answers => {
    console.log(answers.attachmentPath);
    mailer.createMail(answers.from, answers.to, answers.subject, answers.text, answers.attachmentPath);
    inquirer
    .prompt([
      utils.createConfirm("confirm", "Send?")
    ])
    .then(answers => {
      answers.confirm ? mailer.sendMail() : false;
      chooseCommand();
    })
    .catch(error => {
      console.log(error);
    })
  })
  .catch(error => {
    console.log(error);
  })
}

login();
