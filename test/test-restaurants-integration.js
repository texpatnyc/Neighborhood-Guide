'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Restaurant} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedRestaurantData() {
	console.info('Seeding Restaurant Data');
	const seedData = [];

	for (let i=0; i<10; i++) {
		seedData.push(generateRestaurantData());
	}

	return Restaurant.insertMany(seedData);
}

function generateBoroughName() {
	const boroughs = ['Manhattan', 'Queens', 'Brooklyn'];
	return boroughs[Math.floor(Math.random() * boroughs.length)];
}

function generateCuisineType() {
	const cuisines = ['Italian', 'Chinese', 'French', 'Japanese', 'Coffee'];
	return cuisines[Math.floor(Math.random() * cuisines.length)];
}

function generateRestaurantData() {
	return {
		name: faker.company.companyName(),
		borough: generateBoroughName(),
		cuisine: generateCuisineType(),
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

describe('Restaurants API resource', function() {
	
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedRestaurantData();
	});

	afterEach(function() {
		return tearDownDb();
	})

	after(function() {
		return closeServer();
	});

	describe('GET endpoint', function() {

		it('should return all existing restaurants', function() {
			let res;
			return chai.request(app)
				.get('/restaurants')
				.then(function(_res) {
					res = _res;
					expect(res).to.have.status(200);
					expect(res.body.restaurants).to.have.lengthOf.at.least(1);
					return Restaurant.count();
				})
				.then(function(count) {
					expect(res.body.restaurants).to.have.lengthOf(count);
				});
		});

		it('should return restaurants with the right fields', function() {
			let resRestaurant;
			return chai.request(app)
				.get('/restaurants')
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.restaurants).to.be.a('array');
					expect(res.body.restaurants).to.have.lengthOf.at.least(1);

					res.body.restaurants.forEach(function(restaurant) {
						expect(restaurant).to.be.a('object');
						expect(restaurant).to.include.keys(
							'id', 'name', 'cuisine', 'borough', 'description', 'address', 'addedBy');
					});
					resRestaurant = res.body.restaurants[0];
					return Restaurant.findById(resRestaurant.id);
				})
				.then(function(restaurant) {
					expect(resRestaurant.id).to.equal(restaurant.id);
					expect(resRestaurant.name).to.equal(restaurant.name);
					expect(resRestaurant.cuisine).to.equal(restaurant.cuisine);
					expect(resRestaurant.borough).to.equal(restaurant.borough);
					expect(resRestaurant.address).to.contain(restaurant.address.building);
					expect(resRestaurant.description).to.equal(restaurant.description);
					expect(resRestaurant.addedBy).to.equal(restaurant.addedBy);
				});
		});
	});

	describe('POST endpoint', function() {

		it('should add a new restaurant', function() {
			const newRestaurant = generateRestaurantData();

			return chai.request(app)
				.post('/restaurants')
				.send(newRestaurant)
				.then(function(res) {
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.be.a('object');
					expect(res.body).to.include.keys(
							'id', 'name', 'cuisine', 'borough', 'description', 'address', 'addedBy');
					expect(res.body.name).to.equal(newRestaurant.name);
					expect(res.body.id).to.not.be.null;
					expect(res.body.cuisine).to.equal(newRestaurant.cuisine);
					expect(res.body.borough).to.equal(newRestaurant.borough);
					return Restaurant.findById(res.body.id);
				})
				.then(function(restaurant) {
					expect(restaurant.name).to.equal(newRestaurant.name);
					expect(restaurant.cuisine).to.equal(newRestaurant.cuisine);
					expect(restaurant.borough).to.equal(newRestaurant.borough);
					expect(restaurant.address.building).to.equal(newRestaurant.address.building);
					expect(restaurant.address.street).to.equal(newRestaurant.address.street);
					expect(restaurant.address.zipcode).to.equal(newRestaurant.address.zipcode);
				});
		});
	});

	describe('PUT endpoint', function() {

		it('should update fields you send over', function() {
			const updateData = {
				name: 'Dumbest Restaurant Name Ever',
				cuisine: 'Dogfood'
			};

			return Restaurant
				.findOne()
				.then(function(restaurant) {
					updateData.id = restaurant.id;
					return chai.request(app)
						.put(`/restaurants/${restaurant.id}`)
						.send(updateData);
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					return Restaurant.findById(updateData.id);
				})
				.then(function(restaurant) {
					expect(restaurant.name).to.equal(updateData.name);
					expect(restaurant.cuisine).to.equal(updateData.cuisine);
				});
		});
	});


	describe('DELETE endpoint', function() {

		it('should delete a restaurant by id', function() {
			let restaurant;
			return Restaurant
				.findOne()
				.then(function(_restaurant) {
					restaurant = _restaurant;
					return chai.request(app).delete(`/restaurants/${restaurant.id}`);
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					return Restaurant.findById(restaurant.id);
				})
				.then(function(_restaurant) {
					expect(_restaurant).to.be.null;
				});
		});
	});





})







































