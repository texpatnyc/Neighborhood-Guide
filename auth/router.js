'use strict';
const express = require('express');
const passport = require('passport');

const config = require('../config');
const router = express.Router();
let next;


// The user provides a username and password to login
router.post('/login', function(req, res, next) {
	console.log(req.body);
	passport.authenticate('local', function(error, user, info) {
		if (error) {
			return next(error);
		}
		if (!user) {
			req.flash('error', 'User/Pass Incorrect')
			return res.redirect('/login');
		}
		req.logIn(user, function(err) {
			if (err) {
				return next(err);
			}
			if (req.body.next) {
				return res.redirect(req.body.next);
			}
			return res.redirect('/');
		})
	})(req, res, next)
})

module.exports = router;


