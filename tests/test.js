var t = require('tap')
var _ = require('lodash')
var Session = require('..')
var data = require('./.data')

var session = new Session(data.server, data.database)
var raw
var modules

const start = async () => {
  await session.start(data.username, {password: data.password})
}

const action = async () => {
  var mods = await session.rpc('model.ir.module.search_read', [
    [], 0, null, null, ['name']
  ])
  t.ok(_.isArray(mods))
  if (modules) {
    t.equal(modules, mods.length)
  } else {
    modules = mods.length
  }
}

const pack = async () => {
  await session.pack().then((res) => { raw = res })
}

const unpack = async () => {
  await Session.unpack(raw).then((res) => {
    t.isA(res, Session)
    session = res
  })
}

const breakToken = async () => {
  session.session = '123'
}

const stop = async () => {
  await session.stop()
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
