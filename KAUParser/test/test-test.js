/**
 * http://usejsdoc.org/
 */

var T = require('./test');

function TestTest() {
	function sayHello2() {
//		console.log('Hello2');
		T.sayHello();
	}
	this.sayHello2 = sayHello2;
	return this;
}

module.exports = TestTest;