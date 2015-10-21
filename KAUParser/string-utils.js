/**
 * http://usejsdoc.org/
 */

function trim(x) {
	return x.replace(/^\s+|\s+$/gm, '');
}

function trimRight(x) {
	return x.replace(/\s+$/gm, '');
}

function trimLeft(x) {
	return x.replace(/^\s+/gm, '');
}

function trimAll(x) {
	return x.replace(/\s+/gm, '');
}

function firstToUpperCase(x) {
	return x.charAt(0).toUpperCase() + x.slice(1);
}

function normalizeKey(key) {
	return trimAll(key.toLowerCase());
}

module.exports.trim = trim;
module.exports.trimRight = trimRight;
module.exports.trimLeft = trimLeft;
module.exports.trimAll = trimAll;
module.exports.firstToUpperCase = firstToUpperCase;
module.exports.normalizeKey = normalizeKey;