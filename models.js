'use strict';

const mongoose = require('mongoose');

//------------------------------------------------------------
//Schemas
//------------------------------------------------------------

const userSchema = mongoose.Schema({
	firstName: String,
	lastName: String,
	origin: {
		city: String,
		country: String
	},
	photo: String
});

// add password verification methods

const restaurantSchema = mongoose.Schema({
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
	// comments: [commentSchema]
});

const nightlifeSchema = mongoose.Schema({
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
	addedBy: String
});

const servicesSchema = mongoose.Schema({
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
	addedBy: String
});

const commentSchema = mongoose.Schema({
	addedBy: String,
	date: Date,
	comment: String
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

restaurantSchema.methods.serialize = () => {
	return {
		id: this._id,
		name: this.name,
		cuisine: this.cuisine,
		borough: this.borough,
		address: this.addressString,
		description: this.description
	};
}

nightlifeSchema.methods.serialize = () => {
	return {
		id: this._id,
		name: this.name,
		typeOfVenue: this.typeOfVenue,
		borough: this.borough,
		address: this.addressString,
		description: this.description
	};
}

servicesSchema.methods.serialize = () => {
	return {
		id: this._id,
		name: this.name,
		typeOfService: this.typeOfService,
		borough: this.borough,
		address: this.addressString,
		description: this.description
	};
}

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Nightlife = mongoose.model('Nightlife', nightlifeSchema);
const Service = mongoose.model('Service', servicesSchema);
const Comment = mongoose.model('Comment', commentSchema);
const User = mongoose.model('User', userSchema);

module.exports = {Restaurant, Nightlife, Service, Comment, User};




























