munit( 'assert.core', { priority: munit.PRIORITY_HIGHER }, {

	// Ensures all assertions exists
	// THESE TESTS SHOULD NOT CHANGE WITHOUT HEAVY CONSIDERATION
	init: function( assert ) {
		var parAssert = MUNIT.Assert( 'a.b' ),
			options = { expect: 10 },
			module = MUNIT.Assert( "a.b.c", parAssert, options, munit.noop );

		assert.equal( 'Namespace Path', module.nsPath, 'a.b.c' )
			.equal( 'Parent Assertion Module', module.parAssert, parAssert )
			.equal( 'options', module.options, options )
			.equal( 'state', module.state, MUNIT.ASSERT_STATE_DEFAULT )
			.isArray( 'test list', module.list )
			.isObject( 'test hash', module.tests )
			.isObject( 'Sub namespace container', module.ns )
			.isObject( 'Sub userspace container', module.data )
			.equal( 'test count', module.count, 0 )
			.equal( 'passed test count', module.passed, 0 )
			.equal( 'failed test count', module.failed, 0 )
			.equal( 'module callback', module.callback, munit.noop )
			.equal( 'module start time', module.start, 0 )
			.equal( 'module end time', module.end, 0 )
			.equal( 'async flag starts false', module.isAsync, false )
			.isFunction( "ok", module.ok )
			.isFunction( "pass", module.pass )
			.isFunction( "fail", module.fail )
			.isFunction( "isTrue", module.isTrue )
			.isFunction( "isFalse", module.isFalse )
			.isFunction( "isUndefined", module.isUndefined )
			.isFunction( "isNull", module.isNull )
			.isFunction( "isBoolean", module.isBoolean )
			.isFunction( "isNumber", module.isNumber )
			.isFunction( "isString", module.isString )
			.isFunction( "isFunction", module.isFunction )
			.isFunction( "isArray", module.isArray )
			.isFunction( "isDate", module.isDate )
			.isFunction( "isRegExp", module.isRegExp )
			.isFunction( "isObject", module.isObject )
			.isFunction( "isError", module.isError )
			.isFunction( "exists", module.exists )
			.isFunction( "empty", module.empty )
			.isFunction( "equal", module.equal )
			.isFunction( "notEqual", module.notEqual )
			.isFunction( "greaterThan", module.greaterThan )
			.isFunction( "lessThan", module.lessThan )
			.isFunction( "deepEqual", module.deepEqual )
			.isFunction( "notDeepEqual", module.notDeepEqual )
			.isFunction( "throws", module.throws )
			.isFunction( "doesNotThrow", module.doesNotThrow )
			.isFunction( "requireState", module.requireState )
			.isFunction( "requireMaxState", module.requireMaxState )
			.isFunction( "requireMinState", module.requireMinState )
			.isFunction( "log", module.log )
			.isFunction( "module", module.module )
			.isFunction( "trigger", module.trigger )
			.isFunction( "custom", module.custom )
			.isFunction( "option", module.option )
			.isFunction( "junit", module.junit )
			.isFunction( "close", module.close )
			.isFunction( "finish", module.finish );
	},

	// Root ok assertion for which each sub assertions calls
	ok: function( assert ) {
		var module = MUNIT.Assert( "a.b.c" ),
			requireSpy = assert.spy( module, 'requireState', { passthru: true } ),
			passSpy, failSpy, closeSpy;

		// Can only run tests on modules that are in an active state
		module._pass = module._fail = munit.noop;
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		assert.throws( 'Already Closed', "'a.b.c' hasn't been triggered yet", function(){
			module.ok( 'Test Closed' );
		});

		// Test requireState trigger and args
		assert.equal( 'requireState triggered', requireSpy.count, 1 );
		assert.deepEqual( 'requireState args', requireSpy.args, [ MUNIT.ASSERT_STATE_ACTIVE, module.ok ] );

		// Invalid names throw errors
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.throws( 'No string name', "Name not found for test on 'a.b.c'", function(){
			module.ok( null, true, munit.noop );
		});
		assert.deepEqual( 'requireState args with custom start function', requireSpy.args, [ MUNIT.ASSERT_STATE_ACTIVE, munit.noop ] );
		assert.throws( 'String name not found', "Name not found for test on 'a.b.c'", function(){
			module.ok( '', true );
		});

		// Using a key that already exists should throw an error
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.tests[ 'test exists' ] = {};
		assert.throws( 'Test Exists', /Duplicate Test 'test exists' on 'a.b.c'/, function(){
			module.ok( 'test exists' );
		});

		// Passed test
		module = MUNIT.Assert( "a.b.c" );
		passSpy = assert.spy( module, '_pass' );
		failSpy = assert.spy( module, '_fail' );
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.ok( '_pass-test', true );
		assert.equal( '_pass triggered', passSpy.count, 1 );
		assert.equal( '_pass args name', passSpy.args[ 0 ], '_pass-test' );
		assert.equal( '_fail not called when successful test', failSpy.count, 0 );

		// Failed test
		module = MUNIT.Assert( "a.b.c" );
		passSpy = assert.spy( module, '_pass' );
		failSpy = assert.spy( module, '_fail' );
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.ok( '_fail-test', false, munit.noop, 'This test failed' );
		assert.equal( '_pass not triggered on failure', passSpy.count, 0 );
		assert.equal( '_fail triggered on failure', failSpy.count, 1 );
		assert.equal( '_fail arg name', failSpy.args[ 0 ], '_fail-test' );
		assert.equal( '_fail arg startFunc', failSpy.args[ 1 ], munit.noop );
		assert.equal( '_fail arg extra', failSpy.args[ 2 ], 'This test failed' );

		// Failed test default startFunc
		module = MUNIT.Assert( "a.b.c" );
		passSpy = assert.spy( module, '_pass' );
		failSpy = assert.spy( module, '_fail' );
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.ok( '_fail-startFunc', false );
		assert.equal( '_pass shouldnt be called when testing startFunc failure', passSpy.count, 0 );
		assert.equal( '_fail startFunc triggered on failure', failSpy.count, 1 );
		assert.equal( '_fail startFunc arg default', failSpy.args[ 1 ], module.ok );

		// Exceeding expect triggers closing of module
		module = MUNIT.Assert( "a.b.c" );
		closeSpy = assert.spy( module, 'close' );
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module._pass = module._fail = munit.noop;
		module.count = 4;
		module.options = { expect: 4 };
		module.ok( 'trigger close', true );
		assert.equal( 'expect limit reached, close triggered', closeSpy.count, 1 );
	},

	// Internal failed test registry
	_fail: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' );

		// First failed test
		MUNIT.failed = 0;
		module.options.stopOnFail = false;
		module._fail( 'failed test', munit.noop, "Custom Error Message" );

		// Check that all properties are correct after first failed test
		assert.equal( 'Munit failed count', MUNIT.failed, 1 );
		assert.equal( 'Module failed count', module.failed, 1 );
		assert.equal( 'Module test count', module.count, 1 );
		assert.exists( 'test result', module.tests[ 'failed test' ] );
		assert.equal( 'test result stack', module.list[ 0 ], module.tests[ 'failed test' ] );
		assert.equal( 'test result message', module.tests[ 'failed test' ].error.message, "Custom Error Message" );

		// Do another test, without custom error message or start function
		module._fail( 'secondary' );
		assert.equal( 'Secondary Munit failed count', MUNIT.failed, 2 );
		assert.equal( 'Seconday Module failed count', module.failed, 2 );
		assert.equal( 'Seconday Module test count', module.count, 2 );
		assert.exists( 'Secondary test result', module.tests.secondary );
		assert.equal( 'Secondary test result stack', module.list[ 1 ], module.tests.secondary );
		assert.equal( 'Secondary test result message', module.tests.secondary.error.message, "'secondary' test failed" );
	},

	// Internal passed test registry
	_pass: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' );

		// First passed test
		MUNIT.passed = 0;
		module._pass( 'passed test' );

		// Check that all properties are correct after first passed test
		assert.equal( 'Munit passed count', MUNIT.passed, 1 );
		assert.equal( 'Module passed count', module.passed, 1 );
		assert.equal( 'Module test count', module.count, 1 );
		assert.exists( 'test result', module.tests[ 'passed test' ] );
		assert.equal( 'test result stack', module.list[ 0 ], module.tests[ 'passed test' ] );

		// Check secondary pass
		module._pass( 'secondary' );
		assert.equal( 'Secondary Munit passed count', MUNIT.passed, 2 );
		assert.equal( 'Seconday Module passed count', module.passed, 2 );
		assert.equal( 'Seconday Module test count', module.count, 2 );
		assert.exists( 'Secondary test result', module.tests.secondary );
		assert.equal( 'Secondary test result stack', module.list[ 1 ], module.tests.secondary );
	},

	// Delay closing of module
	delay: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			stateSpy = assert.spy( module, 'requireState' ),
			closeSpy = assert.spy( module, 'close' ),
			clearTimeoutSpy = assert.spy( global, 'clearTimeout' ),
			callbackSpy = assert.spy(),
			now = Date.now(),
			timeoutSpy = assert.spy( global, 'setTimeout', {
				onCall: function( callback ) {
					callback();
				}
			});

		// Non-async timeout adjustment
		module.options = { timeout: 20 };
		module._timerStart = 0;
		module.delay( 50, callbackSpy );
		assert.equal( 'requireState triggered', stateSpy.count, 1 );
		assert.deepEqual( 'requireState args', stateSpy.args, [ MUNIT.ASSERT_STATE_ACTIVE, module.delay ] );
		assert.isTrue( 'isAsync gets flipped to true', module.isAsync );
		assert.equal( 'timeout gets set to the time passed', module.options.timeout, 50 );
		assert.equal( 'setTimeout should have been called for non sync path', timeoutSpy.count, 1 );
		assert.equal( 'callback triggered after timeout done', callbackSpy.count, 1 );

		// Async extension
		module.isAsync = true;
		module._timerStart = 0;
		module.options = { timeout: 20 };
		module.delay( 50, callbackSpy );
		assert.equal( 'requireState always triggered', stateSpy.count, 2 );
		assert.equal( 'timeout does not change when already in async mode', module.options.timeout, 20 );
		assert.equal( 'setTimeout gets called for already async path', timeoutSpy.count, 2 );
		assert.equal( 'callback triggered after timeout done in async path', callbackSpy.count, 2 );

		// Errors
		assert.throws( "delay throws if number not passed", "Time parameter not passed to assert.delay", function(){
			module.delay();
		});
		assert.throws( "delay throws when not extending timeout", "delay time doesn't extend further than the current timeout", function(){
			module._timerStart = now;
			module.options = { timeout: 20 };
			module.delay( 0, callbackSpy );
		});
	},

	// Skipped tests
	skip: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			requireSpy = assert.spy( module, 'requireState', { passthru: true } ),
			mock = {},
			_skipped = MUNIT.skipped,
			_passed = MUNIT.passed,
			_failed = MUNIT.failed;

		// Require active state for skipped tests
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		assert.throws( 'throw on non active states', /'a.b.c' hasn't been triggered yet/, function(){
			module.skip();
		});
		assert.equal( 'requireState triggered', requireSpy.count, 1 );
		assert.deepEqual( 'requireState args', requireSpy.args, [ MUNIT.ASSERT_STATE_ACTIVE, module.skip ] );
		module.state = MUNIT.ASSERT_STATE_ACTIVE;


		// Require a name
		assert.throws( 'throw with no name', /Skip name not provided on 'a.b.c'/, function(){
			module.skip();
		});

		// Require a reason
		assert.throws( 'throw with no reason', /Skip reason not provided on 'a.b.c'/, function(){
			module.skip( 'test' );
		});

		// Throw on dupes
		module.tests.dupe = {};
		assert.throws( 'throw on duplicate test', /Duplicate Test 'dupe' on 'a.b.c'/, function(){
			module.skip( 'dupe', 'dupe reason' );
		});

		// Successful skip
		module = MUNIT.Assert( 'a.b.c' );
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		MUNIT.skipped = MUNIT.passed = MUNIT.failed = 0;
		module.skip( 'skipped', 'this needs to be skipped' );

		// Check all expected results
		assert.equal( 'munit skipped', MUNIT.skipped, 1 );
		assert.equal( 'module skipped', module.skipped, 1 );
		assert.equal( 'module count', module.count, 1 );
		assert.exists( 'module tests match', module.tests.skipped );
		assert.equal( 'module list length', module.list.length, 1 );

		// Restore counts
		MUNIT.skipped = _skipped;
		MUNIT.passed = _passed;
		MUNIT.failed = _failed;
	},

	// Utility method for deep object matching (throws exact keys mismatch)
	_objectMatch: function( assert ) {
		var module = MUNIT.Assert();

		function TestObject(){
			this.a = true;
			this.b = false;
		}
		TestObject.prototype = {
			custom: function(){}
		};

		// Success
		[

			{
				name: "Basic Object",
				actual: { a: true },
				expected: { a: true }
			},

			{
				name: "Nested",
				actual: { a: true, b: [ 1, 2, 3 ] },
				expected: { a: true, b: [ 1, 2, 3 ] }
			},

			{
				name: "Basic Array",
				actual: [ null, undefined ],
				expected: [ null, undefined ]
			},

			{
				name: "Nested Array",
				actual: [ { a: true }, "string" ],
				expected: [ { a: true }, "string" ]
			},

			{
				name: "Class Matching",
				actual: [ new TestObject() ],
				expected: [ { a: true, b: false } ]
			}

		].forEach(function( test ) {
			assert.doesNotThrow( test.name, function(){
				module._objectMatch( test.actual, test.expected );
			});
		});

		// Failures
		[

			{
				name: "Fail Array Length",
				actual: [ 1, 2, 3, 4 ],
				expected: [ 1, 2, 3, 4, 5 ],
				message: "\nActual: actual.length = 4" +
					"\nExpected: expected.length = 5"
			},

			{
				name: "Fail Array Match",
				actual: [ 1, 2, 3, 4 ],
				expected: [ 1, 2, 8, 4 ],
				message: "\nActual: actual[2] = 3" +
					"\nExpected: expected[2] = 8"
			},

			{
				name: "Fail Object Length",
				actual: { a: true },
				expected: { a: true, b: true },
				message: "\nActual: actual.length = 1" +
					"\nExpected: expected.length = 2"
			},

			{
				name: "Fail Object Match",
				actual: { a: true },
				expected: { a: false },
				message: "\nActual: actual[a] = true" +
					"\nExpected: expected[a] = false"
			},

			{
				name: "Fail Type Match",
				actual: 10,
				expected: "10",
				message: "\nActual: actual = 10" +
					"\nExpected: expected = 10"
			},

			{
				name: "Fail Nested",
				actual: { a: true, b: [ 1, 2, 3, { c: 'd', e: { f: false } } ] },
				expected: { a: true, b: [ 1, 2, 3, { c: 'd', e: { f: true } } ] },
				message: "\nActual: actual[b][3][e][f] = false" +
					"\nExpected: expected[b][3][e][f] = true"
			}

		].forEach(function( test ) {
			try {
				module._objectMatch( test.actual, test.expected );
			}
			catch ( e ) {
				if ( munit.isError( e ) ) {
					throw e;
				}

				assert.equal( test.name, e, test.message);
			}
		});
	},

	// Test error matching utility
	_errorMatch: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' );

		[

			{
				name: 'No Match Pass',
				args: [ new Error( "test 123" ) ],
				result: { passed: true }
			},

			{
				name: 'Non Error/String Pass',
				args: [ 2513, 2513 ],
				result: { passed: true }
			},

			{
				name: 'Non Error/String Fail',
				args: [ 2513, null ],
				result: { passed: false, extra: "Match object 'null' does not match error '2513'" }
			},

			{
				name: 'Class Match',
				args: [ new Error( "test 123" ), Error ],
				result: { passed: true }
			},

			{
				name: 'Subclass Match',
				args: [ new MUNIT.AssertionError( "test 123" ), Error ],
				result: { passed: true }
			},

			{
				name: 'Class Match Fail',
				args: [ new Error( "test 123" ), MUNIT.AssertionError ],
				result: { passed: false, extra: "Error does not match class 'AssertionError'" }
			},

			{
				name: 'Regex Match',
				args: [ new Error( "test 123" ), /test 123/ ],
				result: { passed: true }
			},

			{
				name: 'Regex Match with thrown string',
				args: [ "test 123", /test 123/ ],
				result: { passed: true }
			},

			{
				name: 'Regex Match Fail',
				args: [ new Error( "test 123" ), /test 321/ ],
				result: { passed: false, extra: "Regex (" + ( /test 321/ ) + ") could not find match on:\ntest 123" }
			},

			{
				name: 'String Match',
				args: [ new Error( "test 123" ), "test 123" ],
				result: { passed: true }
			},

			{
				name: 'String Match with thrown string',
				args: [ "test 123", "test 123" ],
				result: { passed: true }
			},

			{
				name: 'String Match Fail',
				args: [ new Error( "test 123" ), "test 321" ],
				result: { passed: false, extra: "Error message doesn't match:\nActual: test 123\nExpected: test 321" }
			},

			{
				name: 'Unknown Match Fail',
				args: [ new Error( "test 123" ), 123 ],
				result: { passed: false, extra: "Unknown error match type '123'" }
			},

		].forEach(function( object ) {
			assert.deepEqual( object.name, module._errorMatch.apply( module, object.args ), object.result );
		});
	},

	// Logging against modules/keys
	log: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			minSpy = assert.spy( module, 'requireMinState', { passthru: true } ),
			maxSpy = assert.spy( module, 'requireMaxState', { passthru: true } );

		// Check for internal properties quickly to catch testing errors
		assert.isArray( '_logs', module._logs );

		// Basic addition
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.doesNotThrow( "Log shouldn't throw when active", function(){
			module.log( "message" );
		});
		assert.equal( 'requireMinState triggered', minSpy.count, 1 );
		assert.deepEqual( 'requireMinState args', minSpy.args, [ MUNIT.ASSERT_STATE_SETUP, module.log ] );
		assert.equal( 'requireMaxState triggered', maxSpy.count, 1 );
		assert.deepEqual( 'requireMaxState args', maxSpy.args, [ MUNIT.ASSERT_STATE_TEARDOWN, module.log ] );
		assert.deepEqual( '_logs match', module._logs, [ [ 'message' ] ] );

		// Successful additions
		assert.doesNotThrow( "log() shouldn't throw when in setup, active, or teardown states", function(){
			module.state = MUNIT.ASSERT_STATE_SETUP;
			module.log( "setup safe" );
			module.state = MUNIT.ASSERT_STATE_ACTIVE;
			module.log( "active safe" );
			module.state = MUNIT.ASSERT_STATE_TEARDOWN;
			module.log( "teardown safe" );
		});

		// Test throw states
		assert.throws( "log() throws when state less than setup", "'a.b.c' hasn't been triggered yet", function(){
			module.state = MUNIT.ASSERT_STATE_DEFAULT;
			module.log( "default unsafe" );
		});
		assert.throws( "log() throws when state greater than teardown", "'a.b.c' is closed", function(){
			module.state = MUNIT.ASSERT_STATE_CLOSED;
			module.log( "closed unsafe" );
		});
	},

	// Filter log util
	_filterLogs: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' );

		// Sanity check
		assert.isFunction( '_filterLogs', module._filterLogs );
		assert.isArray( '_logs', module._logs);

		// Full test
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.tests = { message: {}, "other test": {} };
		assert.doesNotThrow( "Adding logs shouldn't throw an error", function(){
			module.log( "message", 1, 2, 3 );
			module.log( "This will be a global key", 1, 2, 3 );
			module.log( "other test", { a: true, b: false } );
			module.log( "Another Global Key", [ 1, 2, 3 ] );
			module.log( "other test", { a: true, b: { c: 'd' } } );
		});
		assert.deepEqual( '_filterLogs match',  module._filterLogs(), {
			all: [
				[ "This will be a global key", 1, 2, 3 ],
				[ "Another Global Key", [ 1, 2, 3 ] ]
			],
			keys: {
				"message": [
					[ 1, 2, 3 ]
				],
				"other test": [
					[ { a: true, b: false } ],
					[ { a: true, b: { c: 'd' } } ]
				]
			}
		});

		// Test with assertions
		module = MUNIT.Assert( 'a.b.c' );
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.doesNotThrow( "Adding logs with assertions shouldn't throw an error", function(){
			module.log( 'test' );
			module.log( 'util', 938.34 );
			module._addResult( 'core' );
			module.log( 'another message' );
			module.log( 'core', true );
			module._addResult( 'util' );
			module.log( 'global message' );
			module.log( 'util', 'after message' );
			module.log( 'core', 'after message' );
			module.log( 'global message 2' );
		});
		assert.deepEqual( '_filterLogs match with assertions',  module._filterLogs(), {
			all: [
				[ 'global message' ],
				[ 'global message 2' ]
			],
			keys: {
				core: [
					[ 'test' ],
					[ true ],
					[ 'after message' ]
				],
				util: [
					[ 938.34 ],
					[ 'another message' ],
					[ 'after message' ]
				]
			}
		});
	},

	// Adding results
	_addResult: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			error = new Error( "Test Error" ),
			result;

		// Success result
		module._addResult( 'pass' );
		result = module.tests.pass;
		assert.exists( 'successful test exists', result );
		assert.equal( 'result name', result.name, 'pass' );
		assert.equal( 'only one entry added to test list', module.list.length, 1 );
		assert.equal( 'single list entry is result', module.list[ 0 ], result );
		assert.equal( 'only one entry added to logs list', module._logs.length, 1 );
		assert.equal( 'single logs entry is result', module._logs[ 0 ], result );

		// Failed result
		module._addResult( 'failed', error );
		result = module.tests.failed;
		assert.exists( 'failed test exists', result );
		assert.equal( 'failed result name', result.name, 'failed' );
		assert.equal( 'failed error', result.error, error );
	},

	// Create submodules of current module
	module: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			modSpy = assert.spy( MUNIT, '_module' ),
			maxSpy = assert.spy( module, 'requireMaxState', { passthru: true } ),
			Slice = Array.prototype.slice;

		// Submodule should throw an error when in a greater than active state
		module.state = MUNIT.ASSERT_STATE_TEARDOWN;
		assert.throws( "Submodules are disabled after active state", /'a.b.c' is in the teardown processs/, function(){
			module.module( "another submod" );
		});
		module.state = MUNIT.ASSERT_STATE_DEFAULT;

		// Check max state arguments and trigger
		assert.equal( 'requireMaxState triggered', maxSpy.count, 1 );
		assert.deepEqual( 'requireMaxState args', maxSpy.args, [ MUNIT.ASSERT_STATE_ACTIVE, module.module ] );

		// Test multiple passthrough options
		[

			{
				name: 'basic',
				args: [ 'submod' ],
				match: [ 'submod', undefined, undefined, { nsprefix: 'a.b.c' } ]
			},

			{
				name: 'options and callback',
				args: [ 'submod', { expect: 234 }, munit.noop ],
				match: [ 'submod', { expect: 234 }, munit.noop, { nsprefix: 'a.b.c' } ]
			},

			{
				name: 'object of submodules',
				args: [ { submod1: munit.noop, submod2: munit.noop } ],
				match: [ { submod1: munit.noop, submod2: munit.noop }, undefined, undefined, { nsprefix: 'a.b.c' } ]
			}

		].forEach(function( object ) {
			module.module.apply( module, object.args );
			assert.deepEqual( object.name, modSpy.args, object.match );
		});
	}

});


// Lower priority tests
munit( 'assert.core', { priority: munit.PRIORITY_LOWEST }, {

	// Custom assertion addition
	custom: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			maxSpy = assert.spy( module, 'requireMaxState', { passthru: true } );

		// Throw when module is past the active state
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.throws( 'Attempting custom on non-default module', /'a.b.c' is active/, function(){
			module.custom( 'abcdef', munit.noop );
		});

		// Check max state arguments and trigger
		assert.equal( 'requireMaxState triggered', maxSpy.count, 1 );
		assert.deepEqual( 'requireMaxState args', maxSpy.args, [ MUNIT.ASSERT_STATE_DEFAULT, module.custom ] );
		module.state = MUNIT.ASSERT_STATE_DEFAULT;

		// Blocking on reserved words
		assert.throws(
			'Block on reserved words',
			/'once' is a reserved name and cannot be added as a custom assertion test/,
			function(){
				module.custom( "once", munit.noop );
			}
		);

		// Basic Addition
		assert.empty( 'Initial check', module.assertCustom );
		module.custom( 'assertCustom', function(){});
		assert.isFunction( 'assertCustom module', module.assertCustom );
		assert.empty( 'assertCustom not global', MUNIT.Assert.prototype.assertCustom );
	},

	// Option changing
	option: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c', null, { expect: 10, timeout: 25, setup: null } ),
			maxSpy = assert.spy( module, 'requireMaxState', { passthru: true } );

		// Test initial set
		assert.equal( 'getter expect', module.option( 'expect' ), 10 );
		assert.equal( 'getter timeout', module.option( 'timeout' ), 25 );
		assert.equal( 'getter setup', module.option( 'setup' ), null );
		assert.equal( 'requireMaxState not triggered on read', maxSpy.count, 0 );

		// Changing list of options
		assert.doesNotThrow( 'Changing Options in Default State', function(){
			module.option({ expect: 50, timeout: 100 });
		});
		assert.equal( 'change not to setup', module.option( 'setup' ), null );
		assert.equal( 'change expect', module.option( 'expect' ), 50 );
		assert.equal( 'change timeout', module.option( 'timeout' ), 100 );
		assert.equal( 'requireMaxState triggered only on set', maxSpy.count, 2 );
		assert.deepEqual( 'requireMaxState args', maxSpy.args, [ MUNIT.ASSERT_STATE_ACTIVE, module.option ] );

		// Single option change
		assert.doesNotThrow( 'Changing Async Option', function(){
			module.option( 'expect', 5 );
		});
		assert.equal( 'change single option expect', module.option( 'expect' ), 5 );

		// Fail in non active state
		module.state = MUNIT.ASSERT_STATE_TEARDOWN;
		assert.throws( 'fail option in teardown process', /'a.b.c' is in the teardown processs/, function(){
			module.option( 'expect', 7 );
		});

		// Extra fail check when attemping to change setup option past setup state
		module.state = MUNIT.ASSERT_STATE_SETUP;
		assert.throws( 'fail setup option in setup state', /'a.b.c' is already past the setup phase, can't change the setup option/, function(){
			module.option( 'setup', munit.noop );
		});

		// Sanity check that setup option change doesn't fail in default state
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		assert.doesNotThrow( 'setup option change success in default state', function(){
			module.option( 'setup', munit.noop );
		});
		assert.equal( 'Setup option changed', module.option( 'setup' ), munit.noop );
	}

});
