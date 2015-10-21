/**
 * http://usejsdoc.org/
 */

function Test() {

	function sayHello() {
		console.log('Hello ' + this.test);
	}

	this.test = 'Test';
	this.sayHello = sayHello;

	return this;
}

module.exports = Test();