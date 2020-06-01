'use strict'

function Utils(){}

Utils.prototype.parseMessageHeaders = function(headers) {
  let result = {
    'From': '',
    'To': '',
    'Subject': '',
    'Date': ''
  };
  headers.forEach(header => {
    result[header.name] === '' ? result[header.name] = header.value : null;
  })
  return result;
}

Utils.prototype.parseMessageBody = function(message) {
  let encodedBody = '';
  if(message.parts === undefined) {
    encodedBody = message.body.data;
  } else {
    encodedBody = getHTMLPart(message.parts);
  }
  encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
  return Buffer.from(encodedBody, 'base64').toString();
}

let getHTMLPart = function(arr) {
  for(let element of arr) {
    if(element.parts === undefined) {
      if(element.mimeType === 'text/html') {
        return element.body.data;
      }
    } else {
      return getHTMLPart(element.parts)
    }
  }
  return '';
}

Utils.prototype.createInput = function(inputName, inputMessage, inputValidate) {
  let input = {
    type: "input",
    name: inputName,
    message: inputMessage,
    validate: inputValidate
  };
  return input;
}

Utils.prototype.createPassword = function(passwordName, passwordMask, passwordMessage, passwordValidate) {
  let password = {
    type: "password",
    name: passwordName,
    mask: passwordMask,
    message: passwordMessage,
    validate: passwordValidate
  };
  return password;
}

Utils.prototype.createList = function(listName, listMessage, listChoices) {
  let list = {
    type: "list",
    name: listName,
    message: listMessage,
    choices: listChoices
  };
  return list;
}

Utils.prototype.addChoice = function(choices, choiceName, choiceValue, choiceDisabled = false) {
  choices.push({
    name: choiceName,
    value: choiceValue,
    disabled: choiceDisabled
  })
}

Utils.prototype.createConfirm = function(confirmName, confirmMessage) {
  let confirm = {
    type: "confirm",
    name: confirmName,
    message: confirmMessage
  };
  return confirm;
}

Utils.prototype.checkEmail = function(userName) {
  const dummy = /\S+@\S+\.\S+/;
  let check = dummy.test(userName) ? true : "Please enter a valid email adress.";
  return check;
}

Utils.prototype.checkPass = function(userPass) {
  let check = userPass.length >= 8 ? true : "Password should be at least 8 symbols.";
  return check;
}

module.exports = Utils;
