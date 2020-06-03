'use strict';

const inquirer = require('inquirer');
const Mailer = require('./mailer.js');
const Reader = require('./reader.js');
const Utils = require('./utils.js');
const mailer = new Mailer();
const reader = new Reader();
const utils = new Utils();

const login = function () {
  inquirer
    .prompt([
      utils.createInput('userName', 'Email:', utils.checkEmail),
      utils.createPassword('userPass', '*', 'Password:', utils.checkPass),
      utils.createList('service', 'Choose your service:', [
        'smtp.gmail.com',
        'smtp.live.com',
        'smtp.office365.com',
        'smtp.mail.yahoo.com',
        'smtp.comcast.com'
      ])
    ])
    .then(answers => {
      mailer.createTransport(
        answers.userName,
        answers.userPass,
        answers.service
      );
      chooseCommand(answers.service !== 'smtp.gmail.com');
    })
    .catch(error => {
      console.log(error);
    });
};

const chooseCommand = function (service) {
  const choices = [];
  utils.addChoice(choices, 'Compose a letter', 'writeMail');
  utils.addChoice(choices, 'View mail', 'viewMail', service);
  utils.addChoice(choices, 'Change user', 'logout');
  inquirer
    .prompt([
      utils.createList('command', 'Command:', choices)
    ])
    .then(answers => {
      answers.command === 'writeMail' ? writeMail() :
        answers.command === 'logout' ? login() : viewMail();

    })
    .catch(error => {
      console.log(error);
    });
};

const writeMail = function () {
  inquirer
    .prompt([
      utils.createInput('to', 'To:', utils.checkEmail),
      utils.createInput('subject', 'Subject:'),
      utils.createInput('text', 'Text:')
    ])
    .then(answers => {
      let callback = (attachments) => {
          mailer.createMail(
            answers.to,
            answers.subject,
            answers.text,
            attachments
          );
          inquirer
            .prompt([
              utils.createConfirm('confirm', 'Send?')
            ])
            .then(answers => {
              answers.confirm ? mailer.sendMail() : false;
              chooseCommand();
            })
            .catch(error => {
              console.log(error);
            });
        }
        utils.selectFile([], callback);
    })
    .catch(error => {
      console.log(error);
    });
};

const viewMail = function () {
  reader.checkInbox();
  chooseCommand();
};

login();
