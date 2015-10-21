/**
 * http://usejsdoc.org/
 */
var _ = require('underscore');
var os = require('os');
var s = require('./string-utils.js');

function Line(arr) {
	var content = arr;

	var connectors = [ 'a', 'the', 'of' ];

	function isKeyEmpty() {
		return getNormKey().length > 0
	}

	function getKey() {
		return content[0];
	}

	function getNormKey() {
		return s.normalizeKey(getKey());
	}

	function getValue() {
		return content[1];
	}

	function getNormValue() {
		var result = s.trim(getValue());
		var result = result.toLowerCase();
		var words = result.split(' ');

		var words = _.map(words, function(word) {
			return _.contains(connectors, word) ? word : s.firstToUpperCase(word);
		});

		result = _.reduce(words, function(sentence, word) {
			return sentence + ' ' + word;
		}, '');
		result = s.firstToUpperCase(result.trim());

		return result;
	}

	function getId() {
		var result = content[2];
		if (!result) {
			result = getAchronym();
		}
		return result;
	}

	function setId(id) {
		content[2] = id;
	}

	function getAchronym() {
		var desc = getNormValue().replace(/\W+/g, ' ');
		var words = desc.split(' ');
		words = _.filter(words, function(word) {
			return !_.contains(connectors, word);
		});
		result = _.map(words, function(word) {
			return word.substr(0, Math.min(word.length, 3)).toUpperCase();
		});
		result = _.reduce(result, function(key, word) {
			return key + word;
		}, '');
		return result;
	}

	function toNormJSON() {
		return [ getNormKey(), getNormValue(), getId() ];
	}

	function toNormCsv() {
		var result = getNormKey() + ';' + getNormValue() + ';' + getId() + '\r'
				+ os.EOL;
		// console.log('toNormCsv', result);
		return result;
	}

	/*****************************************************************************
	 * Exports
	 */
	this.isKeyEmpty = isKeyEmpty;
	this.getId = getId;
	this.setId = setId;
	this.getNormKey = getNormKey;
	this.getNormValue = getNormValue;
	this.toNormJSON = toNormJSON;
	this.toNormCsv = toNormCsv;
	this.getValue = getValue;
	// console.log(this.content);
	return this;

}

module.exports = Line;