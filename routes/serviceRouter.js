'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const {Service, Comment} = require('../models');

router.get('/', (req, res) => {
	Service
		.find()
		.then(services => {
			res.render('services', {services: services})
		})
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('/services')
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
			req.flash('error', 'Internal Server Error');
			res.redirect('/services')
		});
});

router.get('/:id/edit', (req, res) => {
	Service
		.findById(req.params.id)
		.then(service => {
			res.render('edit-service', {service: service})
		})
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'typeOfService', 'address', 'description'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			req.flash('error', message);
			return res.redirect('back')
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
		})
		.then(req.flash('success', 'Service Successfully Added!'))
		.then(res.redirect('services'))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.post('/:id/comments', (req, res) => {
	const requiredFields = ['comment'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			req.flash('error', message);
			return res.redirect('back');
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
		req.flash('error', 'Not Authorized')
		res.redirect('back')
	}
}

function isAdmin(req, res, next) {
	if (req.user && req.user.username === 'admin') {
		next();
	} else {
		req.flash('error', 'Not Authorized')
		res.redirect('back')
	}
}

router.delete('/:id/comments/:commentId', isAdminOrAuthor, (req, res) => {
	Service
		.findByIdAndUpdate(req.params.id, { $pull: { comments: {_id: req.params.commentId} } })
		.then(req.flash('success', 'Comment Successfully Deleted!'))
		.then(res.redirect('back'))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.put('/:id', isAdmin, (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = (
			`Request path id (${req.params.id}) and request body id ` +
			`(${req.body.id}) must match`);
		req.flash('error', message);
		return res.redirect('back');
	}
	
	const toUpdate = {};
	const updateableFields = ['typeOfVenue', 'address', 'phone', 'webUrl', 'photoLink', 'description'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Service
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(req.flash('success', 'Service Successfully Updated!'))
		.then(res.redirect(`/services/${req.params.id}`))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.delete('/:id', isAdmin, (req, res) => {
	Service
		.findByIdAndRemove(req.params.id)
		.then(req.flash('success', 'Service Successfully Deleted!'))
		.then(res.redirect('/services'))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

module.exports = router;


























