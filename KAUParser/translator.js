/**
 * http://usejsdoc.org/
 */

var _ = require('underscore');
var q = require('q');
var c = require('./common');
var Dictionary = require('./dictionary');
var s = require('./string-utils');

function translate(arrays) {

	// console.log('translate');

	function getHeader() {
		return _.first(arrays);
	}

	function getBody() {
		return _.reject(_.without(arrays, getHeader()), function(array) {
			return array[0].trim().length == 0;
		});
	}

	function loadDicts() {
		// console.log('loadDicts');
		// console.log('loadDicts arrays', arrays);
		var ids = _.map(getHeader(), function(header) {
			return header.toLowerCase();
		});

		var dicts = _.map(ids, function(id) {
			// console.log('ID ',id)
			return new Dictionary(id);
		});

		return q.all(_.map(dicts, function(dict) {
			// console.log('loadDicts dict', dicts)
			return dict.loadFromOutput();
		}));
	}

	function process(dicts) {
		// console.log('process')
		var body = getBody();
		var header = getHeader();
		var result = [];

		for (var line = 0; line < body.length; line++) {
			var array = body[line];
			var elems = []
			for (var index = 0; index < array.length; index++) {
				var elem = array[index];
				elems.push(dicts[index].translate(s.normalizeKey(elem)))
			}
			result.push(elems);
		}

		return [ getHeader() ].concat(result);
	}

	return loadDicts().then(process)//

}

module.exports.translate = translate;