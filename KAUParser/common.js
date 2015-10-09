/**
 * New node file
 */

/**
 * Log message to console
 * 
 * @param msg
 * @param logData
 * @returns {Function}
 */
function log(msg, logData) {
	return function(data) {
		if (msg) {
			console.log(msg);
			if (logData) {
				console.log(data);
			}
		} else {
			console.log(data);
		}
		return data;
		// process.exit(0);
	}
}
/**
 * Log error to console
 * 
 * @param msg
 * @returns {Function}
 */
function error(msg) {
	return function(error) {
		if (msg) {
			console.error(msg);
		}
		console.error(error);
		throw error;
	}
}
/**
 * 
 * @param x
 * @returns
 */
function trim(x) {
	return x.replace(/^\s+|\s+$/gm, '');
}
/**
 * 
 * @param x
 * @returns
 */
function trimRight(x) {
	return x.replace(/\s+$/gm, '');
}
/**
 * 
 * @param x
 * @returns
 */
function trimLeft(x) {
	return x.replace(/^\s+/gm, '');
}
/**
 * 
 * @param x
 * @returns
 */
function trimAll(x) {
	return x.replace(/\s+/gm, '');
}
/**
 * 
 * @param string
 * @returns
 */
function firstToUpperCase(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Exports
 */
exports.firstToUpperCase = firstToUpperCase;
exports.trimAll = trimAll;
exports.trimLeft = trimLeft;
exports.trimRight = trimRight;
exports.trim = trim;
exports.error = error;
exports.log = log;
