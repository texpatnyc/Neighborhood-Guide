'use strict';
const { Strategy: LocalStrategy } = require('passport-local');

const { User } = require('../models');

const localStrategy = new LocalStrategy((username, password, callback) => {
  let user;
  User.findOne({ username: username })
    .then(_user => {
      user = _user;
      if (!user) {
        // Return a rejected promise so we break out of the chain of .thens.
        // Any errors like this will be handled in the catch block.
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return callback(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return callback(null, false, err);
      }
      return callback(err, false);
    });
});

function serializeUser(user, done) {
  done(null, user.id);
};

function deserializeUser(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
};

module.exports = { localStrategy, serializeUser, deserializeUser };
