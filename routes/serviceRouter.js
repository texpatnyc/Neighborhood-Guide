'use strict';

const express = require('express');
const router = express.Router();

const {Service, Comment} = require('../models');

router.get('/', (req, res) => {
	Service
		.find()
		.then(services => {
			res.render('services', {services: services})
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.get('/add-new', (req, res) => {
	res.render('add-new-service')
});

router.get('/:id', (req, res) => {
	Service
		.findById(req.params.id)
		.then(service => {
			res.render('single-service', {service: service})
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'typeOfService', 'address', 'phone', 'description'];
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
			typeOfService: req.body.typeOfService,
			address: req.body.address,
			phone: req.body.phone,
			webUrl: req.body.webUrl,
			photoLink: req.body.photoLink,
			description: req.body.description,
			addedBy: req.body.addedBy
		})
		.then(req.flash('success', 'Service Successfully Added!'))
		.then(res.redirect('services'))
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
				addedBy: {
					firstName: req.body.firstName,
					hometown: req.body.hometown,
					userId: req.body.userId
				},
				comment: req.body.comment,
				date: Date.now()
			};

	Service
		.findByIdAndUpdate(req.params.id, { $push: { comments: obj } })
		.then(req.flash('success', 'Comment Successfully Added!'))
		.then(service => {
			res.redirect('/services/'+ req.params.id)
		})
})

function isAdminOrAuthor(req, res, next) {
	if (req.user && (req.user.username === 'admin' || req.user._id == req.query.commentUserId)) {
		next();
	} else {
		req.flash('failure', 'Not Authorized')
		res.redirect('back')
	}
}

function isAdmin(req, res, next) {
	if (req.user && req.user.username === 'admin') {
		next();
	} else {
		req.flash('failure', 'Not Authorized')
		res.redirect('back')
	}
}

router.delete('/:id/comments/:commentId', isAdminOrAuthor, (req, res) => {
	Service
		.findByIdAndUpdate(req.params.id, { $pull: { comments: {_id: req.params.commentId} } })
		.then(req.flash('success', 'Comment Successfully Deleted!'))
		.then(res.redirect('back'))
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
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

router.delete('/:id', isAdmin, (req, res) => {
	Service
		.findByIdAndRemove(req.params.id)
		.then(req.flash('success', 'Service Successfully Deleted!'))
		.then(res.redirect('/services'))
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = router;


























