const Venue = require('../models/venue.server.model');
const User = require('../models/user.server.model');
const multer = require('multer');
let upload  = multer({ storage: multer.memoryStorage() });

// function for calculating distance between two points with latitude and longitude
function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
    }
}

exports.list = function(req, res){
    Venue.getAll(function (result) {

        // only leaves the items which contain the parameter string of 'q'
        if (req.query['q']) {
            var i = 0;
            for (i = 0; i < result.length; i++) {
                if (!(result[i].venueName.toLowerCase()).includes(req.query['q'].toLowerCase())) delete result[i];
            }

        }
        if (req.query['city']) {
            for (i = 0; i < result.length; i++) {
                if (result[i]) {
                    if (result[i].city.toLowerCase() != req.query['city'].toLowerCase()) delete result[i];
                }
            }
        }
        // only leaves the elements with the value of category id
        if (req.query['categoryId']) {
            var i = 0;
            for (i = 0; i < result.length; i++) {
                if (result[i]) {
                    if (result[i].categoryId != req.query['categoryId']) delete result[i];
                }
            }
        }
        // only leaves the elements with mean star ratings above the value of the minimum
        if (req.query['minStarRating']) {
            var i = 0;
            for (i = 0; i < result.length; i++) {
                if (result[i]) {
                    if (!(result[i].meanStarRating >= req.query['minStarRating'])) delete result[i];
                }
            }
        }
        // only leaves the elements with mean cost rating below the value of the maximum
        if (req.query['maxCostRating']) {
            var i = 0;
            for (i = 0; i < result.length; i++) {
                if (result[i]) {
                    if (!(result[i].modeCostRating <= req.query['maxCostRating'])) delete result[i];
                }
            }
        }

        if (req.query['adminId']) {
            var i = 0;
            for (i = 0; i < result.length; i++) {
                if (result[i]) {
                    if ((result[i].venueId != req.query['adminId'])) delete result[i];
                }
            }
        }

        if (req.query['myLatitude'] && req.query['myLongitude']) {
            var i = 0;
            for (i = 0; i < result.length; i++) {
                if(result[i]) {
                    let d = 0;
                    d = distance(result[0].latitude,result[0].longitude, req.query['myLatitude'], req.query['myLongitude']);
                    result[i].distance = d;
                }
            }
        }

        if (req.query['sortBy'] == 'STAR_RATING' || req.query['sortBy'] == 'COST_RATING') {
            if (req.query['sortBy'] == 'STAR_RATING') result.sort((a, b) => a.meanStarRating < b.meanStarRating ? 1 : -1);
            if (req.query['sortBy'] == 'COST_RATING') result.sort((a, b) => a.modeCostRating > b.modeCostRating ? 1 : -1);
        }
        else if (req.query['sortBy'] == 'DISTANCE') {
            if (!(req.query['myLatitude'] && req.query['myLongitude'])) {
                res.sendStatus(400).end() // no longitude/latitude provided
            }
            else result.sort((a, b) => a.distance > b.distance ? 1 : -1);
        }
        else result.sort((a, b) => a.meanStarRating < b.meanStarRating ? 1 : -1);

        // a set startIndex parameter will slice the array of venues (i.e skip the count of )
        if (req.query['startIndex']) result = result.slice(req.query['startIndex']);
        // a set count parameter will slice the array in chunks (i.e how many venues visible)
        if (req.query['count']) result = result.slice(0, req.query['count']);

        if (req.query['minStarRating'] > 5) res.sendStatus(400);
        else if (result.length != 0) {
            // filtering out the nones in the list (i.e the elements which do not include the string q
            result = result.filter(function (el) {
                return el != null;
            });
            res.json(result)
        } else res.json(result);
    });
};

exports.read = function(req, res) {
    let id = req.params.venue_id;

    // the 'result' will be 'undefined' if it does not exist in the database
    Venue.getOne(id, 0,function (result) {
        if (typeof (result) == 'undefined') {
            res.sendStatus(404);
        } else {
            res.status(200).json(result);
        }
    });
};

exports.list_cat = function(req, res){
    Venue.getAllCat( function(result){
        console.log(result);
        res.json(result);
    });
};

exports.create = function(req, res) {
    let values = req.body;
    let token = req.get('X-Authorization');
    console.log(token);
    User.validateToken(token, 0, function(err, result){
       if (result.length == 0) {
           res.sendStatus(401); // User is unauthorized so cannot post a venue
       } else {
           if (![1, 2, 3, 4, 5].includes(values.categoryId) || typeof values.city === 'undefined' ||
           values.latitude > 90.0 || values.longitude < -180.0) {
               res.sendStatus(400); // when not a valid category, city is not provided, latitude > 90.0 or longitude < -180
           } else {
               Venue.insert(values, result, function (result) {
                   console.log(result);
                   res.status(201).json(result);
               });
           }
       }
    });
};

exports.change = function(req, res) {
    let venue_data = req.body;
    let token = req.get('X-Authorization');
    let admin_id = req.params['venue_id'];
    console.log(admin_id);

    Venue.getOne(admin_id, 1,function (venue) {
        if (typeof (venue) == 'undefined') {
            res.sendStatus(404); // Venue not found
        } else {
            if (typeof token == 'undefined') {
                res.sendStatus(401); // authorization token is not provided
            } else {
                User.validateToken(token, admin_id, function (err, result) {
                    if (err || !result || result.length == 0) {
                        res.sendStatus(403); // user is not an admin
                    } else {
                        Venue.changeVenueDetails(venue, venue_data, function (err, result) {
                            if (err || Object.keys(venue_data).length === 0) res.sendStatus(400); // bad request
                            else {
                                console.log(result);
                                res.sendStatus(200);
                            }
                        })
                    }
                })
            }
        }
    });
};

exports.createReview = function (req, res) {
    let token = req.get('X-Authorization');
    let venue_id = req.params['venue_id'];
    let review_data = req.body;
    let values_given = true;

    if (review_data.starRating > 5 || typeof review_data.starRating === 'undefined') res.sendStatus(400); // if start rating > 5
    else if (!Number.isInteger(review_data.starRating) || !Number.isInteger(review_data.costRating) ||
    review_data.costRating < 0) { res.sendStatus(400); // if starRating / costRating is a decimal or costRating is below 0
    }
    else {
        if (values_given) {
            if (typeof token == 'undefined') {
                res.sendStatus(401); // user is unauthorized
            } else {
                User.validateToken(token, 0, function (err, result) {
                    if (err || !result || result.length == 0) {
                        res.sendStatus(401);
                    } else {
                        let user_id = result[0].user_id;
                        if (user_id == venue_id) {
                            res.sendStatus(403) // user is tries to review their own venue
                        } else {
                            Venue.searchReviews(venue_id, user_id, function (err, alreadyReviewed) {
                                if (alreadyReviewed.length != 0) {
                                    res.sendStatus(403); // user tries to review a venue that they have already reviewed
                                } else {
                                    Venue.insertReview(venue_id, user_id, review_data, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            res.sendStatus(400);
                                        } else {
                                            res.sendStatus(201); // created
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        }
    }
};

exports.readReview = function (req, res) {
    let venue_id = req.params['venue_id'];
    Venue.getReviews(venue_id, function (err, result) {
        if (err) res.sendStatus(404);
        res.send(result[0]); // first review in the list will be most recent
    })
};

exports.postPhoto = function (req, res) {

    //console.log(req.body['description\n']);
    console.log(req.file);

/*    let description = req.body['description\n'];
    let makePrimary = req.body['makePrimary\n'];*/

    let description = req.body.description;
    let makePrimary = req.body.makePrimary;
    let fileName = req.file.filename;
    let token = req.get('X-Authorization');
    let venue_id = req.params['venue_id'];
    let validToken = true;


    console.log(req.body);

    // authentication token check
    if (typeof token === 'undefined') res.sendStatus(401); // user is unauthorised
    else {
        User.validateToken(token, 0, function (err, result) {
            if (err || !result || result.length == 0) {
                res.sendStatus(401);
                validToken = false;
            } else {
                let user_id = result[0].user_id;
                if (validToken) {
                    // file check
                    if (!req.file) {
                        console.log("No file received");    // no photo provided
                        res.sendStatus(400).end();
                    }
                    Venue.getOne(venue_id, 0,function (venue) {
                        console.log(venue);
                        if (typeof (venue) == 'undefined' || venue.length == 0) {
                            res.sendStatus(404); // Venue not found
                        } else if (user_id != venue_id) res.sendStatus(403); // user is not the admin for the venue;
                        else if (!description) res.sendStatus(400);
                        else if (!(makePrimary == 'false' || makePrimary == 'true')) res.sendStatus(400);
                        else {
                            Venue.setPhoto(venue_id, description, makePrimary, fileName, function (err, result) {
                                console.log(err);
                                console.log(result);
                               if (err) res.sendStatus(400);
                               res.sendStatus(201);
                            });
                        }
                    });
                }
            }
        });
    }
};

exports.readPhoto = function (req, res) {
    let venue_id = req.params['venue_id'];
    let fileName = req.params['photoFilename'];
    let photoFound = false;
    Venue.getOne(venue_id, 0,function (venue) {
        if (typeof venue == 'undefined' || venue.length == 0) {
            res.sendStatus(404); // not found
        } else {
            let photos = venue['photos'];
            var i;
            for (i = 0; i < photos.length; i++) {
               if (photos[i].photoFilename == fileName) {   // searching if photo fileName exits
                   photoFound = true;
               }
            }
            if (photoFound) {
                let contents = fileName.split('.');
                if (contents[1] == 'jpg') contents[1] = 'jpeg';
                let contentType = 'image/' + contents[1];
                let path = './venue_photo/' + fileName;
                res.type(contentType).sendfile(path);
            } else {
                res.sendStatus(404);  // filename does not exist for the venue
            }
        }
    })
};

exports.removePhoto = function (req, res) {
    let venue_id = req.params['venue_id'];
    let fileName = req.params['photoFilename'];
    let token = req.get('X-Authorization');
    let photoFound = false;
    Venue.getOne(venue_id, 0, function (venue) {
        let photos = venue['photos'];
        var i;
        for (i = 0; i < photos.length; i++) {
            if (photos[i].photoFilename == fileName) {   // searching if photo fileName exits
                photoFound = true;
            }
        }
        if (photoFound) {
            if (typeof token === 'undefined') res.sendStatus(401); // user is unauthorised
            else {
                User.validateToken(token, 0, function (err, result) {
                    if (err || !result || result.length == 0) res.sendStatus(401); // token is invalid
                    else {
                        let user_id = result[0].user_id;
                        if (user_id != venue_id) res.sendStatus(403); // user is not the admin for the venue;
                        else {
                            Venue.deletePhoto(venue_id, fileName, function (err, result) {
                                if (err) res.sendStatus(404);
                                else res.sendStatus(200);
                            })
                        }
                    }
                })
            }
        } else {
            res.sendStatus(404);
        }
    });
};

exports.setPrimary = function (req, res) {
    let venue_id = req.params['venue_id'];
    let fileName = req.params['photoFilename'];
    let token = req.get('X-Authorization');
    let photoFound = false;

    Venue.getOne(venue_id, 0,function (venue) {
        let photos = venue['photos'];
        var i;
        for (i = 0; i < photos.length; i++) {
            if (photos[i].photoFilename == fileName) {   // searching if photo fileName exits
                photoFound = true;
            }
        }
        if (photoFound) {
            if (typeof token === 'undefined') res.sendStatus(401); // user is unauthorised
            else {
                User.validateToken(token, 0, function (err, result) {
                    if (err || !result || result.length == 0) res.sendStatus(401); // token is invalid
                    else {
                        let user_id = result[0].user_id;
                        if (user_id != venue_id) res.sendStatus(403); // user is not the admin for the venue;
                        else {
                            Venue.primaryPhoto(venue_id, fileName, function (err, result) {
                                if (err) res.sendStatus(404);
                                res.sendStatus(200);
                            })
                        }
                    }
                })
            }
        } else res.sendStatus(404); // not found
    })
};