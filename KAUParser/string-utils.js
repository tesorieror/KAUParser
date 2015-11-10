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

function filterChars(key, startChar, endChar) {
	var sIndex = key.indexOf(startChar)
	if (sIndex > 0) {
		var eIndex = key.indexOf(endChar)
		if (eIndex < 0)
			eIndex = key.length;
		key.splice(sIndex, eIndex - sIndex);
	}
	return key;
}

function normalizeKey(key) {
	result = key.toLowerCase()
	result = trimAll(result)
	// result = filter(result, '(', ')')
	// result = filter(result, '[', ']')
	// result = filter(result, '{', '}')
	return result;
}

module.exports.trim = trim;
module.exports.trimRight = trimRight;
module.exports.trimLeft = trimLeft;
module.exports.trimAll = trimAll;
module.exports.firstToUpperCase = firstToUpperCase;
module.exports.normalizeKey = normalizeKey;
module.exports.filterChars = filterChars