/**
 * http://usejsdoc.org/
 */

var fs = require("q-io/fs");
var os = require('os');
var _ = require('underscore');
var c = require('./common');
var Dictionary = require('./dictionary');

function CsvFile(file) {

	var self = this;

	function write(data) {
		// console.log('write CsvFile');
		return fs.write(file, data)//
		.then(function(result) {
			return data;
		});
	}

	function getFilename() {
		return file;
	}

	function readAsString() {
//		console.log("readAsString", file)
		return fs.read(file);
	}

	this.readAsArrays = function() {
		return readAsString()//
		.then(toArrays, fileNotFound);
	}

	function fileNotFound(error) {
		console.error(file + ' not found!');
		console.error(error.message);
		return [];
	}

	function readAsTags() {
		return self.readAsArrays()//		
		.then(toTags);
	}

	function readAsTagCategories() {
		return self.readAsArrays()//		
		.then(toTagCategories);
	}

	function toArrays(content) {
		var arrays = content.split('\r' + os.EOL);
		arrays = _.map(arrays, function(array) {
			return array.split(';');
		});
		return arrays;
	}

	function toNormJSON(dictionary) {
		return dictionary.toNormJSON();
	}

	function toNormCsv(normDictionary) {
		return _.map(normDictionary, function(line) {
			return line.join(';');
		}).join('\r' + os.EOL);
	}

	function toDictionary(lines) {
		// console.log('lines: ', lines);
		return new Dictionary().loadLines(lines);
	}

	this.getFilename = getFilename;
	this.write = write;

	return this;
}

module.exports = CsvFile;