'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const {Nightlife, Comment} = require('../models');

function isAdminOrAuthor(req, res, next) {
	if (req.user && (req.user.username === 'admin' || req.user._id == req.query.userId || req.user._id == req.body.userId)) {
		next();
	} else {
		req.flash('error', 'Not Authorized')
		res.redirect('back')
	}
}

router.get('/', (req, res) => {
	Nightlife
		.find()
		.then(nightlife => {
			res.render('nightlife', {nightlife: nightlife})
		})
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('/nightlife')
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
			req.flash('error', 'Internal Server Error');
			res.redirect('/nightlife')
		});
});

router.get('/:id/edit', (req, res) => {
	Nightlife
		.findById(req.params.id)
		.then(nightlife => {
			res.render('edit-nightlife', {nightlife: nightlife})
		})
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'typeOfVenue', 'address', 'description'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			req.flash('error', message);
			return res.redirect('back')
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
			addedBy: {
					firstName: req.body.firstName,
					hometown: req.body.hometown,
					userId: req.body.userId
				}
		})
		.then(req.flash('success', 'Nightlife Successfully Added!'))
		.then(res.redirect('nightlife'))
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

	Nightlife
		.findByIdAndUpdate(req.params.id, { $push: { comments: obj } })
		.then(req.flash('success', 'Comment Successfully Added!'))
		.then(nightlife => {
			res.redirect('/nightlife/'+ req.params.id)
		})
})

router.delete('/:id/comments/:commentId', isAdminOrAuthor, (req, res) => {
	Nightlife
		.findByIdAndUpdate(req.params.id, { $pull: { comments: {_id: req.params.commentId} } })
		.then(req.flash('success', 'Comment Successfully Deleted!'))
		.then(res.redirect('back'))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.put('/:id', isAdminOrAuthor, (req, res) => {
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

	Nightlife
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(req.flash('success', 'Nightlife Successfully Updated!'))
		.then(res.redirect(`/nightlife/${req.params.id}`))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.delete('/:id', isAdminOrAuthor, (req, res) => {
	Nightlife
		.findByIdAndRemove(req.params.id)
		.then(req.flash('success', 'Nightlife Successfully Deleted!'))
		.then(res.redirect('/nightlife'))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

module.exports = router;





























