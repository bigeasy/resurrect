console.log('kill running')
process.on('SIGTERM', function () {})
process.stdin.resume()
process.send(true)
