'use strict'

let parseMessageHeaders = function(headers) {
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

let parseMessageBody = function(message) {
  let encodedBody = '';
  if(message.parts === undefined) {
    encodedBody = message.body.data;
  } else {
    encodedBody = getHTMLPart(message.parts);
  }
  encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
  return new Buffer(encodedBody, 'base64').toString();
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

module.exports = { parseMessageHeaders, parseMessageBody };
