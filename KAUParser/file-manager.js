/**
 * http://usejsdoc.org/
 */

var fs = require("q-io/fs");
var _ = require('underscore');
var os = require('os');
var CsvFile = require('./csv-file');
var IndicatorCsvFile = require('./indicator-csv-file')
var c = require('./common');

function FileManager() {

	var INDIR = './input/';
	var DICDIR = './dictionaries/';
	var OUTDIR = './output/';

	function getInputFile(filename) {
		return INDIR + filename;
	}

	function getOutputDictFile(filename) {
		return DICDIR + filename;
	}

	// function buildInputFiles(files) {
	// console.log('buildInputFiles');
	// return _.map(files, function(f) {
	// return getInputFile(f)
	// });
	// }
	//
	// function readPromisesFrom(files) {
	// return _.map(files, function(file) {
	// return fs.read(file);
	// });
	// }
	//
	// function getLinesFrom(files) {
	// return readPromises(files)//
	// then();
	// }
	//
	// function toCsvFiles(files) {
	// return _.map(files, function(file) {
	// return new CsvFile(file);
	// });
	// }
	//
	// /*****************************************************************************
	// * Dictionary Files
	// */
	//
	// function getDictionaryFile(filename) {
	// return DICDIR + filename;
	// }
	//
	// function getInputDictionaryCsvFiles() {
	// console.log('getInputDictionaryFiles');
	// return fs.list(INDIR)//
	// .then(filterDictionaryFilenames)//
	// .then(buildInputFiles)//
	// .then(toCsvFiles);
	// }
	//

	this.getInputDictFileForId = function(id) {
		return new CsvFile(getInputFile(id + '-dict.csv'));
	}

	this.getOutputDictFileForId = function(id) {
		return new CsvFile(getOutputDictFile(id + '-dict.csv'));
	}

	this.getInputDictIds = function() {
		console.log('getInputDictIds');
		return fs.list(INDIR)//
		.then(filterDictionaryFilenames)//
		.then(dictFilesToIds);
	}

	this.getInputTagFiles = function() {
		console.log('getInputTagFilenames');
		return fs.list(INDIR)//
		.then(filterTagFilenames)//
		.then(addInputPath)//
		.then(toCsvFiles);
	}

	this.getInputCategoryFiles = function() {
		console.log('getInputCategoryFiles');
		return fs.list(INDIR)//
		.then(filterCategoryFilenames)//
		.then(c.log('after filterCategoryFilenames', true),
				c.error('after filterCategoryFilenames')).then(addInputPath)//
		.then(toCsvFiles);
	}

	function addInputPath(filenames) {
		return _.map(filenames, function(filename) {
			return getInputFile(filename);
		});
	}

	function toCsvFiles(files) {
		return _.map(files, function(file) {
			return new CsvFile(file);
		});
	}

	this.getOutputDictIds = function() {
		console.log('getOutputDictIds');
		return fs.list(DICDIR)//
		.then(filterDictionaryFilenames)//
		.then(dictFilesToIds);
	}

	function dictFilesToIds(files) {
		console.log('filesToId');
		return _.map(files, function(file) {
			return dictFileToId(file);
		});
	}

	function dictFileToId(file) {
		// console.log('fileToId');
		return file.split('-')[0];
	}

	function filterDictionaryFilenames(files) {
		console.log('filterDictionaryFilenames');
		return _.filter(files, function(file) {
			return file.match(/\-dict.csv$/g);
		});
	}

	function filterTagFilenames(files) {
		return _.filter(files, function(file) {
			return file.match(/\-tag.csv$/g);
		});
	}

	function filterCategoryFilenames(files) {
		return _.filter(files, function(file) {
			return file.match(/^categories-.+\.csv$/g);
		});
	}

	this.getInputIndicatorFiles = function() {
		return fs.list(INDIR)//
		.then(filterIndicatorFilenames)//
		.then(c.log('after filterIndicatorFilenames', true),
				c.error('after filterIndicatorFilenames'))//
		.then(addInputPath)//
		.then(toIndicatorCsvFiles);
	};

	function filterIndicatorFilenames(files) {
		return _.filter(files, function(file) {
			// return file.match(/\-ind.csv$/g);
			return file.match(/^indicator-.+\.csv$/g);
		});
	}
	
	function toIndicatorCsvFiles(files) {
//		console.log('toIndicatorCsvFiles', files);
		return _.map(files, function(file) {
			return new IndicatorCsvFile(file);
		});
	}
	

	//
	// /*****************************************************************************
	// * Tag Files
	// */
	//
	// function getInputTagCsvFiles() {
	// console.log('getInputTagFiles');
	// return fs.list(INDIR)//
	// .then(filterTagFilenames)//
	// .then(buildInputFiles)//
	// .then(toCsvFiles);
	// }
	//
	// function filterTagFilenames(files) {
	// return _.filter(files, function(file) {
	// return file.match(/\-tag.csv$/g);
	// });
	// }
	//
	// /*****************************************************************************
	// * Indicator files
	// */
	//
	// function getInputIndicatorCsvFiles() {
	// console.log('getInputIndicatorFiles');
	// return fs.list(INDIR)//
	// .then(filterIndicatorFilenames)//
	// .then(buildInputFiles)//
	// .then(toCsvFiles);
	// }
	//
	// function filterIndicatorFilenames(files) {
	// return _.filter(files, function(file) {
	// return file.match(/\-ind.csv$/g);
	// });
	// }
	//

	console.log('File manager created!');

	return this;
}

module.exports.instance = new FileManager();