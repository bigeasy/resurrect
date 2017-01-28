Synopsis.

```javascript
var Resurrect = require('resurrect')
var resurrect = new Resurrect({ argv: [ 'node', 'server.js' ] })

resurrect.start()

resurrect.stop(function (error)  {
    if (error) throw error
})
```

More details in the [Docco](./docco/resurrect.html).
