var _munit = global.munit;

// Globalizing so that all libs use the same munit object
// Global object will be removed by end of script
global.munit = module.exports = require( './lib/munit.js' );


// All libs are assumed to be prefixed to the lib directory
[

	'defaults.js',
	'assert.js',
	'spy.js',
	'queue.js',
	'render.js',
	'cli.js',
	'color.js',

	'format/json.js',
	'format/junit.js',

].forEach(function( lib ) {
	require( './lib/' + lib );
});


// Transfer current version
global.munit.version = require( './package.json' ).version;

// Reset global var
global.munit = _munit;
