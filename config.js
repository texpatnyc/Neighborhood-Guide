'use strict';
exports.DATABASE_URL = 
	process.env.DATABASE_URL || 
	global.DATABASE_URL ||
	'mongodb://neighborhoodguide:26stmarksplace@ds127362.mlab.com:27362/neighborhood-guide';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-guide-app';
exports.PORT = process.env.PORT || 8080;
