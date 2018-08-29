'use strict';
exports.DATABASE_URL = 
	process.env.DATABASE_URL || 
	global.DATABASE_URL ||
	'mongodb://neighborhoodguide:26stmarksplace@ds127362.mlab.com:27362/neighborhood-guide';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://neighborhoodguide:26stmarksplace@ds137862.mlab.com:37862/test-neighborhood-guide';
exports.PORT = process.env.PORT || 8080;
