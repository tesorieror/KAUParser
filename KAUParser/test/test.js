/**
 * http://usejsdoc.org/
 */

function Test() {
	this.test = 'Test';
	this.sayHello = function() {
		console.log('Hello ' + this.test);
	};
	return this;
}

module.exports = new Test();
