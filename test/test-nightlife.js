'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest');

const expect = chai.expect;

const {Nightlife, User} = require('../models');
const {app} = require('../server');
const {generateVenueType, generateFakeComment, generateNighlifeData} = require('./test-support');

chai.use(chaiHttp);

let seedData = [];

describe('Nightlife API resource', function() {

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
						console.log(seed.name);
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

	describe.skip('PUT endpoint', function() {

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
			return Nightlife
				.findOne()
				.then(function(_nightlife) {
					nightlife = _nightlife;
					console.log(nightlife);
					// const user = {
					// 	username: 'admin'
					// };
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