'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//------------------------------------------------------------
//Schemas
//------------------------------------------------------------

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  hometown: {type: String, default: ''}
});

// add password verification methods

const commentSchema = new mongoose.Schema({
	firstName: String,
	hometown: String,
	date: Date,
	comment: String
});

const restaurantSchema = new mongoose.Schema({
	name: String,
	cuisine: String,
	address: String,
	phone: String,
	webUrl: String,
	photoLink: String,
	description: String,
	addedBy: String,
	comments: [commentSchema]
});

const nightlifeSchema = new mongoose.Schema({
	name: String,
	typeOfVenue: String,
	address: String,
	phone: String,
	webUrl: String,
	photoLink: String,
	description: String,
	addedBy: String,
	comments: [commentSchema]
});

const servicesSchema = new mongoose.Schema({
	name: String,
	typeOfService: String,
	address: String,
	phone: String,
	webUrl: String,
	photoLink: String,
	description: String,
	addedBy: String,
	comments: [commentSchema]
});

//------------------------------------------------------------
//Instance Methods
//------------------------------------------------------------

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Nightlife = mongoose.model('Nightlife', nightlifeSchema);
const Service = mongoose.model('Service', servicesSchema);
const Comment = mongoose.model('Comment', commentSchema);
const User = mongoose.model('User', userSchema);

module.exports = {Restaurant, Nightlife, Service, Comment, User};




























