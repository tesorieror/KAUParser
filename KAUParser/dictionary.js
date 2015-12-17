/**
 * http://usejsdoc.org/
 */
var _ = require('underscore');
var FM = require('./file-manager');
var c = require('./common');
var Line = require('./line');

function Dictionary(id) {
	var self = this;
	self.id = id;

	var dictionary = {};
	var dictionaryByID = {};

	self.dictionary = dictionary;
	self.dictionaryByID = dictionaryByID;

	this.getId = function() {
		return self.id;
	};

	function translateValue(normKey) {
		return dictionary[normKey].getValue();
	}

	function translateId(normKey) {
//		 console.log('translateId')
//		 console.log('translateId normKey', normKey)		 
//		 console.log('dictionary', dictionary)
//		 console.log('translateId', dictionary[normKey])
		return dictionary[normKey].getId();
	}

	this.translate = function(normKey) {
		return {
			id : translateId(normKey),
			value : translateValue(normKey)
		};
	};

	function addLineToDictionary(line) {
		if (!dictionary[line.getNormKey()]) {
			assignIdToLine(line);
			dictionary[line.getNormKey()] = line;
			dictionaryByID[line.getId()] = line;
		}
		return line;
	}

	/**
	 * Avoids id repetition
	 */

	function assignIdToLine(line) {
		// console.log(self.id);
		// console.log('assignIdToLine');
		// if (self.id == 'yr') {
		// console.log('Assigning id to Line: ', line);
		// }
		var id = line.getId();
		var result = id;
		var rep = 0;
		while (rep >= 0) {
			if (dictionaryByID[result]
					&& dictionaryByID[result].getNormValue() != line.getNormValue()) {
				console.error(result + ': [' + dictionaryByID[result].getNormValue()
						+ ' <> ' + line.getNormValue() + ']');
				rep++;
				result = id + rep;
			} else {
				rep = -1
			}
		}
		line.setId(result);
	}

	function addLines(lines) {
		// console.log('addLines', lines.length);
		lines = _.uniq(lines, function(line) {
			return line.getNormKey();
		});

		_.each(lines, function(line) {
			if (line.getNormValue().indexOf('(') > 0) {
				// console.log('- line', line.getId())
				// console.log('+ line', line.getNormValue())
			}
			addLineToDictionary(line);
		});

		// console.log('addLines', self);
		return self;
	}

	function toNormJSON() {
		var result = [];
		for (k in dictionary) {
			result.push(dictionary[k].toNormJSON());
		}
		return result;
	}

	function loadFromInput() {
		// console.log('loadFromInput');
		return FM.instance.getInputDictFileForId(self.id)//
		.readAsArrays()//
		.then(toLines)//
		.then(removeEmptyKeys)//
		.then(removeHeader)//
		.then(addLines)//
		// .then(c.log('after loadFromInput', true), c.error('after
		// loadFromInput'))//
		;
	}

	function loadFromOutput() {
		// console.log('loadFromOutput');
		return FM.instance.getOutputDictFileForId(self.id)//
		.readAsArrays()//
		.then(toLines)//
		.then(removeEmptyKeys)//
		.then(addLines)//
		;
	}

	function save() {
		var data = _.map(_.values(dictionary), function(line) {
			return line.toNormCsv();
		}).join('');
		return FM.instance.getOutputDictFileForId(self.id).write(data);
	}

	function removeEmptyKeys(lines) {
		// console.log('removeEmptyKeys');
		return _.filter(lines, function(line) {
			return line.isKeyEmpty();
		});
	}

	function removeHeader(lines) {
		// console.log('removeHeader');
		return _.without(lines, lines[0]);
	}

	function toLines(arrays) {
		return _.map(arrays, function(arr) {
			var l = new Line(arr);
			return l;
		});
	}

	/*****************************************************************************
	 * Export
	 */

	this.loadFromInput = loadFromInput;
	this.loadFromOutput = loadFromOutput;
	this.save = save;
	this.toNormJSON = toNormJSON;
	return this;
}

module.exports = Dictionary;