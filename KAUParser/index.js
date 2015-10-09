/**
 * New node file
 */

// process.argv.forEach(function(val, index) {
// console.log(index + " : " + val);
// });
var _ = require('underscore');
var p = require('./parser');
var c = require('./common');
var fs = require("q-io/fs");
var q = require('q');

// var f = "in-dict.csv";

function filterDictCsvFiles(files) {
	return _.filter(files, function(file) {
		return file.match(/\-dict.csv$/g);
	});
}

function filterTagCsvFiles(files) {
	return _.filter(files, function(file) {
		return file.match(/\-tag.csv$/g);
	});
}

function createDictParsingPromises(files) {
	return _.map(files, function(f) {
		return p.parseDict(f);
	});
}

function createTagParsingPromises(files) {
	return _.map(files, function(f) {
		return p.parseTags(f);
	});
}

function executePromises(promises) {
	return q.all(promises);
}

function filesFromPromise(dir) {
	return function(data) {
		// return q.nfcall(fs.readdir, dir);
		return fs.list(dir);
	}
}

function updateCategories(data) {
	return p.parseCategories('categories-dict.csv');
}

function filterIndicatorCsvFiles(files) {
	return _.filter(files, function(file) {
		return file.match(/\-ind.csv$/g);
	});
}

function createIndicatorParsingPromises(files) {
	return _.map(files, function(f) {
		return p.parseIndicators(f);
	});
}

filesFromPromise(p.INDIR)(null)//
.then(filterDictCsvFiles)//
.then(createDictParsingPromises)//
.then(executePromises)//
// START Tags
.then(filesFromPromise(p.INDIR)).then(filterTagCsvFiles)//
.then(createTagParsingPromises)//
.then(executePromises)//
// END Tags
// START Categories
.then(updateCategories)//
// END Categories
// START Indicators
.then(filesFromPromise(p.INDIR))//
.then(filterIndicatorCsvFiles)//
.then(createIndicatorParsingPromises)//
.then(executePromises)//
// END Indicators
.then(c.log("End", true), c.error("Error"))//
.done();

// process.exit(0);
