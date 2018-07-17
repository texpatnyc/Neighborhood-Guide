'use strict';

const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Restaurant, Nightlife, Service} = require('./models');

const app = express();
app.use(express.json());

//------------------------------------------------------------
//GET Requests
//------------------------------------------------------------

app.get('/restaurants', (req, res) => {
	Restaurant
		.find()
		.then(restaurants => {
			res.json({
				restaurants: restaurants.map(
					(restaurant) => restaurant.serialize())
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

app.get('/restaurants/:id', (req, res) => {
	Restaurant
		.findById(req.params.id)
		.then(restaurant => res.json(restaurant.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

app.get('/nightlife', (req, res) => {
	Nightlife
		.find()
		.then(nightlife => {
			res.json({
				nightlife: nightlife.map(
					(nightlife) => nightlife.serialize())
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

app.get('/nightlife/:id', (req, res) => {
	Nightlife
		.findById(req.params.id)
		.then(nightlife => res.json(nightlife.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

app.get('/services', (req, res) => {
	Service
		.find()
		.then(services => {
			res.json({
				services: services.map(
					(service) => service.serialize())
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

app.get('/services/:id', (req, res) => {
	Service
		.findById(req.params.id)
		.then(service => res.json(service.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});


//------------------------------------------------------------
//POST Requests
//------------------------------------------------------------






































