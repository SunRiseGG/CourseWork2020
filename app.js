'use strict';

let nodemailer = require('nodemailer');
let inquirer = require('inquirer');

let mailOptions = {
  from: 'SunRiseGC4@gmail.com',
  to: 'kotenkobogdan13@gmail.com',
  subject: 'Test',
  text: 'IDI NAXYI'
};


let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  secure: false,
  auth: {
    user: 'SunRiseGC4@gmail.com',
    pass: 'viper2018'
  }
})

inquirer
.prompt([{
  type: "input",
  name: "command",
  message: "Command:"
}])
.then(answers => {
  if(answers.command === 'send') {
    transporter.sendMail(mailOptions, (err, info) => {
      if(err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
      process.exit();
    })
  } else {
    console.log("TI SHO EBANYTI?");
  }
})
.catch(error => {
  console.log("TI SHO EBANYTI?");
  console.log(error);
})
