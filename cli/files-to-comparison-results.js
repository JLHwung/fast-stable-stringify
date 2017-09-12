var fs = require('fs-extra');
var obj = require('../util/object-path');

/**
 * Converts the file contents generated by BenchmarkStatsProcessor to a DataSetComparisonResult array.
 * @param {Array} arrFileObj
 * @returns {Object}
 */
function mergeToMap(arrFileObj) {
	return arrFileObj.reduce(function(result, fileObj) {
		var name;
		var libData;
		for (name in fileObj) {
			libData = fileObj[name];
			obj.setObject(result, [libData.suite, libData.browser, libData.name], libData);
		}
		return result;
	}, {});
}

/**
 * @typedef {Object} DataSetComparisonResult
 * @prop {string} browser
 * @prop {string} suite
 * @prop {Object<DataSetComparisonResultItem>} resultMap - key is libName
 */

/**
 *
 * @param {string[]} files
 * @returns {Promise<DataSetComparisonResult[]>}
 */
module.exports = function(files) {
	return Promise
		.all(files.map(function(file) {
			return fs.readJson(file);
		}))
		.then(function (arrFileObj) {
			var map = mergeToMap(arrFileObj);
			var result = [];
			var suiteName;
			var browserName;
			var suite;
			for (suiteName in map) {
				suite = map[suiteName];
				for (browserName in suite) {
					result.push({ browser: browserName, suite: suiteName, resultMap: suite[browserName]})
				}
			}
			return result;
		});
};