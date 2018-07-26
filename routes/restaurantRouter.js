'use strict';

const express = require('express');
const router = express.Router();

const {Restaurant} = require('../models');

router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
	Restaurant
		.findById(req.params.id)
		.then(res.json)
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'cuisine', 'borough', 'address'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	Restaurant
		.create({
			name: req.body.name,
			borough: req.body.borough,
			cuisine: req.body.cuisine,
			description: req.body.description,
			address: req.body.address,
			addedBy: req.body.addedBy
		})
		.then(restaurant => res.status(201).json(restaurant.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.put('/:id', (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = (
			`Request path id (${req.params.id}) and request body id ` +
			`(${req.body.id}) must match`);
		console.error(message);
		return res.status(400).json({message: message});
	}
	
	const toUpdate = {};
	const updateableFields = ['name', 'borough', 'cuisine', 'address', 'description'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Restaurant
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(restaurant => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

router.delete('/:id', (req, res) => {
	Restaurant
		.findByIdAndRemove(req.params.id)
		.then(restaurant => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = router;

















