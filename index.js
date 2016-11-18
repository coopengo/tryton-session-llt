var inherits = require('inherits');
var Session = require('tryton-session');

function SessionLLT(server, database, username, password) {
  SessionLLT.super_.call(this, server, database);
  this.username = username;
  this.password = password;
}
inherits(SessionLLT, Session);
//
SessionLLT.serializable = Session.serializable;
SessionLLT.afterLogin = Session.afterLogin;
SessionLLT.beforeLogout = Session.beforeLogout;
SessionLLT.beforePack = Session.beforePack;
SessionLLT.afterUnpack = Session.afterUnpack;
//
SessionLLT.prototype.login = function () {
  return SessionLLT.super_.prototype.login.call(this, this.username, this.password);
};
SessionLLT.prototype.start = function () {
  return SessionLLT.super_.prototype.start.call(this, this.username, this.password);
};
SessionLLT.prototype.rpc = function () {
  return new Promise((resolve, reject) => {
    SessionLLT.super_.prototype.rpc.apply(this, arguments)
      .then(
        (res) => resolve(res), (err) => {
          if (err.status === 403) {
            this.login()
              .then(() => SessionLLT.super_.prototype.rpc.apply(this,
                arguments));
          }
          else {
            reject(err);
          }
        });
  });
};
SessionLLT.prototype.bulk = function () {
  return new Promise((resolve, reject) => {
    SessionLLT.super_.prototype.bulk.apply(this, arguments)
      .then(
        (res) => resolve(res), (err) => {
          if (err.status === 403) {
            this.login()
              .then(() => SessionLLT.super_.prototype.bulk.apply(this,
                arguments));
          }
          else {
            reject(err);
          }
        });
  });
};
module.exports = SessionLLT;
