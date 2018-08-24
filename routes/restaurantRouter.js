'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const {Restaurant, Comment} = require('../models');

router.get('/', (req, res) => {
	Restaurant
		.find()
		.then(restaurants => {
			res.render('restaurants', {restaurants: restaurants})
		})
.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('/restaurants')
		});
});

router.get('/add-new', (req, res) => {
	res.render('add-new-restaurant')
});

router.get('/:id', (req, res) => {
	Restaurant
		.findById(req.params.id)
		.then(restaurant => {
			res.render('single-restaurant', {restaurant: restaurant})
		})
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('/restaurants')
		});
});

router.get('/:id/edit', (req, res) => {
	Restaurant
		.findById(req.params.id)
		.then(restaurant => {
			res.render('edit-restaurant', {restaurant: restaurant})
		})
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'cuisine', 'address', 'description'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			req.flash('error', message);
			return res.redirect('back')
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
			addedBy: {
					firstName: req.body.firstName,
					hometown: req.body.hometown,
					userId: req.body.userId
				}
		})
		.then(req.flash('success', 'Restaurant Successfully Added!'))
		.then(res.redirect('restaurants'))
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

	Restaurant
		.findByIdAndUpdate(req.params.id, { $push: { comments: obj } })
		.then(req.flash('success', 'Comment Successfully Added!'))
		.then(restaurant => {
			res.redirect('/restaurants/'+ req.params.id)
		})
})

function isAdminOrAuthor(req, res, next) {
	if (req.user && (req.user.username === 'admin' || req.user._id == req.query.userId || req.user._id == req.body.userId)) {
		next();
	} else {
		req.flash('error', 'Not Authorized')
		res.redirect('back')
	}
}

router.delete('/:id/comments/:commentId', isAdminOrAuthor, (req, res) => {
	Restaurant
		.findByIdAndUpdate(req.params.id, { $pull: { comments: {_id: req.params.commentId} } })
		.then(req.flash('success', 'Comment Successfully Deleted!'))
		.then(res.redirect('back'))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.put('/:id', isAdminOrAuthor, (req, res) => {
	console.log('put is running')
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = (
			`Request path id (${req.params.id}) and request body id ` +
			`(${req.body.id}) must match`);
		req.flash('error', message);
		return res.redirect('/nightlife/:id');
	}
	
	const toUpdate = {};
	const updateableFields = ['cuisine', 'address', 'phone', 'webUrl', 'photoLink', 'description'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Restaurant
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(req.flash('success', 'Restaurant Successfully Updated!'))
		.then(res.redirect(`/restaurants/${req.params.id}`))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

router.delete('/:id', isAdminOrAuthor, (req, res) => {
	Restaurant
		.findByIdAndRemove(req.params.id)
		.then(req.flash('success', 'Restaurant Successfully Deleted!'))
		.then(res.redirect('/restaurants'))
		.catch(err => {
			req.flash('error', 'Internal Server Error');
			res.redirect('back')
		});
});

module.exports = router;













