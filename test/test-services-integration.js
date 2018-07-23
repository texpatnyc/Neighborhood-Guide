'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Service} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedServiceData() {
	console.info('Seeding Service Data');
	const seedData = [];

	for (let i=0; i<10; i++) {
		seedData.push(generateServiceData());
	}

	return Service.insertMany(seedData);
}

function generateBoroughName() {
	const boroughs = ['Manhattan', 'Queens', 'Brooklyn'];
	return boroughs[Math.floor(Math.random() * boroughs.length)];
}

function generateTypeOfService() {
	const typeOfServices = ['Laundry', 'Grocery Store', 'Bodega'];
	return typeOfServices[Math.floor(Math.random() * typeOfServices.length)];
}

function generateServiceData() {
	return {
		name: faker.company.companyName(),
		borough: generateBoroughName(),
		typeOfService: generateTypeOfService(),
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

describe('Services API resource', function() {
	
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedServiceData();
	});

	afterEach(function() {
		return tearDownDb();
	})

	after(function() {
		return closeServer();
	});

	describe('GET endpoint', function() {

		it('should return all existing services', function() {
			let res;
			return chai.request(app)
				.get('/services')
				.then(function(_res) {
					res = _res;
					expect(res).to.have.status(200);
					expect(res.body.services).to.have.lengthOf.at.least(1);
					return Service.count();
				})
				.then(function(count) {
					expect(res.body.services).to.have.lengthOf(count);
				});
		});

		it('should return services with the right fields', function() {
			let resService;
			return chai.request(app)
				.get('/services')
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.services).to.be.a('array');
					expect(res.body.services).to.have.lengthOf.at.least(1);

					res.body.services.forEach(function(service) {
						expect(service).to.be.a('object');
						expect(service).to.include.keys(
							'id', 'name', 'typeOfService', 'borough', 'description', 'address', 'addedBy');
					});
					resService = res.body.services[0];
					return Service.findById(resService.id);
				})
				.then(function(service) {
					expect(resService.id).to.equal(service.id);
					expect(resService.name).to.equal(service.name);
					expect(resService.typeOfService).to.equal(service.typeOfService);
					expect(resService.borough).to.equal(service.borough);
					expect(resService.address).to.contain(service.address.building);
					expect(resService.description).to.equal(service.description);
					expect(resService.addedBy).to.equal(service.addedBy);
				});
		});
	});

	describe('POST endpoint', function() {

		it('should add a new service', function() {
			const newService = generateServiceData();

			return chai.request(app)
				.post('/services')
				.send(newService)
				.then(function(res) {
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.be.a('object');
					expect(res.body).to.include.keys(
							'id', 'name', 'typeOfService', 'borough', 'description', 'address', 'addedBy');
					expect(res.body.name).to.equal(newService.name);
					expect(res.body.id).to.not.be.null;
					expect(res.body.typeOfService).to.equal(newService.typeOfService);
					expect(res.body.borough).to.equal(newService.borough);
					return Service.findById(res.body.id);
				})
				.then(function(service) {
					expect(service.name).to.equal(newService.name);
					expect(service.typeOfService).to.equal(newService.typeOfService);
					expect(service.borough).to.equal(newService.borough);
					expect(service.address.building).to.equal(newService.address.building);
					expect(service.address.street).to.equal(newService.address.street);
					expect(service.address.zipcode).to.equal(newService.address.zipcode);
				});
		});
	});

	describe('PUT endpoint', function() {

		it('should update fields you send over', function() {
			const updateData = {
				name: 'Dumbest Service Name Ever',
				typeOfService: 'Dogfood'
			};

			return Service
				.findOne()
				.then(function(service) {
					updateData.id = service.id;
					return chai.request(app)
						.put(`/services/${service.id}`)
						.send(updateData);
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					return Service.findById(updateData.id);
				})
				.then(function(service) {
					expect(service.name).to.equal(updateData.name);
					expect(service.typeOfService).to.equal(updateData.typeOfService);
				});
		});
	});


	describe('DELETE endpoint', function() {

		it('should delete a service by id', function() {
			let service;
			return Service
				.findOne()
				.then(function(_service) {
					service = _service;
					return chai.request(app).delete(`/services/${service.id}`);
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					return Service.findById(service.id);
				})
				.then(function(_service) {
					expect(_service).to.be.null;
				});
		});
	});
})






























