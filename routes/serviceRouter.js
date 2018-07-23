'use strict';

const express = require('express');
const router = express.Router();

const {Service} = require('../models');




router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
	Service
		.findById(req.params.id)
		.then(service => res.json(service.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'typeOfService', 'borough', 'address'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	Service
		.create({
			name: req.body.name,
			borough: req.body.borough,
			typeOfService: req.body.typeOfService,
			description: req.body.description,
			address: req.body.address,
			addedBy: req.body.addedBy
		})
		.then(service => res.status(201).json(service.serialize()))
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
	const updateableFields = ['name', 'borough', 'typeOfService', 'address', 'description'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Service
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(service => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

router.delete('/:id', (req, res) => {
	Service
		.findByIdAndRemove(req.params.id)
		.then(service => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = router;

























