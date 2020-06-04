'use strict';

const nodemailer = require('nodemailer');

function Mailer() {}

Mailer.prototype.createTransport = function (user, pass, service) {
  this.transport = nodemailer.createTransport({
    host: service,
    secure: false,
    auth: { user, pass }
  });
};

Mailer.prototype.createMail = function (
  to,
  subject,
  text,
  attachments
) {
  this.mail = {
    to,
    subject,
    text,
    attachments: attachments
  };
};

Mailer.prototype.sendMail = function (cb) {
  this.transport.sendMail(this.mail, (err, info) => {
    if (err) {
      console.log(err);
    }
    cb();
  });
};

module.exports = Mailer;
