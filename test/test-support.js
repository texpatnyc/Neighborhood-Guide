'use strict'

const faker = require('faker/locale/en');
const mongoose = require('mongoose');

const {User} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

let seedData = [];

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

function generateFakeComment() {
	const output = {
		firstName: faker.name.firstName(),
		hometown: faker.address.city(),
		userId: faker.random.uuid(),
		comment: faker.lorem.sentence()
	}
	return output;
}

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	before(function() {
		return seedUserData();
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	});

module.exports = {generateFakeComment};