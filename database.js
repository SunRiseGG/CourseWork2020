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

DatabaseInterface.prototype.saveUser = function (
  service,
  userName,
  userPass,
  userSalt) {
  this.pg.select('Users')
    .fields(['email', 'password', 'service', 'salt'])
    .insert(userName, userPass, service, userSalt)
    .then(() => {
    });
};

DatabaseInterface.prototype.getAllSaved = function (callback) {
  this.pg.select('Users')
    .fields(['email', 'service', 'password', 'salt'])
    .order('email')
    .then(callback);
};

DatabaseInterface.prototype.closeConnection = function () {
  this.pg.close();
};

module.exports = DatabaseInterface;
