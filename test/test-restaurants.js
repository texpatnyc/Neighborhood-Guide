'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest');
const faker = require('faker/locale/en');

const expect = chai.expect;

const {Restaurant, User} = require('../models');
const {app} = require('../server');
const {generateFakeComment, seedUserData, logInAdmin, tearDownDb } = require('./test-support');

chai.use(chaiHttp);

let seedData = [];

function seedRestaurantData() {
	console.info('Seeding Restaurant Data');
	seedData = [];
	for (let i=0; i<5; i++) {
		seedData.push(generateRestaurantData());
	}
	return Restaurant.insertMany(seedData)
}

function generateCuisineType() {
	const typesOfCuisine = ['Italian', 'Coffeeshop', 'Chinese', 'Korean'];
	return typesOfCuisine[Math.floor(Math.random() * typesOfCuisine.length)];
}

function generateRestaurantData() {
	return {
		name: faker.company.companyName(),
		cuisine: generateCuisineType(),
		address: faker.address.streetAddress(),
		phone: faker.phone.phoneNumberFormat(),
		webUrl: faker.internet.url(),
		photoLink: faker.image.business(),
		description: faker.lorem.sentence()
	};
}

describe('Restaurant API resource', function() {

	beforeEach(function() {
		return seedRestaurantData();
	});

	describe('GET endpoint', function() {

		it('should return all existing restaurants', function() {
			let res;
			const agent = chai.request.agent(app);
			return agent
				.get('/restaurants')
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

		it('should add a new restaurant', function() {
			const newRestaurant = generateRestaurantData();
			const agent = chai.request.agent(app);

			return agent
				.post('/restaurants')
				.send(newRestaurant)
				.then(function(res) {
					expect(res.text).to.include(newRestaurant.name.toUpperCase());
					expect(res.text).to.include(newRestaurant.address);
					expect(res.text).to.include(newRestaurant.description);
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
				cuisine: 'Dogfood'
			};

			return agent
				.post('/auth/login')
				.send({
					username: 'admin',
					password: 'adminpass'
				})
				.then(function(res) {
					return Restaurant
						.findOne()
						.then(function(restaurant) {
							updateData.id = restaurant.id;
							updateData.name = restaurant.name;
							return agent
								.put(`/restaurants/${restaurant.id}`)
								.send(updateData)
								.then(function(res) {
									expect(res.text).to.include(updateData.address);
									expect(res.text).to.include(updateData.phone);
									expect(res.text).to.include(updateData.cuisine);
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

			return Restaurant
				.findOne()
				.then(function(restaurant) {
					return agent
						.post(`/restaurants/${restaurant.id}/comments`)
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

		it('should delete a restaurant by id', function() {
			let restaurant;
			const agent = chai.request.agent(app);
			console.log('Delete Test is running');
			return agent
				.post('/auth/login')
				.send({
					username: 'admin',
					password: 'adminpass'
				})
				.then(function(res) {
					return Restaurant
						.findOne()
						.then(function(restaurant) {
							return agent
								.delete(`/restaurants/${restaurant.id}`)
								.then(function(res) {
									expect(res).to.have.status(200);
									expect(res.text).to.not.include(restaurant.name);
									expect(res.text).to.not.include('<h1 id="index-text">What can I help you find today?</h1>')
									agent.close();
								})
						})
				})
		});
	});
});