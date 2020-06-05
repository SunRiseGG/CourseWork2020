'use strict';

const db = require('./queryBuilder.js');

function DatabaseInterface() {
  this.pg = db.open({
    host: '127.0.0.1',
    port: 5432,
    database: 'coursework2020',
    user: 'kotenko',
    password: 'kotenko'
  });
}

DatabaseInterface.prototype.saveUser = function(service, userName, userPass) {
  console.log(userName, userPass);
  this.pg.select('Users')
    .fields(['email', 'password', 'service'])
    .insert(userName, userPass, service)
    .then(function() {
    });
}

DatabaseInterface.prototype.getAllSaved = function(callback) {
  this.pg.select('Users')
    .fields(['email', 'service', 'password'])
    .order('email')
    .then(rows => {
      let result = rows.flatMap(element => Object.values(element));
      callback(rows);
    });
}

DatabaseInterface.prototype.closeConnection = function() {
  this.pg.close();
}

module.exports = DatabaseInterface;
