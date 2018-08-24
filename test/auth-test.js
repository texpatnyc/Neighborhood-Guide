'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest');

const expect = chai.expect;

const {app} = require('../server');

chai.use(chaiHttp);

describe('Login/Auth Resource', function() {

  describe('POST endpoint', function() {

    it('should display flash error message when passed bad credentials', function() {
    	const agent = chai.request.agent(app);
    	return agent
        .post('/auth/login')
        .send({ 
          username: 'joe@notreally.com', 
          password: 'jumbotron' 
        })
        .then(function (res) {
        	expect(res.text).to.include('User/Pass Incorrect');
        	agent.close();
        })
    });

    it('should display create a connect.sid cookie when succefully logged in.', function() {
      const agent = chai.request.agent(app);
      return agent
        .post('/auth/login')
        .send({ 
          username: 'admin', 
          password: 'adminpass' 
        })
        .then(function (res) {
          console.log(res);
        	expect(res).to.have.cookie('connect.sid');
        	agent.close();
        });
    });

  });
 




















});