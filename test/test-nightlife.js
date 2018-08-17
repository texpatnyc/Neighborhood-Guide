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
		console.time('beforeEach');
		return seedNightlifeData();
	});

	afterEach(function() {
		return tearDownDb();
	})

	after(function() {
		return closeServer();
	});

	describe('GET endpoint', function() {

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
				})
		});
	});

	describe.only('POST endpoint', function() {

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