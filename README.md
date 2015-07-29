# gulp-name-amd

give AMD module a module name if none

## Install

```
$ npm install --save-dev gulp-nam-amd
```

## Usage

##### files
 * views
   * index.js
 
##### js code

/***
 * views/index.js
 **/
define(['base'], function( Baseview ){
	"use strict";
	......
})
```

/***
 * in gulpfile.js
 **/
var nameAmd  = require('gulp-name-amd');
...

gulp.src( './views/*.js' ) )
    .pipe( nameAmd( ) ) 
    .pipe( gulp.dest( './buld/views' ));
	
##### result
```js
/***
 * build/views/index.js
 **/
 
define('index', ['base'], function( Baseview ){
	"use strict";
	......
})
```

## Note
 * DO NOT put code before define([],function(){}) call
