var t = require('tap')
var _ = require('lodash')
var co = require('co')
var Session = require('..')
var data = require('./.data')

var session = new Session(data.server, data.database)
var raw
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

function pack () {
  return session.pack().then((res) => { raw = res })
}

function unpack () {
  return Session.unpack(raw).then((res) => {
    t.isA(res, Session)
    session = res
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
  .then(pack)
  .then(unpack)
  .then(action)
  .then(breakToken)
  .then(action)
  .then(stop)
  .catch(t.threw)
