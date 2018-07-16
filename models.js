'use strict';

const mongoose = require('mongoose');

// Schemas

const userSchema = mongoose.Schema({
	id: String,
	firstName: String,
	lastName: String,
	origin: {
		city: String,
		country: String
	},
	photo: String
});

const restaurntSchema = mongoose.Schema({
	id: String,
	name: String,
	cuisine: String,
	address: {
		building: String,
		coord: [String],
		street: String,
		zipcode: String,
	},
	description: String,
	addedBy: String
});

const nightlifeSchema = mongoose.Schema({
	id: String,
	name: String,
	typeOfVenue: String,
	address: {
		building: String,
		coord: [String],
		street: String,
		zipcode: String
	},
	description: String,
	addedBy: String
});

const servicesSchema = mongoose.Schema({
	id: String,
	name: String,
	typeOfService: String,
	address: {
		building: String,
		coord: [String],
		street: String,
		zipcode: String
	},
	description: String,
	addedBy: String
});

const commentSchema = mongoose.Schema({
	id: String,
	listingId: String,
	addedBy: String,
	date: Date,
	comment: String
});

//

