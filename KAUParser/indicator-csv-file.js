/**
 * http://usejsdoc.org/
 */

var IndicatorFileInfo = require('./indicator-file-info');
var CsvFile = require('./csv-file');

function IndicatorCsvFile(file) {

	var csvFile = new CsvFile(file);
	var indicatorFileInfo = new IndicatorFileInfo(file);

	this.readAsArrays = function(file) {
		return csvFile.readAsArrays(file);
	}

	this.getInfo = function() {
		return indicatorFileInfo;
	}

	return this;
}

module.exports = IndicatorCsvFile;