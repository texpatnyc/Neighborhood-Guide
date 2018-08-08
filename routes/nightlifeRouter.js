'use strict';

const express = require('express');
const router = express.Router();

const {Nightlife} = require('../models');

router.get('/', (req, res) => {
	Nightlife
		.find()
		.then(nightlife => {
			res.render('nightlife', {nightlife: nightlife})
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.get('/add-new', (req, res) => {
	res.render('add-new-nightlife')
});

router.get('/:id', (req, res) => {
	Nightlife
		.findById(req.params.id)
		.then(nightlife => {
			res.render('single-nightlife', {nightlife: nightlife})
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'typeOfVenue', 'address', 'phone', 'webUrl', 'description'];
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
			typeOfVenue: req.body.typeOfVenue,
			address: req.body.address,
			phone: req.body.phone,
			webUrl: req.body.webUrl,
			photoLink: req.body.photoLink,
			description: req.body.description,
			addedBy: req.body.addedBy
		})
		.then(req.flash('success', 'Nightlife Successfully Added!'))
		.then(res.redirect('nightlife'))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.post('/:id/comments', (req, res) => {
	const requiredFields = ['comment'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			return res.status(400).send(message);
		}
	}

	const obj = {
				firstName: req.body.firstName,
				hometown: req.body.hometown,
				comment: req.body.comment,
				date: Date.now()
			};

	Nightlife
		.findByIdAndUpdate(req.params.id, { $push: { comments: obj } })
		.then(req.flash('success', 'Comment Successfully Added!'))
		.then(nightlife => {
			res.redirect('/nightlife/'+ req.params.id)
		})
})

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
		.then(req.flash('success', 'Nightlife Successfully Deleted!'))
		.then(res.redirect('/nightlife'))
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = router;





























