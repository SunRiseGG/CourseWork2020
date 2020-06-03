'use strict';

const db = require('./queryBuilder.js');

const pg = db.open({
  host: '127.0.0.1',
  port: 5432,
  database: 'coursework2020',
  user: 'kotenko',
  password: 'kotenko'
});

let saveUser = function(...args) {
  pg.select('Users')
    .fields(['email', 'password', 'service'])
    .insert(args)
    .then(function() {
      pg.close();
    });
}

let checkIfSaved = function(userName, userPass, service) {
  pg.select('Users')
    .where({ email: userName, password: userPass, service: service})
    .fields(['email', 'password', 'service'])
    .then(function(rows) {
      if(rows.length !== 0) {
        console.log('HUUUUI');
        console.log(rows.length);
        pg.close();
      } else {
        saveUser(userName, userPass, service);
        console.log('NEE HUUUUUUI');
      }
    });
}

let getAllSaved = function() {
  pg.select('Users')
    .fields(['email'])
    .order('email')
    .then(rows => {
      console.log(rows.flatMap(element => Object.values(element)));
      pg.close();
    });
}

let chooseSaved = function(userName) {
  pg.select('Users')
    .where({ email: userName })
    .fields(['email', 'password', 'service'])
    .then(rows => {
      console.log(rows.flatMap(element => Object.values(element)));
      pg.close();
    });
}
