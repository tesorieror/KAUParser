/**
 * http://usejsdoc.org/
 */

function TagCategory(array) {
	var self = this;

	this._id = array[0];
	this.name = array[0];
	this.description = array[1];
//	this.tags = [];

	return this;
}

module.exports = TagCategory;