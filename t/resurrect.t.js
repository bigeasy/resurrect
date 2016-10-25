require('proof')(2, require('cadence')(prove))

function prove (async, assert) {
    var delta = require('delta')
    var Resurrect = require('..')
    var resurrect = new Resurrect({ argv: [ 'node', 't/term.js' ] })
    async(function () {
        resurrect.start()
        resurrect.start()
        delta(async()).ee(resurrect.process).on('message')
    }, function () {
        delta(async()).ee(resurrect).on('spawn')
        resurrect.process.kill()
    }, function () {
        resurrect.stop(async())
    }, function () {
        assert(true, 'termed')
        resurrect.stop(async())
        resurrect = new Resurrect({ argv: [ 'node', 't/kill.js' ] })
        resurrect.start()
        delta(async()).ee(resurrect.process).on('message')
    }, function () {
        resurrect.stop(async())
        assert(true, 'killed')
    })
}
