/**
 * http://usejsdoc.org/
 */

var _ = require('underscore');
var TagId = require('./tag-id');

function Indicator(categories, array) {

	this.value = _.last(array);
	this.tags = _.map(categories, function(cat) {
		return TagId.instance.createKeyFor(cat, array[categories.indexOf(cat)].id);
	})

	this._id = this.tags.join('_');

	return this;
}

module.exports = Indicator