'use strict'

const faker = require('faker/locale/en');
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const {User} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);


function generateFakeComment() {
	const output = {
		firstName: faker.name.firstName(),
		hometown: faker.address.city(),
		userId: faker.random.uuid(),
		comment: faker.lorem.sentence()
	}
	return output;
}

function seedUserData(pass) {
  console.info('Seeding User Data');
  const admin = {
      username: 'admin',
      password: 'adminpass',
      firstName: 'Admin',
      lastName: 'Admin',
      hometown: 'Outer Space'
    };

  const agent = chai.request.agent(app);

  return agent
    .post('/users')
    .send(admin)
    .then(function(res) {
      agent.close();
    })
}

function logInAdmin() {
	const agent = chai.request.agent(app);
	return agent
        .post('/auth/login')
        .send({ 
          username: 'admin', 
          password: 'adminpass' 
        })
}

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	// beforeEach(function() {
	// 	return seedUserData();
	// });

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	});

module.exports = {generateFakeComment, seedUserData, logInAdmin, tearDownDb};