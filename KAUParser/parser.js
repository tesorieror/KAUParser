/**
 * New node file
 */

// process.argv.forEach(function(val, index) {
// console.log(index + " : " + val);
// });
// var fs = require('fs');
var fs = require("q-io/fs");
var q = require('q');
var os = require('os');
var _ = require('underscore');
var c = require('./common');

var INDIR = './input/';
var DICDIR = './dictionaries/';
var OUTDIR = './output/';
/**
 * Config
 */

q.longStackSupport = true;

function getInputFile(filename) {
	return INDIR + filename;
}

function getDictionaryFile(filename) {
	return DICDIR + filename;
}

function toArray(csv) {
	var lines = csv.split('\r' + os.EOL);
	lines = _.map(lines, function(line) {
		return line.split(';');
	});
	// lines = _.filter(lines, function(line) {
	// return line[0].length > 0;
	// });
	// lines = _.without(lines, lines[0]);
	return lines;
}

function removeEmptyKeys(lines) {
	return _.filter(lines, function(line) {
		return line[0].length > 0;
	});
}

function removeHeader(lines) {
	return _.without(lines, lines[0]);
}

/*******************************************************************************
 * Parse Dictionaries
 * 
 * @param key
 * @returns
 */
function processKey(key) {
	return c.trimAll(key.toLowerCase());
}
function parseDict(f, overwrite) {

	var connectors = [ 'a', 'the', 'of' ];

	var dictionary = {};

	var dictionaryByID = {};

	function processLines(lines) {
		return _.map(lines, function(line) {
			return [ processKey(line[0]), processValue(line[1]) ];
		});
	}

	function processValue(value) {

		var result = c.trim(value);
		var result = result.toLowerCase();
		var words = result.split(" ");

		var words = _.map(words, function(word) {
			return _.contains(connectors, word) ? word : c.firstToUpperCase(word);
		});

		result = _.reduce(words, function(sentence, word) {
			return sentence + ' ' + word;
		}, '');
		result = c.firstToUpperCase(result.trim());

		return result;
	}

	function writeDictionary(f) {
		return function(data) {
			// return q.nfcall(fs.writeFile, f, data, 'utf8')//
			return fs.write(f, data)//
			.then(function(res) {
				return data;
			});
		}
	}

	function addLineToDictionary(line) {
		var achro = createAchronym(line);
		if (overwrite) {
			throw Error('Overwrite not supported yet!');
		}
		if (!dictionary[line[0]]) {
			line[2] = achro;
			dictionary[line[0]] = line;
			dictionaryByID[achro] = line;
			temp = line[0];
		}
		return line;
	}

	function addLinesToDictionary(lines, rep) {
		_.each(lines, function(line) {
			addLineToDictionary(line);
		});
		return lines;
	}

	function addToDictionaryBase(lines) {
		// Remove key duplications
		lines = _.uniq(lines, function(line) {
			return line[0];
		});

		return addLinesToDictionary(lines, 0);
	}

	function createAchronym(line) {
		var desc = line[1].replace(/\W+/g, ' ');

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

		// Avoid Achronym repotition
		var test = result;
		var rep = 0;
		while (rep >= 0) {
			if (dictionaryByID[test] && dictionaryByID[test][1] != line[1]) {
				console.error(test + ': [' + dictionaryByID[test][1] + ' <> ' + line[1] + ']');
				rep++;
				test = result + rep;
			} else {
				rep = -1
			}
		}
		result = test;
		return result;
	}

	function toCSV(lines) {
		return _.reduce(lines, function(result, line) {
			line[2] = createAchronym(line);
			return result + line[0] + ';' + line[1] + ';' + line[2] + '\r' + os.EOL;
		}, '');
	}

	/**
	 * Body of parser
	 */

	// console.log('Parsing ' + f);
	// console.log(getDictionaryFile(f));
	// return q.nfcall(fs.stat, getDictionaryFile(f))//
	return fs.stat(getDictionaryFile(f))//
	.then(function(data) {
		console.log(f + ' dictionary found!');
		// return q.nfcall(fs.readFile, getDictionaryFile(f), 'utf8')//
		return fs.read(getDictionaryFile(f))//
		.then(toArray)//
		.then(removeEmptyKeys)//
		.then(removeHeader)//
		.then(addToDictionaryBase);
	}, function(err) {
		console.error(f + ' dictionary NOT found!');
		return err;
	})//
	// .then(q.nfbind(fs.readFile, getInputFile(f), 'utf8'))//
	.then(function(data) {
		return fs.read(getInputFile(f));
	})//
	.then(toArray)//
	.then(removeEmptyKeys)//
	.then(removeHeader)//
	.then(processLines)//
	.then(addToDictionaryBase)//
	.then(toCSV)//
	.then(writeDictionary(getDictionaryFile(f)))//
	;
}

/**
 * Parse tags
 * 
 * @param f
 * @returns
 */
function parseTags(f) {
	// console.log('Parsing ' + f);

	var dictionaries = [];
	var dictionariesById = [];

	function getTagFile(f) {
		return INDIR + f;
	}

	function getTagOutputFile(f) {
		return OUTDIR + 'tag-' + f.replace(/-tag\.csv$/g, '') + '.json';
	}

	function addToDictionary(f) {
		var cat = f.replace(/-dict\.csv$/g, '').toLowerCase();
		// console.log('Category: ', cat);
		return function(lines) {
			if (!dictionaries[cat]) {
				dictionaries[cat] = [];
			}
			if (!dictionariesById[cat]) {
				dictionariesById[cat] = [];
			}
			_.each(lines, function(line) {
				if (dictionaries[cat][line[0]]) {
					throw Error('Key ' + line[0] + ' already exists in category ' + cat + '!');
				}
				dictionaries[cat][line[0]] = line;

				if (dictionariesById[cat][line[2]] && dictionariesById[cat][line[2]][1] != line[1]) {
					throw Error('Key ' + line[2] + ' ' + line[1] + ' already exists in category ' + cat + '!');
				}
				dictionariesById[cat][line[2]] = line;
			});
			return [ dictionaries[cat] ].concat(dictionariesById[cat]);
		};
	}

	function loadDictionary(f) {

		// return q.nfcall(fs.stat, getDictionaryFile(f))//
		return fs.stat(getDictionaryFile(f))//
		.then(function(data) {
			console.log(f + ' dictionary found!');
			// return q.nfcall(fs.readFile, getDictionaryFile(f), 'utf8')//
			return fs.read(getDictionaryFile(f))//
			.then(toArray)//
			.then(removeEmptyKeys)//
			// .then(removeHeader)//
			.then(addToDictionary(f));
		}, function(err) {
			console.error(f + ' dictionary NOT found!');
			throw err;
		});
	}

	function loadDictionaries(lines) {
		var dictFiles = _.map(lines[0], function(cat) {
			return (cat + '-dict.csv').toLowerCase();
		});

		var dictLoaders = _.map(dictFiles, function(file) {
			return loadDictionary(file);
		});

		return q.all(dictLoaders).then(function(data) {
			// console.log(Object.keys(dictionaries));
			// console.log(Object.keys(dictionaries['in']));
			return data;
		});

	}

	var tagLines = [];

	var tags = [];

	function fillTags() {
		// console.log('Filling tags...', tagLines.length);
		var categories = tagLines[0];
		// Categories in lowercase
		categories = _.map(categories, function(cat) {
			return cat.toLowerCase();
		});
		var tagLinesBody = _.without(tagLines, tagLines[0]);
		_.each(tagLinesBody, function(tagLine) {
			var key = dictionaries[categories[0]][processKey(tagLine[0])][2];

			if (!tags[key]) {
				tags[key] = {
					category : categories[0].toUpperCase(),
					name : key.toUpperCase(),
					description : dictionaries[categories[0]][processKey(tagLine[0])][1],
					tags : []
				};
			}
			var deps = [];
			for (var i = 1; i < categories.length; i++) {
				var cat = categories[i];
				// console.log(cat);
				// console.log(processKey(tagLine[i]));
				// console.log(dictionaries[cat][processKey(tagLine[i])]);
				// console.log(dictionaries[cat]);
				deps.push({
					'category' : cat.toUpperCase(),
					'tag' : dictionaries[cat][processKey(tagLine[i])][2]
				});
			}
			tags[key].tags.push(deps);
		});
		return tags;
	}

	// return q.nfcall(fs.readFile, getTagFile(f), 'utf8')//
	return fs.read(getTagFile(f))//
	// .then(c.log(f + ' loaded!', true), c.error(f + ' cannot be loaded!'))//
	.then(toArray)//
	.then(removeEmptyKeys)//
	.then(function(lines) {
		tagLines = lines;
		return lines;
	})//
	.then(loadDictionaries)//
	.then(fillTags)//
	.then(filterDuplicities)//
	.then(toJSON)//
	.then(toFile(getTagOutputFile(f)))// .then(c.log('OK', true),
	// c.error("Error"))//
	;
}

function filterDuplicities(tags) {
	for ( var key in tags) {
		tags[key].tags = _.uniq(tags[key].tags, false, function(tag) {
			return JSON.stringify(tag);
			// return tag.toString();
		});
	}
	return tags;
}

function toJSON(tags) {
	var result = [];
	for ( var key in tags) {
		result.push(tags[key]);
	}
	return JSON.stringify(result);
}

function toFile(f) {
	// console.log("File", f);
	return function(data) {
		// return q.nfcall(fs.writeFile, f, data, 'utf8')//
		return fs.write(f, data)//
		.then(function(result) {
			return data;
		});
	}
}

/*******************************************************************************
 * Parse Categories
 * 
 * @param f
 * @returns
 */

function parseCategories(f) {
	// { "name" : " IN " , "description" : " Institution " , "order" : " 3 " }
	// console.log('Category file: ', INDIR + f);

	var dictionary = [];

	function createCategoryPromise(line) {
		return function(tags) {
			// console.log(tags);
			return {
				"name" : line[0],
				"description" : line[1],
				"tags" : _.map(tags, function(tag) {
					return tag.name;
				})
			};
		};
	}

	function processLine(line) {
		return fs.read(OUTDIR + 'tag-' + line[0].toLowerCase() + '.json')//
		// return q.nfcall(fs.readFile, OUTDIR + 'tag-' + line[0].toLowerCase() +
		// '.json', 'utf8')//
		.then(JSON.parse)//
		// .then(c.log("JSON", true), c.error("JSON ERROR"))//
		.then(createCategoryPromise(line))//
		;
	}

	function processLines(lines) {
		return q.all(_.map(lines, function(line) {
			return processLine(line);
		}));
	}

	// return q.nfcall(fs.readFile, getInputFile(f), 'utf8')//
	return fs.read(getInputFile(f))//
	.then(toArray)//
	.then(removeEmptyKeys)//
	.then(removeHeader)//
	.then(processLines)//
	.then(JSON.stringify)//
	// .then(function(data) {
	// console.log(data);
	// return data;
	// })//
	// .then(q.nfbind(fs.writeFile, OUTDIR + f.replace(/-dict\.csv/g, '') +
	// '.json'))//
	.then(function(data) {
		var file =  'tag-category.json';
		// console.log("F ", data);
		return fs.write(OUTDIR + file, data);
		// return data;
	})//
	;
}

function parseIndicators(f) {
	// console.log(INDIR + f);
	// var address = f.split(/^.-\d+x+\d+x\d-.$/g);
	var address = f.split(/-/g);
	var size = address[1].split(/x/g);
	var col = size[0] - 1;
	var row = size[1] - 1;
	var offset = parseInt(size[2]);
	console.log(row, col, offset);

	return fs.read(INDIR + f)//
	.then(toArray)//
	.then(function(indicators) {

		var hrow = row - 1
		var hcol = col - 1 + offset + 1;
		var vCats = _.first(indicators[hrow], offset);
		var hCats = [];

		// console.log(hcol);

		for (var r = hrow; r >= 0; r--) {
			var cat = indicators[r][hcol];
			if (cat) {
				hCats[r] = cat;
			}
		}

		var cats = hCats.concat(vCats);

		var readDictionaryPromises = _.map(cats, function(cat) {
			return fs.read(getDictionaryFile(cat.toLowerCase() + '-dict.csv'))//
			.then(toArray)//
			.then(removeEmptyKeys)//
		});

		var dictionaries = [];

		return q.all(readDictionaryPromises)//
		.then(function(data) {
			for (var i = 0; i < data.length; i++) {
				var cat = cats[i];
				if (!dictionaries[cat]) {
					dictionaries[cat] = [];
				}
				_.each(data[i], function(line) {
					dictionaries[cat][line[0]] = line[2];
				});
			}
			return dictionaries;
		})//
		.then(function(data) {

			var result = [];

			for (var r = row; r < indicators.length; r++) {

				var vTags = [];

				for (var c = 0; c < col; c++) {
					var key = dictionaries[indicators[1][c]][processKey(indicators[r][c])];
					if (key == undefined) {
						throw Error('Key not found ' + indicators[r][c] + ' in ' + indicators[1][c]);
					}
					// console.log('cat: ', indicators[1][c], ' tag: ', key);
					vTags.push({
						category : indicators[1][c],
						name : key
					});
				}

				// console.log("vTags",vTags);

				for (var c = offset; c < col + offset; c++) {
					var tags = vTags.slice(0);
					// console.log("TAGS",vTags);
					var cat = indicators[0][hcol];
					var dict = dictionaries[cat];
					// console.log(Object.keys(dictionaries));
					var k = indicators[0][c];
					// console.log('cat: ', cat, 'k: ', k);
					var tag = dict[processKey(k)];
					// console.log('cat: ', cat, ' tag: ', tag);
					tags.push({
						category : cat,
						name : tag
					});

					cat = indicators[1][hcol];
					dict = dictionaries[cat];
					tag = dict[processKey(indicators[1][c])];
					// console.log('cat: ', cat, ' tag: ', tag);
					tags.push({
						category : cat,
						name : tag
					});
					// console.log('value: ', indicators[r][c]);
					result.push({
						value : indicators[r][c],
						tags : tags
					});
					// console.log('---');
				}
			}
			// console.log('result ', result);
			// return null;
			return result;
		})//
		.then(JSON.stringify)//
		.then(function(data) {
			// console.log("F:", OUTDIR + f);
			console.log('addr', address);
			var info = address[0].split(/_/g);
			// PATCH
			var file = OUTDIR + info[0] + '-' + info[1] + '-indicator_' + info[2] + '-' + info[3] + '.json';

			return fs.write(file, data).then(function(n) {
				return file;
			});
		});
	})//
	;

}

/**
 * Exports
 */

exports.parseDict = parseDict;
exports.parseTags = parseTags;
exports.parseCategories = parseCategories;
exports.parseIndicators = parseIndicators;
exports.INDIR = INDIR;
exports.DICDIR = DICDIR;
exports.OUTDIR = OUTDIR;
// process.exit(0);
