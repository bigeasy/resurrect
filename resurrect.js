var cadence = require('cadence')
var delta = require('delta')
var children = require('child_process')
var abend = require('abend')
var Vestibule = require('vestibule')
var Demur = require('demur')

function Resurrect (options) {
    this._argv = options.argv
    this._child = null
    this._demur = null
    this._stopped = new Vestibule
    this._stopped.open = [ null, true ]
}

Resurrect.prototype._run = cadence(function (async) {
    this._demur = new Demur
    var loop = async(function () {
        this._stopped.open = null
        var argv = this._argv.slice()
        this.process = children.spawn(argv.shift(), argv, {
            stdio: [ 'pipe', 1, 2, 'ipc' ]
        })
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
    if (this._demur == null) {
        return
    }
    this._demur.cancel()
    if (this.process == null) {
        return
    }
    async(function () {
        this.process.kill()
        this._stopped.enter(1000, async())
    }, function (stopped) {
        if (stopped) {
            return [ async.break ]
        }
        this.process.kill('KILL')
        this._stopped.enter(1000, async())
    }, function (stopped) {
        assert(stopped, 'unable to kill')
    })
})

module.exports = Resurrect
