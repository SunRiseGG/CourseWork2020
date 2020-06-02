'use strict';

const inquirer = require('inquirer');

function Utils() {}

Utils.prototype.parseMessageHeaders = function (headers) {
  const result = {
    'From': '',
    'To': '',
    'Subject': '',
    'Date': ''
  };
  headers.forEach(header => {
    result[header.name] === '' ? result[header.name] = header.value : null;
  });
  return result;
};

const getHTMLPart = function (arr) {
  for (const element of arr) {
    if (element.parts === undefined) {
      if (element.mimeType === 'text/html') {
        return element.body.data;
      }
    } else {
      return getHTMLPart(element.parts);
    }
  }
  return '';
};

Utils.prototype.parseMessageBody = function (message) {
  let encodedBody = '';
  if (message.parts === undefined) {
    encodedBody = message.body.data;
  } else {
    encodedBody = getHTMLPart(message.parts);
  }
  encodedBody = encodedBody
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .replace(/\s/g, '');
  return Buffer.from(encodedBody, 'base64').toString();
};

Utils.prototype.createInput = function (
  inputName,
  inputMessage,
  inputValidate) {
  const input = {
    type: 'input',
    name: inputName,
    message: inputMessage,
    validate: inputValidate
  };
  return input;
};

Utils.prototype.createPassword = function (
  passwordName,
  passwordMask,
  passwordMessage,
  passwordValidate) {
  const password = {
    type: 'password',
    name: passwordName,
    mask: passwordMask,
    message: passwordMessage,
    validate: passwordValidate
  };
  return password;
};

Utils.prototype.createList = function (listName, listMessage, listChoices) {
  const list = {
    type: 'list',
    name: listName,
    message: listMessage,
    choices: listChoices
  };
  return list;
};

Utils.prototype.addChoice = function (
  choices,
  choiceName,
  choiceValue,
  choiceDisabled = false) {
  choices.push({
    name: choiceName,
    value: choiceValue,
    disabled: choiceDisabled
  });
};

Utils.prototype.createConfirm = function (confirmName, confirmMessage) {
  const confirm = {
    type: 'confirm',
    name: confirmName,
    message: confirmMessage
  };
  return confirm;
};

Utils.prototype.checkEmail = function (userName) {
  const dummy = /\S+@\S+\.\S+/;
  const check = dummy.test(userName) ? true :
    'Please enter a valid email adress.';
  return check;
};

Utils.prototype.checkPass = function (userPass) {
  const check = userPass.length >= 8 ? true :
    'Password should be at least 8 symbols.';
  return check;
};

Utils.prototype.selectFile = function(attachments, callback) {
  inquirer.prompt([
    this.createInput('attachment', 'Attachment Path:'),
    {
      type: 'confirm',
      name: 'anotherPath',
      message: 'Want to add another attachment?'
    }
  ])
    .then(answers => {
      attachments.push({
        filename: answers.attachment.split('\\').pop(),
        path: answers.attachment
      })
      answers.anotherPath ? this.selectFile(attachments, callback) : callback(attachments);
    })
}

module.exports = Utils;
