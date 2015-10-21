/**
 * http://usejsdoc.org/
 */

function KeyId() {

	this.createKeyFor = function(cat, name) {
		return cat + '-' + name;
	};

	return this;
}

module.exports.instance = new KeyId();