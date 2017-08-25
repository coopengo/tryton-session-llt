var t = require('tap')
var _ = require('lodash')
var co = require('co')
var Session = require('..')
var data = require('./.data')

var session = new Session(data.server, data.database)
var modules

function start () {
  return session.start(data.username, data.parameters)
}

function action () {
  return co(function * () {
    var mods = yield session.rpc('model.ir.module.search_read', [
      [], 0, null, null, ['name']
    ])
    t.ok(_.isArray(mods))
    if (modules) {
      t.equal(modules, mods.length)
    } else {
      modules = mods.length
    }
  })
}

function breakToken () {
  session.token = '123'
}

function stop () {
  return session.stop()
}
t.test(start)
  .then(action)
  .then(breakToken)
  .then(action)
  .then(stop)
  .catch(t.threw)
