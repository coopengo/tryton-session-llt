var inherits = require('inherits');
var Session = require('tryton-session');

function SessionLLT(server, database) {
  SessionLLT.super_.call(this, server, database);
}
inherits(SessionLLT, Session);
//
SessionLLT.serializable = Session.serializable;
SessionLLT.afterStart = Session.afterStart;
SessionLLT.beforeStop = Session.beforeStop;
SessionLLT.beforePack = Session.beforePack;
SessionLLT.afterUnpack = Session.afterUnpack;
//
SessionLLT.serializable.password = true;
//
SessionLLT.prototype.start = function (username, password) {
  this.username = username;
  this.password = password;
  return SessionLLT.super_.prototype.start.call(this, username, password);
};
SessionLLT.prototype.rpc = function () {
  return new Promise((resolve, reject) => {
    SessionLLT.super_.prototype.rpc.apply(this, arguments)
      .then(
        (res) => resolve(res), (err) => {
          if (err.status === 403) {
            this.login(this.username, this.password)
              .then(() => SessionLLT.super_.prototype.rpc.apply(this,
                  arguments)
                .then(resolve, reject));
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
            this.login(this.username, this.password)
              .then(() => SessionLLT.super_.prototype.bulk.apply(this,
                  arguments)
                .then(resolve, reject));
          }
          else {
            reject(err);
          }
        });
  });
};
module.exports = SessionLLT;
