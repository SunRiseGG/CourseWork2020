'use strict';

const inquirer = require('inquirer');
const Mailer = require('./mailer.js');
const Reader = require('./reader.js');
const { Utils, CryptoModule } = require('./utils.js');
const DatabaseInterface = require('./database.js');
const mailer = new Mailer();
const reader = new Reader();
const utils = new Utils();
const cryptoModule = new CryptoModule(16, 'sha512');
const databaseInterface = new DatabaseInterface();

const getAllSaved = function () {
  const choices = [];
  utils.addChoice(choices, 'Login to another account', 'newUser');
  new Promise(resolve => {
    databaseInterface.getAllSaved(resolve);
  })
    .then(savedUsers => {
      const savedEmails = savedUsers.map(element => element.email);
      inquirer
        .prompt([
          utils.createList('savedEmails', 'Choose your username:', [
            ...savedEmails,
            new inquirer.Separator(),
            ...choices,
            new inquirer.Separator()
          ])
        ])
        .then(answers => {
          const savedUser = savedUsers.find(element => {
            return element.email === answers.savedEmails;
          });
          !savedUser ? login({
            email: 'newUser',
            service: '',
            password: '',
            salt: ''
          }) : login(savedUser);
        })
        .catch(error => {
          console.log(error);
        });
    });
};

const login = function ({ email, service, password, salt }) {
  inquirer
    .prompt([
      utils.createInput(
        'userName',
        'Email:',
        utils.checkEmail,
        () => email === 'newUser'
      ),
      utils.createPassword('userPass', '*', 'Password:', utils.checkPass)
    ])
    .then(answers => {
      service = service || utils.parseService(answers.userName);
      mailer.createTransport(
        answers.userName || email,
        answers.userPass,
        service
      );
      cryptoModule.createSalt();
      const hashPassword = cryptoModule.hashPassword(answers.userPass);
      if (answers.userName) {
        inquirer
          .prompt([
            utils.createConfirm('save', 'Save your user?')
          ])
          .then(saveClause => {
            saveClause.save ? databaseInterface.saveUser(
              service,
              answers.userName,
              hashPassword,
              cryptoModule.salt
            ) : false;
            chooseCommand(service !== 'smtp.gmail.com');
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        if (cryptoModule.verifyPassword(answers.userPass, password, salt)) {
          chooseCommand(service !== 'smtp.gmail.com');
        } else {
          console.log('Please enter the correct password!');
          login({ email, service, password, salt });
        }
      }
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
  utils.addChoice(choices, 'Exit program', 'exit');
  inquirer
    .prompt([
      utils.createList('command', 'Command:', choices)
    ])
    .then(answers => {
      answers.command === 'writeMail' ? writeMail() :
        answers.command === 'logout' ? getAllSaved() :
          answers.command === 'exit' || viewMail();

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
      const callback = attachments => {
        mailer.createMail(
          answers.to,
          answers.subject,
          answers.text,
          attachments.length ? attachments : undefined
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
      };
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

process.on('uncaughtException', err => {
  console.log(err);
  databaseInterface.closeConnection();
});

process.on('exit', code => {
  console.log(`Shutting down with exitcode ${code}`);
  databaseInterface.closeConnection();
});

process.on('SIGINT', () => {
  console.log('Shutting down');
  databaseInterface.closeConnection();
});


getAllSaved();
