'use strict';

const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Restaurant, Nightlife, Service} = require('./models');

const app = express();
app.use(express.json());

//------------------------------------------------------------
//GET Requests
//------------------------------------------------------------

app.get('/restaurants', (req, res) => {
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

app.get('/restaurants/:id', (req, res) => {
	Restaurant
		.findById(req.params.id)
		.then(res.json)
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

//EJS rendering

app.get('/nightlife', (req, res) => {
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

app.get('/nightlife/:id', (req, res) => {
	Nightlife
		.findById(req.params.id)
		.then(nightlife => res.json(nightlife.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

app.get('/services', (req, res) => {
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

app.get('/services/:id', (req, res) => {
	Service
		.findById(req.params.id)
		.then(service => res.json(service.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

app.get('/comments', (req, res) => {

	// This is needs to get all comments for a specific recommendation by id

})


//------------------------------------------------------------
//POST Requests
//------------------------------------------------------------

app.post('/restaurants', (req, res) => {
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

app.post('/nightlife', (req, res) => {
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

app.post('/services', (req, res) => {
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



//------------------------------------------------------------
//PUT Requests
//------------------------------------------------------------

app.put('/restaurants/:id', (req, res) => {
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

app.put('/nightlife/:id', (req, res) => {
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

app.put('/services/:id', (req, res) => {
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




//------------------------------------------------------------
//DELETE Requests
//------------------------------------------------------------

app.delete('/restaurants/:id', (req, res) => {
	Restaurant
		.findByIdAndRemove(req.params.id)
		.then(restaurant => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

app.delete('/nightlife/:id', (req, res) => {
	Restaurant
		.findByIdAndRemove(req.params.id)
		.then(nightlife => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

app.delete('/services/:id', (req, res) => {
	Restaurant
		.findByIdAndRemove(req.params.id)
		.then(service => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal Server Error'}));
});




//------------------------------------------------------------
//Server Functions
//------------------------------------------------------------

let server;

function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
				.on('error', err => {
					mongoose.disconnect();
					reject(err);
				});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing Server');
			server.close(err => {
				if (err) {
				return reject(err);
			}
			resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};






























