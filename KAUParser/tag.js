/**
 * http://usejsdoc.org/
 */
var _ = require('underscore');
var TagId = require('./tag-id');
// var TagDependency = require('./tag-dependency');
// var TagModel =
// require('/Users/ricardo.tesoriero/Documents/workspace_old/db.iras/model/Tag');

function Tag(categories, array) {

	// console.log('Tag categories', categories);
	// console.log('Tag array', array);

	var self = this;

	self._id = TagId.instance.createKeyFor(categories[0], array[0].id);
	self.name = array[0].id;
	self.category = categories[0];
	self.description = array[0].value;
	self.order = -1;
	self.dependencies = [];

	self.addDependency = function(cats, array) {
		// console.log('addDependency');
		depCats = _.without(cats, _.first(cats));
		depArray = _.without(array, _.first(array));

		var tags = _.map(depCats, function(cat) {
			return TagId.instance
					.createKeyFor(cat, depArray[depCats.indexOf(cat)].id)
		});

		self.dependencies.push({
			tags : tags
		});
	}

	if (categories.length > 1) {
		self.addDependency(categories, array);
	}
	return this;
}

module.exports = Tag;