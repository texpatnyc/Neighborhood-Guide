'use strict';
const express = require('express');
const passport = require('passport');

const config = require('../config');
const router = express.Router();

const localAuth = passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
});

// The user provides a username and password to login
router.post('/login', localAuth)

module.exports = router;
