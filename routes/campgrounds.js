const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
let { checkCampgroundOwnership, isLoggedIn } = require('../middleware');
router.use(isLoggedIn);

//INDEX - show all campgrounds
router.get('/', function (req, res) {
	Campground.find({}, function (err, allCampgrounds) {
		if (err) {
			console.log(err);
		} else {
			res.render('campgrounds/index', { campgrounds: allCampgrounds });
		}
	});
});

//CREATE - add new campground to DB
router.post('/', function (req, res) {
	// get data from form and add to campgrounds array
	let name = req.body.name;
	let image = req.body.image;
	let desc = req.body.description;
	let author = {
		id: req.user._id,
		username: req.user.username
	};
	let newCampground = { name: name, image: image, description: desc, author: author };
	// Create a new campground and save to DB
	Campground.create(newCampground, function (err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			//redirect back to campgrounds page
			console.log(newlyCreated);
			res.redirect('/campgrounds');
		}
	});
});

//NEW - show form to create new campground
router.get('/new', function (req, res) {
	res.render('campgrounds/new');
});

// SHOW - shows more info about one campground
router.get('/:id', function (req, res) {
	//find the campground with provided ID
	Campground.findById(req.params.id)
		.populate('comments')
		.exec(function (err, foundCampground) {
			if (err) {
				console.log(err);
			} else {
				console.log(foundCampground);
				//render show template with that campground
				res.render('campgrounds/show', { campground: foundCampground });
			}
		});
});

// EDIT CAMPGROUND ROUTE
router.get('/:id/edit', checkCampgroundOwnership, function (req, res) {
	Campground.findById(req.params.id, function (err, foundCampground) {
		res.render('campgrounds/edit', { campground: foundCampground });
	});
});

// UPDATE CAMPGROUND ROUTE
router.put('/:id', checkCampgroundOwnership, function (req, res) {
	// find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			//redirect somewhere(show page)
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete('/:id', checkCampgroundOwnership, function (req, res) {
	Campground.findByIdAndRemove(req.params.id, function (err) {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			res.redirect('/campgrounds');
		}
	});
});

module.exports = router;
