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
SessionLLT.serializable.parameters = true;
SessionLLT.serializable.language = true;
//
SessionLLT.prototype.start = function (username, parameters, language) {
  var res = SessionLLT.super_.prototype.start.call(this, username, parameters,
    language);
  this.username = username;
  this.parameters = parameters;
  this.language = language;
  return res;
};
SessionLLT.prototype.rpc = function () {
  return new Promise((resolve, reject) => {
    SessionLLT.super_.prototype.rpc.apply(this, arguments)
      .then(
        (res) => resolve(res), (err) => {
          if (err.status === 403) {
            this.login(this.username, this.parameters, this.language)
              .then(() => SessionLLT.super_.prototype.rpc.apply(this,
                  arguments)
                .then(resolve, reject), reject);
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
            this.login(this.username, this.parameters, this.language)
              .then(() => SessionLLT.super_.prototype.bulk.apply(this,
                  arguments)
                .then(resolve, reject), reject);
          }
          else {
            reject(err);
          }
        });
  });
};
module.exports = SessionLLT;
