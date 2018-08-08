'use strict';
const router = require('./router');
const {localStrategy, serializeUser, deserializeUser} = require('./strategies');

module.exports = {router, localStrategy, serializeUser, deserializeUser};
