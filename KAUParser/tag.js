/**
 * http://usejsdoc.org/
 */
var _ = require('underscore');
var TagId = require('./tag-id');

function Tag(categories, array) {

	var self = this;

	self._id = TagId.instance.createKeyFor(categories[0], array[0].id);
	self.name = array[0].id;
	self.category = categories[0];
	self.description = array[0].value;
	self.order = -1;
	self.dependencies = [];

	self.createDependencyId = function(tags) {
		return tags.join('_');
	};

	self.addDependency = function(cats, array) {
		depCats = _.without(cats, _.first(cats));
		depArray = _.without(array, _.first(array));

		var tags = _.map(depCats, function(cat) {
			return TagId.instance
					.createKeyFor(cat, depArray[depCats.indexOf(cat)].id)
		});

		var depId = self.createDependencyId(tags);
		var depIds = _.pluck(self.dependencies, '_id')

		if (!_.contains(depIds, depId)) {
			self.dependencies.push({
				_id : depId,
				tags : tags
			});
		}

	}

	if (categories.length > 1) {
		self.addDependency(categories, array);
	}

	return this;
}

module.exports = Tag;