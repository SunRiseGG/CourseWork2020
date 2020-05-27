'use strict';

let nodemailer = require('nodemailer');
let inquirer = require('inquirer');
let mailer = require('./Mailer');
mailer = new mailer();
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
  },
  {
    type: "input",
    name: "command",
    message: "Command:"
  },
  {
    type: "input",
    name: "from",
    message: "From:"
  },
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
    type: "confirm",
    name: "confirm",
    message: "Send:"
}])
.then(answers => {
  mailer.createTransport(answers.userName, answers.userPass);
  if(answers.command === 'writeMail') {
    mailer.createMail(answers.from, answers.to, answers.subject, answers.text);
  }
  if(answers.confirm === true) {
    console.log(mailer);
    mailer.sendMail();
  } else {
    console.log("TI SHO EBANYTI?");
  }
})
.catch(error => {
  console.log("TI SHO EBANYTI?");
  console.log(error);
})
