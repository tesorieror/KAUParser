/**
 * New node file
 */

var fs = require("q-io/fs");
var q = require('q');
var os = require('os');
var _ = require('underscore');
var c = require('./common');
var FM = require('./file-manager');
var Dictionary = require('./dictionary');
var Translator = require('./translator');
var Tag = require('./tag');
var DB = require('/Users/ricardo.tesoriero/Documents/workspace_old/db.iras/db');
var TagCategory = require('./tag-category');
var Translator = require('./translator')
var Indicator = require('./indicator')

q.longStackSupport = true;

function Parser() {

	/*****************************************************************************
	 * Parse Dictionaries
	 */

	this.parseDicts = function() {
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
	}

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

	/*****************************************************************************
	 * Parse Tags
	 */

	this.parseTags = function() {
		console.log('parseTags');
		return FM.instance.getInputTagFiles() //
		.then(readTagFiles)//
		.then(translateTags)//
		.then(toTags)//
		.then(c.log('after toTags', false), c.error('after toTags'))//	
		.then(storeTags)//
		.then(c.log('after store', false), c.error('after store'))//		
	}

	function readTagFiles(files) {
		return q.all(_.map(files, function(file) {
			return file.readAsArrays();
		}));
	}

	function translateTags(arrayLists) {
		return q.all(_.map(arrayLists, function(arrays) {
			return Translator.translate(arrays);
		}));
	}

	function toTags(arrayLists) {
		console.log('toTags');
		return _.map(arrayLists, function(arrays) {
			var cats = _.first(arrays);
			var body = _.without(arrays, cats);
			var tagDict = [];
			_.each(body, function(array) {

				var tag = tagDict[array[0].id];
				if (!tag) {
					tagDict[array[0].id] = new Tag(cats, array);
				} else {
					tagDict[array[0].id].addDependency(cats, array);
				}
			});
			return _.values(tagDict);
		});
	}

	function storeTags(tagLists) {
		console.log('store');
		return DB.instance.removeTags()//
		.then(q.all(_.map(tagLists, function(tags) {
			return DB.instance.addTags(tags);
		})))
	}

	/*****************************************************************************
	 * Parse Categories
	 */

	this.parseCategories = function() {
		console.log('parseCategories');
		return FM.instance.getInputCategoryFiles() //
		.then(readTagCategoryFiles)//
		.then(storeCategories)
		// .then(c.log('after readTagFiles', true), c.error('after readTagFiles'));
	}

	function readTagCategoryFiles(files) {
		return q.all(_.map(files, function(file) {
			return file.readAsArrays()//
			.then(toTagCategories)
		}));
	}

	function toTagCategories(arrays) {
		var header = arrays[0];
		arrays = _.without(arrays, header);
		return _.map(arrays, function(arr) {
			return new TagCategory(arr);
		});
	}



	function storeCategories(tagCategoryLists) {
		
		function addTagCategories() {
			return q.all(_.map(tagCategoryLists, function(tagCategories) {
				return DB.instance.addTagCategories(tagCategories);
			}));
		}		
		
		return DB.instance.removeTagCategories()//
		.then(addTagCategories)//
		.then(c.log('after addTagCategories', false),
				c.error('after addTagCategories'));//		
	}

	/*****************************************************************************
	 * Parse Indicators
	 * 
	 */

	this.parseIndicators = function() {
		return FM.instance.getInputIndicatorFiles() //
		.then(parseIndicatorFiles)
	};

	function parseIndicatorFiles(files) {
		return q.all(_.map(files, function(file) {
			return parseIndicatorFile(file);
		}));
	}

	function parseIndicatorFile(file) {
		return file.readAsArrays()//		
		.then(processArray(file.getInfo()))//
		.then(translate)//
		.then(toIndicators)//
		.then(checkIds)//
		.then(c.log("after checkIds", false), c.error("after checkIds"))//
		.then(storeIndicators)//
		.then(c.log("after parseIndicatorFile", false),
				c.error("after parseIndicatorFile"))//				
	}

	function storeIndicators(indicators) {
		console.log('storeIndicators', indicators.length)
		return DB.instance.removeIndicators()//		
		.then(function(data) {
			console.log('after removeIndicators')
			console.log('indicators', indicators.length)
			// return data;
			return DB.instance.addIndicators(indicators)
		})
	}

	function translate(indicators) {

		function removeValues(indicators) {
			var values = [];

			// Remove values
			for (var r = 1; r < indicators.length; r++) {
				var val = indicators[r].splice(indicators[r].length - 1, 1);
				values = values.concat(val);
			}
			return values;
		}

		// Add values
		function addValues(indicators, values) {
			for (var r = 1; r < indicators.length; r++) {
				indicators[r].push(values[r - 1]);
			}
			return indicators;
		}

		var categories = indicators[0];

		var values = removeValues(indicators);

		return Translator.translate(indicators)//
		.then(function(indicators) {
			var indicators = addValues(indicators, values);
			// logIndicators(indicators);
			return indicators;
		})
	}

	function processArray(info) {
		return function(arrays) {
			var categories = info.getCategories(arrays);
			var indicators = [];
			for (var r = info.row; r < arrays.length; r++) {
				for (var c = info.col; c < info.col + info.offset; c++) {
					var indicatorArray = info.getTags(arrays, r, c);
					indicatorArray.push(arrays[r][c]);
					indicators.push(indicatorArray);
				}
			}
			return [ categories ].concat(indicators);
		}
	}

	function logIndicators(indicators) {
		console.log('indicators', indicators.length);
		console.log(indicators[0]);
		console.log(indicators[1]);
		console.log(indicators[indicators.length - 1]);
	}

	function toIndicators(arrays) {
		var categories = arrays[0];
		arrays = _.without(arrays, categories);

		return _.map(arrays, function(array) {
			return new Indicator(categories, array)
		});
	}

	function checkIds(indicators) {

		var allids = [];
		var actual = 0;
		var errors = 0;
		console.log('checkIds indicators', indicators.length)

		_.each(indicators, function(indicator) {
			var key = indicator._id;
			var index = Object.keys(allids).indexOf(key);

			if (index < 0) {
				allids[key] = indicator;
			} else {
				var rowPrev = Math.floor(index / 9) + 3;
				var colPrev = index % 9;
				var valPrev = allids[key].value;
				var rowActual = Math.floor(actual / 9) + 3;
				var colActual = actual % 9;
				var valActual = indicator.value
				throw Error('Key:' + key + '\nPrev:' + index + ' ,row:' + rowPrev
						+ ' ,col:' + colPrev + ' value:' + valPrev + '\nActual:' + actual
						+ ' , row:' + rowActual + ' ,col:' + colActual + ' value: '
						+ valActual);
				errors = errors + 1;
			}
			actual++;
		});
		if (errors == 0) {
			console.log("INDICATOR CHECK OK!");
		} else {
			console.error('Errors ' + errors)
		}
		return indicators;
	}

	return this;
}

module.exports.instance = new Parser();
