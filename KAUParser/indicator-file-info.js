/**
 * http://usejsdoc.org/
 */

var _ = require('underscore');

// indicator-10_3_9-1434_1435_2_15
function IndicatorFileInfo(file) {
	this.file = file;
	this.filename = _.last(file.split('/'));
	this.info = this.filename.split(/-/g);
	this.size = this.info[1].split(/_/g);
	this.col = this.size[0] - 1;
	this.row = this.size[1] - 1;
	this.offset = parseInt(this.size[2]);
	this.period = this.info[2];
	this.id = this.info[3];
	// Header row
	this.hrow = this.row - 1;
	// Header column
	this.hcol = this.col - 1 + this.offset + 1;

	this.getCategories = function(arrays) {
		return arrays[1].slice(0, this.col)
				.concat(
						[ arrays[0][this.col + this.offset],
								arrays[1][this.col + this.offset] ]);
	};

	this.getTags = function(arrays, row, col) {
		return arrays[row].slice(0, this.col).concat(
				[ arrays[0][col], arrays[1][col] ]);
	};

	return this;
}

module.exports = IndicatorFileInfo;