'use strict'

const faker = require('faker/locale/en');
const mongoose = require('mongoose');

const {User, Nightlife, Restaurant, Service} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

let seedData = [];

function seedNightlifeData() {
	console.info('Seeding Nightlife Data');
	seedData = [];
	for (let i=0; i<5; i++) {
		seedData.push(generateNighlifeData());
	}
	// console.timeEnd('beforeEach');
	return Nightlife.insertMany(seedData)
}

function seedUserData() {
	console.info('Seeding Admin User Data');
	const users = [
		{
			username: 'admin',
			password: 'adminpass',
			firstName: 'Admin',
			lastName: 'Admin',
			hometown: 'Outer Space'
		},
		{
			username: 'testUser',
			password: 'testPassword',
			firstName: 'Joe',
			lastName: 'Tester',
			hometown: 'Test Town'   
		}
	];
	return User.insertMany(users)
}

function generateVenueType() {
	const typeOfVenues = ['Bar', 'Nightclub', 'Cocktail Bar', 'Live Music Venue'];
	return typeOfVenues[Math.floor(Math.random() * typeOfVenues.length)];
}

function generateFakeComment() {
	const output = {
		firstName: faker.name.firstName(),
		hometown: faker.address.city(),
		userId: faker.random.uuid(),
		comment: faker.lorem.sentence()
	}
	return output;
}

function generateNighlifeData() {
	return {
		name: faker.company.companyName(),
		typeOfVenue: generateVenueType(),
		address: faker.address.streetAddress(),
		phone: faker.phone.phoneNumberFormat(),
		webUrl: faker.internet.url(),
		photoLink: faker.image.business(),
		description: faker.lorem.sentence()
	};
}

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedNightlifeData();
	});

	beforeEach(function() {
		return seedUserData();
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	});


	module.exports = {generateNighlifeData, generateVenueType, generateFakeComment};