require('proof')(1, require('cadence')(prove))

function prove (async, assert) {
    var delta = require('delta')
    var Resurrect = require('..')
    var resurrect = new Resurrect({ argv: [ 'node', 't/term.js' ] })
    async(function () {
        resurrect.start()
        delta(async()).ee(resurrect.process).on('message')
    }, function (message) {
        resurrect.stop(async())
    }, function () {
        assert(true, 'started and stopped')
    })
}
