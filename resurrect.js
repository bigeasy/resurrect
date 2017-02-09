var cadence = require('cadence')
var delta = require('delta')
var children = require('child_process')
var abend = require('abend')
var Signal = require('signal')
var Demur = require('demur')
var util = require('util')
var events = require('events')
var assert = require('assert')

function Resurrect (options) {
    this._argv = options.argv
    this._child = null
    this._demur = null
    this._stopped = new Signal
    this._stopped.open = [ null, true ]
    events.EventEmitter.call(this)
}
util.inherits(Resurrect, events.EventEmitter)

Resurrect.prototype._run = cadence(function (async) {
    this._demur = new Demur
    var loop = async(function () {
        this._stopped.open = null
        var argv = this._argv.slice()
        this.process = children.spawn(argv.shift(), argv, {
            stdio: [ 'pipe', 1, 2, 'ipc' ]
        })
        this.emit('spawn')
        delta(async()).ee(this.process).on('close')
    }, function (code, signal) {
        this.process = null
        this._stopped.notify(null, true)
        this._demur.retry(async())
    }, function (again) {
        if (!again) {
            this._demur = null
            return [ loop.break ]
        }
    })()
})

Resurrect.prototype.start = function () {
    if (this._demur != null) {
        return
    }
    this._run(abend)
}

Resurrect.prototype.stop = cadence(function (async) {
    this._demur.cancel()
    if (this.process == null) {
        return
    }
    async(function () {
        this.process.kill()
        this._stopped.wait(1000, async())
    }, function (stopped) {
        if (stopped) {
            return [ async.break ]
        }
        this.process.kill('SIGKILL')
        this._stopped.wait(1000, async())
    }, function (stopped) {
        assert(stopped, 'unable to kill')
    })
})

module.exports = Resurrect
