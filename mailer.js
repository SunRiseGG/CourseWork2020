'use strict';

let nodemailer = require('nodemailer');
let inquirer = require('inquirer');

function Mailer(){}

Mailer.prototype.createTransport = function(user, pass) {
  this.transport =  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: false,
    auth: {user, pass}
  })
}

Mailer.prototype.createMail = function(from, to, subject, text, attachment = "") {
  this.mail = {
    from,
    to,
    subject,
    text,
    attachments: attachment ? [
      { filename: attachment.split('\\').pop(), path: attachment }
    ] : undefined
  };
}
Mailer.prototype.sendMail = function() {
  this.transport.sendMail(this.mail, (err, info) => {
    if(err) {
      console.log(err);
    } else {
      console.log(info.response);
    }
  });
}

module.exports = Mailer;
