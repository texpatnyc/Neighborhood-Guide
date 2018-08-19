'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker/locale/en');
const mongoose = require('mongoose');
const request = require('supertest');

const expect = chai.expect;

const {Nightlife, User} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

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

describe('Nightlife API resource', function() {
	
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

	describe('GET endpoint', function() {

		it('should return all existing nightlife', function() {
			let res;
			return chai.request(app)
				.get('/nightlife')
				.then(function(_res) {
					res = _res;
					expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
					expect(res.statusCode).to.equal(200);
					seedData.forEach(seed => {
						console.log(seed.name);
						expect(res.text).to.include(seed.name.toUpperCase());
					})
				});
		});
	});

	describe('POST endpoint', function() {

		it('should add a new nightlife', function() {
			const newNightlife = generateNighlifeData();

			return chai.request(app)
				.post('/nightlife')
				.send(newNightlife)
				.then(function(res) {
					expect(res.text).to.include(newNightlife.name.toUpperCase());
					expect(res.text).to.include(newNightlife.address);
					expect(res.text).to.include(newNightlife.description);
				})
		});
	});

	describe('PUT endpoint', function() {

		it('should update fields you send over', function() {
			const updateData = {
				address: '123 Elm St',
				phone: '646-555-5555',
				typeOfVenue: 'Dogfood'
			};

			return Nightlife
				.findOne()
				.then(function(nightlife) {
					updateData.id = nightlife.id;
					updateData.name = nightlife.name;
					return chai.request(app)
						.put(`/nightlife/${nightlife.id}`)
						.send(updateData);
				})
				.then(function(res) {
					expect(res.text).to.include(updateData.address);
					expect(res.text).to.include(updateData.phone);
					return Nightlife.findById(updateData.id);
				})
				.then(function(nightlife) {
					expect(nightlife.typeOfVenue).to.equal(updateData.typeOfVenue);
				});
		});
	});

	describe('POST Comment Endpoint', function() {

		it('should post the comment attached to the given listing', function() {
			const newComment = generateFakeComment();

			return Nightlife
				.findOne()
				.then(function(nightlife) {
					return chai.request(app)
						.post(`/nightlife/${nightlife.id}/comments`)
						.send(newComment)
						.then(function(res) {
							console.log(res.text);
							expect(res.text).to.include(newComment.comment);
						})
				});
		});
	});

	describe.only('DELETE endpoint', function() {

		before(function(done) {
  		request(app)
  			.post('/auth/local')
		    .send({
		      username: 'admin',
		      password: 'adminpass'
		    })
		    .end(function(err, res) {
		      if (err) throw err;
		      done();
    		});
		});

		it('should delete a nightlife by id', function() {
			let nightlife;
			return Nightlife
				.findOne()
				.then(function(_nightlife) {
					nightlife = _nightlife;
					console.log(nightlife);
					const user = {
						username: 'admin'
					};
					return chai.request(app).delete(`/nightlife/${nightlife.id}`);
				})
				.then(function(res) {
					console.log(user);
					expect(res).to.have.status(200);
					expect(res.text).to.not.include(nightlife.name);
					expect(res.text).to.not.include('<h1 id="index-text">What can I help you find today?</h1>')
				})
		})
	});
});