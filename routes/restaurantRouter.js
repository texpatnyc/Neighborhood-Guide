'use strict';

const express = require('express');
const router = express.Router();

const {Restaurant, Comment} = require('../models');

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
	Restaurant
		.findById(req.params.id)
		.then(restaurant => {
			res.render('single-restaurant', {restaurant: restaurant})
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['name', 'cuisine', 'address', 'phone', 'webUrl', 'description'];
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

	Restaurant
		.findByIdAndUpdate(req.params.id, { $push: { comments: obj } })
		.then(req.flash('success', 'Comment Successfully Added!'))
		.then(restaurant => {
			res.redirect('/restaurants/'+ req.params.id)
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
	Restaurant
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

router.delete('/:id', isAdmin, (req, res) => {
	Restaurant
		.findByIdAndRemove(req.params.id)
		.then(req.flash('success', 'Restaurant Successfully Deleted!'))
		.then(res.redirect('/restaurants'))
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = router;




// method-override
// ?_method=PUT or DELETE











