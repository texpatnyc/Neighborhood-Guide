'use strict';

const express = require('express');
const router = express.Router();

const {Nightlife} = require('../models');

 

router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
	Nightlife
		.findById(req.params.id)
		.then(nightlife => res.json(nightlife.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'typeOfVenue', 'borough', 'address'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	Nightlife
		.create({
			name: req.body.name,
			borough: req.body.borough,
			typeOfVenue: req.body.typeOfVenue,
			description: req.body.description,
			address: req.body.address,
			addedBy: req.body.addedBy
		})
		.then(nightlife => res.status(201).json(nightlife.serialize()))
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
	const updateableFields = ['name', 'borough', 'typeOfVenue', 'address', 'description'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Nightlife
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(nightlife => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

router.delete('/:id', (req, res) => {
	Nightlife
		.findByIdAndRemove(req.params.id)
		.then(nightlife => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = router;





























