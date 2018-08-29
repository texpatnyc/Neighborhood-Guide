'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest');
const faker = require('faker/locale/en');

const expect = chai.expect;

const {Nightlife, User} = require('../models');
const {app} = require('../server');
const {generateFakeComment, seedUserData} = require('./test-support');

chai.use(chaiHttp);

let seedData = [];

function seedNightlifeData() {
	console.info('Seeding Nightlife Data');
	seedData = [];
	for (let i=0; i<5; i++) {
		seedData.push(generateNighlifeData());
	}
	return Nightlife.insertMany(seedData)
}

function generateVenueType() {
	const typesOfVenues = ['Bar', 'Nightclub', 'Cocktail Bar', 'Live Music Venue'];
	return typesOfVenues[Math.floor(Math.random() * typesOfVenues.length)];
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

describe('Nightlife API resource', function() {

	beforeEach(function() {
		return seedNightlifeData();
	});

	describe('GET endpoint', function() {

		it('should return all existing nightlife', function() {
			let res;
			const agent = chai.request.agent(app);
			return agent
				.get('/nightlife')
				.then(function(_res) {
					res = _res;
					expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
					expect(res.statusCode).to.equal(200);
					seedData.forEach(seed => {
						expect(res.text).to.include(seed.name.toUpperCase());
					})
				agent.close();
				});
		});
	});

	describe('POST endpoint', function() {

		it('should add a new nightlife', function() {
			const newNightlife = generateNighlifeData();
			const agent = chai.request.agent(app);

			return agent
				.post('/nightlife')
				.send(newNightlife)
				.then(function(res) {
					expect(res.text).to.include(newNightlife.name.toUpperCase());
					expect(res.text).to.include(newNightlife.address);
					expect(res.text).to.include(newNightlife.description);
					agent.close();
				})
		});
	});

	describe('PUT endpoint', function() {

		before(function() {
			return seedUserData();
    });

		it('should update fields you send over', function() {
			const agent = chai.request.agent(app);
			const updateData = {
				address: '123 Elm St',
				phone: '646-555-5555',
				typeOfVenue: 'Nightclub'
			};

			return agent
				.post('/auth/login')
				.send({
					username: 'admin',
					password: 'adminpass'
				})
				.then(function(res) {
					return Nightlife
						.findOne()
						.then(function(nightlife) {
							updateData.id = nightlife.id;
							updateData.name = nightlife.name;
							return agent
								.put(`/nightlife/${nightlife.id}`)
								.send(updateData)
								.then(function(res) {
									expect(res.text).to.include(updateData.address);
									expect(res.text).to.include(updateData.phone);
									expect(res.text).to.include(updateData.typeOfVenue);
									agent.close();

								});
						});
				});
		});
	});

	describe('POST Comment Endpoint', function() {

		it('should post the comment attached to the given listing', function() {
			const newComment = generateFakeComment();
			const agent = chai.request.agent(app);

			return Nightlife
				.findOne()
				.then(function(nightlife) {
					return agent
						.post(`/nightlife/${nightlife.id}/comments`)
						.send(newComment)
						.then(function(res) {
							expect(res.text).to.include(`${newComment.firstName} from`);
							expect(res.text).to.include(`${newComment.hometown} said:`);
							expect(res.text).to.include(newComment.comment);
							agent.close();
						})
				});
		});
	});

	describe('DELETE endpoint', function() {

		before(function() {
			return seedUserData();
     });

		it('should delete a nightlife by id', function() {
			let nightlife;
			const agent = chai.request.agent(app);
			console.log('Delete Test is running');
			return agent
				.post('/auth/login')
				.send({
					username: 'admin',
					password: 'adminpass'
				})
				.then(function(res) {
					return Nightlife
						.findOne()
						.then(function(nightlife) {
							return agent
								.delete(`/nightlife/${nightlife.id}`)
								.then(function(res) {
									expect(res).to.have.status(200);
									expect(res.text).to.not.include(nightlife.name);
									expect(res.text).to.not.include('<h1 id="index-text">What can I help you find today?</h1>')
									agent.close();
								})
						})
				})
		});
	});
});