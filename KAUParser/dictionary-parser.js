/**
 * http://usejsdoc.org/
 */

function parse() {
	return FM.instance.getInputDictIds() //
	.then(createDicts) //
	.then(c.log('createDics', false), c.error('createDics'))//
	.then(loadOutputDictionaries) //
	.then(c.log('after loadOutputDictionaries', false),
			c.error('after loadOutputDictionaries'))//
	.then(loadInputDictionaries) //
	.then(c.log('after loadInputDictionaries', false),
			c.error('after loadInputDictionaries'))//
	.then(saveDictionaries)//
	.then(c.log('after saveDictionaries', false),
			c.error('after saveDictionaries'))//

	/*****************************************************************************
	 * Helpers
	 */

	function createDicts(ids) {
		return _.map(ids, function(id) {
			return new Dictionary(id);
		});
	}

	function loadOutputDictionaries(dicts) {
		console.log('loadOutputDictionaries');
		return q.all(_.map(dicts, function(dict) {
			return dict.loadFromOutput();
		}));
	}

	function loadInputDictionaries(dicts) {
		console.log('loadInputDictionaries', dicts.length);
		return q.all(_.map(dicts, function(dict) {
			return dict.loadFromInput();
		}));
	}

	function saveDictionaries(dics) {
		console.log('saveInputDictionaries');
		return q.all(_.map(dics, function(dict) {
			return dict.save();
		}));
	}
}

module.exports.parse = parse;
