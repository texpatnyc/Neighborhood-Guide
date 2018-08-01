'use strict';

const express = require('express');
const router = express.Router();

const {Restaurant} = require('../models');

router.get('/', (req, res) => {
	Restaurant
		.find()
		.then(restaurants => {
			res.render('restaurants', {restaurants: restaurants})
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.get('/add-new', (req, res) => {
	res.render('add-new-restaurant')
});

router.get('/:id', (req, res) => {
	console.log(req.params);
	Restaurant
		.findById(req.params.id)
		.then(restaurant => res.json(restaurant))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'cuisine', 'address', 'phone', 'webUrl', 'description', 'addedBy'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			return res.status(400).send(message);
		}
	}

	Restaurant
		.create({
			name: req.body.name,
			cuisine: req.body.cuisine,
			address: req.body.address,
			phone: req.body.phone,
			webUrl: req.body.webUrl,
			photoLink: req.body.photoLink,
			description: req.body.description,
			addedBy: req.body.addedBy
		})
		.then(req.flash('success', 'Restaurant Successfully Added!'))
		.then(res.redirect('restaurants'))
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

















