'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Nightlife} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedNightlifeData() {
	console.info('Seeding Nightlife Data');
	const seedData = [];

	for (let i=0; i<10; i++) {
		seedData.push(generateNighlifeData());
	}

	return Nightlife.insertMany(seedData);
}

function generateBoroughName() {
	const boroughs = ['Manhattan', 'Queens', 'Brooklyn'];
	return boroughs[Math.floor(Math.random() * boroughs.length)];
}

function generateVenueType() {
	const typeOfVenues = ['Bar', 'Nightclub', 'Cocktail Bar', 'Live Music Venue'];
	return typeOfVenues[Math.floor(Math.random() * typeOfVenues.length)];
}

function generateNighlifeData() {
	return {
		name: faker.company.companyName(),
		borough: generateBoroughName(),
		typeOfVenue: generateVenueType(),
		address: {
			building: faker.address.streetAddress(),
			street: faker.address.streetName(),
			zipcode: faker.address.zipCode()
		},
		description: faker.lorem.sentence(),
		addedBy: faker.name.findName()
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

	afterEach(function() {
		return tearDownDb();
	})

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
					expect(res).to.have.status(200);
					expect(res.body.nightlife).to.have.lengthOf.at.least(1);
					return Nightlife.count();
				})
				.then(function(count) {
					expect(res.body.nightlife).to.have.lengthOf(count);
				});
		});

		it('should return nightlife with the right fields', function() {
			let resNightlife;
			return chai.request(app)
				.get('/nightlife')
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.nightlife).to.be.a('array');
					expect(res.body.nightlife).to.have.lengthOf.at.least(1);

					res.body.nightlife.forEach(function(nightlife) {
						expect(nightlife).to.be.a('object');
						expect(nightlife).to.include.keys(
							'id', 'name', 'typeOfVenue', 'borough', 'description', 'address', 'addedBy');
					});
					resNightlife = res.body.nightlife[0];
					return Nightlife.findById(resNightlife.id);
				})
				.then(function(nightlife) {
					expect(resNightlife.id).to.equal(nightlife.id);
					expect(resNightlife.name).to.equal(nightlife.name);
					expect(resNightlife.typeOfVenue).to.equal(nightlife.typeOfVenue);
					expect(resNightlife.borough).to.equal(nightlife.borough);
					expect(resNightlife.address).to.contain(nightlife.address.building);
					expect(resNightlife.description).to.equal(nightlife.description);
					expect(resNightlife.addedBy).to.equal(nightlife.addedBy);
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
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.be.a('object');
					expect(res.body).to.include.keys(
							'id', 'name', 'typeOfVenue', 'borough', 'description', 'address', 'addedBy');
					expect(res.body.name).to.equal(newNightlife.name);
					expect(res.body.id).to.not.be.null;
					expect(res.body.typeOfVenue).to.equal(newNightlife.typeOfVenue);
					expect(res.body.borough).to.equal(newNightlife.borough);
					return Nightlife.findById(res.body.id);
				})
				.then(function(nightlife) {
					expect(nightlife.name).to.equal(newNightlife.name);
					expect(nightlife.typeOfVenue).to.equal(newNightlife.typeOfVenue);
					expect(nightlife.borough).to.equal(newNightlife.borough);
					expect(nightlife.address.building).to.equal(newNightlife.address.building);
					expect(nightlife.address.street).to.equal(newNightlife.address.street);
					expect(nightlife.address.zipcode).to.equal(newNightlife.address.zipcode);
				});
		});
	});

	describe('PUT endpoint', function() {

		it('should update fields you send over', function() {
			const updateData = {
				name: 'Dumbest Nightlife Name Ever',
				typeOfVenue: 'Dogfood'
			};

			return Nightlife
				.findOne()
				.then(function(nightlife) {
					updateData.id = nightlife.id;
					return chai.request(app)
						.put(`/nightlife/${nightlife.id}`)
						.send(updateData);
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					return Nightlife.findById(updateData.id);
				})
				.then(function(nightlife) {
					expect(nightlife.name).to.equal(updateData.name);
					expect(nightlife.typeOfVenue).to.equal(updateData.typeOfVenue);
				});
		});
	});


	describe('DELETE endpoint', function() {

		it('should delete a nightlife by id', function() {
			let nightlife;
			return Nightlife
				.findOne()
				.then(function(_nightlife) {
					nightlife = _nightlife;
					return chai.request(app).delete(`/nightlife/${nightlife.id}`);
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					return Nightlife.findById(nightlife.id);
				})
				.then(function(_nightlife) {
					expect(_nightlife).to.be.null;
				});
		});
	});
})

















