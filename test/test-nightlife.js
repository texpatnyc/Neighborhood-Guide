'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker/locale/en');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Nightlife} = require('../models');
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
		.then(data => console.timeEnd('beforeEach'));
}

function generateVenueType() {
	const typeOfVenues = ['Bar', 'Nightclub', 'Cocktail Bar', 'Live Music Venue'];
	return typeOfVenues[Math.floor(Math.random() * typeOfVenues.length)];
}

function generateFakeComments() {
	const output = [];
	for(let i=0; i<3; i++) {
		output.push({
			addedBy: {
				firstName: faker.name.firstName(),
				hometown: faker.address.city(),
				userId: faker.random.uuid()
			},
			date: Date.now(),
			comment: faker.lorem.sentence()
		})
	};
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
		description: faker.lorem.sentence(),
		addedBy: faker.name.findName(),
		comments: generateFakeComments()
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
		console.time('beforeEach');
		return seedNightlifeData();
	});

	afterEach(function() {
		return tearDownDb();
	})

	after(function() {
		return closeServer();
	});

	describe.only('GET endpoint', function() {

		it.only('should return all existing nightlife', function() {
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


					// expect(res.header('Content-Type')).to.be('text/html');
					// console.log(res.text);
					// expect(res.body.nightlife).to.have.lengthOf.at.least(1);
					// return Nightlife.count();
				})
				// .then(function(count) {
				// 	// expect(res.body.nightlife).to.have.lengthOf(count);
				// });
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
							'id', 'name', 'typeOfVenue', 'phone', 'description', 'address', 'comments', 'webUrl', 'photoLink');
					});
					resNightlife = res.body.nightlife[0];
					return Nightlife.findById(resNightlife.id);
				})
				.then(function(nightlife) {
					expect(resNightlife.id).to.equal(nightlife.id);
					expect(resNightlife.name).to.equal(nightlife.name);
					expect(resNightlife.typeOfVenue).to.equal(nightlife.typeOfVenue);
					expect(resNightlife.phone).to.equal(nightlife.phone);
					expect(resNightlife.address).to.equal(nightlife.address);
					expect(resNightlife.description).to.equal(nightlife.description);
					expect(resNightlife.webUrl).to.equal(nightlife.webUrl);
					expect(resNightlife.photoLink).to.equal(nightlife.photoLink);
					expect(resNightlife.comments).to.deep.equal(nightlife.comments);
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

















