'use strict';

const mongoose = require('mongoose');

//------------------------------------------------------------
//Schemas
//------------------------------------------------------------

const userSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	origin: {
		city: String,
		country: String
	},
	photo: String
});

// add password verification methods

const commentSchema = new mongoose.Schema({
	addedBy: String,
	date: Date,
	comment: String
});

const restaurantSchema = new mongoose.Schema({
	name: String,
	cuisine: String,
	borough: String,
	address: {
		building: String,
		location: {
			lat: Number,
			long: Number
		},
		street: String,
		zipcode: String,
	},
	description: String,
	addedBy: String,
	comments: [commentSchema]
});

const nightlifeSchema = new mongoose.Schema({
	name: String,
	typeOfVenue: String,
	borough: String,
	address: {
		building: String,
		coord: [String],
		street: String,
		zipcode: String
	},
	description: String,
	addedBy: String,
	comments: [commentSchema]
});

const servicesSchema = new mongoose.Schema({
	name: String,
	typeOfService: String,
	borough: String,
	address: {
		building: String,
		coord: [String],
		street: String,
		zipcode: String
	},
	description: String,
	addedBy: String,
	comments: [commentSchema]
});


//------------------------------------------------------------
//Virtuals
//------------------------------------------------------------

restaurantSchema.virtual('addressString').get(function() {
  return `${this.address.building} ${this.address.street}`.trim();
});

nightlifeSchema.virtual('addressString').get(function() {
  return `${this.address.building} ${this.address.street}`.trim();
});

servicesSchema.virtual('addressString').get(function() {
  return `${this.address.building} ${this.address.street}`.trim();
});

//------------------------------------------------------------
//Instance Methods
//------------------------------------------------------------

restaurantSchema.methods.serialize = function() {
	return {
		id: this._id,
		name: this.name,
		cuisine: this.cuisine,
		borough: this.borough,
		address: this.addressString,
		description: this.description,
		addedBy: this.addedBy
	};
}

nightlifeSchema.methods.serialize = function() {
	return {
		id: this._id,
		name: this.name,
		typeOfVenue: this.typeOfVenue,
		borough: this.borough,
		address: this.addressString,
		description: this.description,
		addedBy: this.addedBy
	};
}

servicesSchema.methods.serialize = function() {
	return {
		id: this._id,
		name: this.name,
		typeOfService: this.typeOfService,
		borough: this.borough,
		address: this.addressString,
		description: this.description,
		addedBy: this.addedBy
	};
}

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Nightlife = mongoose.model('Nightlife', nightlifeSchema);
const Service = mongoose.model('Service', servicesSchema);
const Comment = mongoose.model('Comment', commentSchema);
const User = mongoose.model('User', userSchema);

module.exports = {Restaurant, Nightlife, Service, Comment, User};




























