'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest');
const faker = require('faker/locale/en');

const expect = chai.expect;

const {Service, User} = require('../models');
const {app} = require('../server');
const {generateFakeComment} = require('./test-support');

chai.use(chaiHttp);

let seedData = [];

function seedServiceData() {
	console.info('Seeding Service Data');
	seedData = [];
	for (let i=0; i<5; i++) {
		seedData.push(generateServiceData());
	}
	return Service.insertMany(seedData)
}

function generateServiceType() {
	const typesOfCuisine = ['Grocery Store', 'Laundry', 'Liquor Store', 'Bodega'];
	return typesOfCuisine[Math.floor(Math.random() * typesOfCuisine.length)];
}

function generateServiceData() {
	return {
		name: faker.company.companyName(),
		typeOfService: generateServiceType(),
		address: faker.address.streetAddress(),
		phone: faker.phone.phoneNumberFormat(),
		webUrl: faker.internet.url(),
		photoLink: faker.image.business(),
		description: faker.lorem.sentence()
	};
}

describe('Service API resource', function() {

	beforeEach(function() {
		return seedServiceData();
	});

	describe('GET endpoint', function() {

		it('should return all existing services', function() {
			let res;
			const agent = chai.request.agent(app);
			return agent
				.get('/services')
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

		it('should add a new service', function() {
			const newService = generateServiceData();
			const agent = chai.request.agent(app);

			return agent
				.post('/services')
				.send(newService)
				.then(function(res) {
					expect(res.text).to.include(newService.name.toUpperCase());
					expect(res.text).to.include(newService.address);
					expect(res.text).to.include(newService.description);
					agent.close();
				})
		});
	});

	describe.skip('PUT endpoint', function() {

		it('should update fields you send over', function() {
			const updateData = {
				address: '123 Elm St',
				phone: '646-555-5555',
				typeOfService: 'Dogfood'
			};

			return Service
				.findOne()
				.then(function(service) {
					updateData.id = service.id;
					updateData.name = service.name;
					return chai.request(app)
						.put(`/services/${service.id}`)
						.send(updateData);
				})
				.then(function(res) {
					expect(res.text).to.include(updateData.address);
					expect(res.text).to.include(updateData.phone);
					return Service.findById(updateData.id);
				})
				.then(function(service) {
					expect(service.typeOfService).to.equal(updateData.typeOfService);
				});
		});
	});

	describe('POST Comment Endpoint', function() {

		it('should post the comment attached to the given listing', function() {
			const newComment = generateFakeComment();
			const agent = chai.request.agent(app);

			return Service
				.findOne()
				.then(function(service) {
					return agent
						.post(`/services/${service.id}/comments`)
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

	describe.skip('DELETE endpoint', function() {

		before(function(done) {
  		const agent = chai.request.agent(app);
      return agent
        .post('/auth/login')
        .send({ 
          username: 'admin', 
          password: 'adminpass' 
        })
        agent.close();
        });

		it('should delete a nightlife by id', function() {
			let nightlife;
			return Service
				.findOne()
				.then(function(_service) {
					service = _service;
					console.log(service);
					return chai.request(app).delete(`/services/${service.id}`);
				})
				.then(function(res) {
					console.log(user);
					expect(res).to.have.status(200);
					expect(res.text).to.not.include(service.name);
					expect(res.text).to.not.include('<h1 id="index-text">What can I help you find today?</h1>')
				})
		})
	});
});