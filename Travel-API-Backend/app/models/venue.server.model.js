const db = require('../../config/db');
const fs = require("fs"); // File reader

exports.getAll = function(done){
    let query = 'SELECT * FROM (Venue, User) LEFT JOIN Review ON Venue.venue_id = Review.reviewed_venue_id ' +
        'LEFT JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id AND VenuePhoto.is_primary = 1 WHERE Venue.admin_id = User.user_id GROUP BY User.user_id';
    console.log(query);
    db.getPool().query(query, function ( err , rows) {
        if (err) return done({"ERROR": "Error selecting"});
        console.log(rows);
        rows = rows.map(row=> {
           return {
            "venueId": row.admin_id,
               "venueName": row.venue_name,
               "categoryId": row.category_id,
               "city": row.city,
               "shortDescription": row.short_description,
               "latitude": row.latitude,
               "longitude": row.longitude,
               "meanStarRating": row.star_rating,
               "modeCostRating": row.cost_rating,
               "primaryPhoto": row.photo_filename,
               "distance": null

        }});
        return done(rows);
    });
};

exports.getOne = function(venueId, forPatch, done){
    // query for checking the Venue, User, VenueCategory and VenuePhoto link
    db.getPool().query('SELECT * FROM (Venue, User, VenueCategory) LEFT JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id' +
        ' WHERE Venue.venue_id = ? AND Venue.admin_id = User.user_id AND Venue.category_id = VenueCategory.category_id',
        venueId, function(err, rows){
        if(err) return done(err);
        if (!forPatch) {
            rows = rows.map(row => {
                if (row.is_primary == 1) row.is_primary = true;
                if (row.is_primary == 0) row.is_primary = false;
                return {
                    "venueName": row.venue_name,
                    "admin": {
                        "userId": row.user_id,
                        "username": row.username
                    },
                    "category": {
                        "categoryId": row.category_id,
                        "categoryName": row.category_name,
                        "categoryDescription": row.category_description
                    },
                    "city": row.city,
                    "shortDescription": row.short_description,
                    "longDescription": row.long_description,
                    "dateAdded": row.date_added,
                    "address": row.address,
                    "latitude": row.latitude,
                    "longitude": row.longitude,
                    "photos": [
                        {
                            "photoFilename": row.photo_filename,
                            "photoDescription": row.photo_description,
                            "isPrimary": row.is_primary,
                        }
                    ]
                }
            });
            if (rows.length != 0 && !(rows[0]['photos'][0].photoFilename)) {
                rows[0]['photos'] = [];
            }
            if (rows.length > 1) {
                var i;
                for (i = 1; i < rows.length; i++) {
                    rows[0]['photos'].push(rows[i]['photos'][0]);
                }
            }
            done(rows[0]);
        } else {
            done(rows[0]);
        }
    });
};

exports.getAllCat = function(done){
    db.getPool().query('SELECT * FROM VenueCategory', function ( err, rows) {
        if (err) return done({"ERROR": "Error selecting"});
        rows = rows.map(row=> {
            return {
                "categoryId": row.category_id,
                "categoryName": row.category_name,
                "categoryDescription": row.category_description
            }
        });
        return done(rows);
    });
};

exports.insert = function(venue, user, done) {

    var today = new Date();

    var dd = String(today.getUTCDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    let query = "INSERT INTO Venue (admin_id, category_id, venue_name, city, short_description, long_description, " +
        "date_added, address, latitude, longitude) VALUES (" + user[0].user_id + ", " + venue.categoryId + ", \""
        + venue.venueName + "\", \"" + venue.city + "\", \"" + venue.shortDescription + "\", \"" + venue.longDescription + "\", '"
        + today + "', \"" + venue.address + "\", " + venue.latitude + ", " + venue.longitude + ");";
    console.log(query);
    db.getPool().query(query, function(err, result) {
        if (err) return done(err);
        result = { "venueId" : result.insertId};
        return done(result);
    });
};

exports.changeVenueDetails = function(venue, change_data, done) {

    if (typeof change_data.venueName !== 'undefined') venue.venue_name = change_data.venueName;
    if (typeof change_data.categoryId !== 'undefined') venue.category_id = change_data.categoryId;
    if (typeof change_data.city !== 'undefined') venue.city  = change_data.city;
    if (typeof change_data.shortDescription !== 'undefined') venue.short_description = change_data.shortDescription;
    if (typeof change_data.longDescription !== 'undefined') venue.long_description = change_data.longDescription;
    if (typeof change_data.address !== 'undefined') venue.address = change_data.address;
    if (typeof change_data.latitude !== 'undefined') venue.latitude = change_data.latitude;
    if (typeof change_data.longitude !== 'undefined') venue.longitude = change_data.longitude;

    console.log(venue);

    let query = "UPDATE Venue SET venue_name = \"" + venue.venue_name + "\", category_id = " + venue.category_id + ", city = \"" + venue.city
        + "\", short_description = \"" + venue.short_description + "\", long_description = \"" + venue.long_description + "\", address = \"" + venue.address
    + "\", latitude = " + venue.latitude + ", longitude = " + venue.longitude + " WHERE admin_id = " + venue.user_id + ";";
    console.log(query);

    db.getPool().query(query, function (err, result) {
        console.log(result);
        done(err, result);
    });
};

exports.searchReviews = function(venue_id, user_id, done) {
    let query = "SELECT * FROM Review WHERE reviewed_venue_id = " + venue_id + " AND review_author_id = " + user_id + "";
    db.getPool().query(query, function (err, result) {
        if (err) done (err, result);
        done(err, result);
    })
};

exports.getReviews = function(venue_id, done) {
    let query = "SELECT * FROM (Review, User) WHERE Review.reviewed_venue_id = " + venue_id + " AND Review.review_author_id = User.user_id";
    console.log(query);
    db.getPool().query(query, function (err, result) {
        console.log(result);
        if (err || result.length == 0) done (err, result);
        // sort in reverse chronological order
        result.sort(function(a,b){
            return new Date(b.time_posted) - new Date(a.time_posted);
        });
        result = result.map(row=> {
            return {
                "reviewAuthor": {
                    "userId": row.user_id,
                    "username": row.username
                },
                "reviewBody": row.review_body,
                "starRating": row.star_rating,
                "costRating": row.cost_rating,
                "timePosted": row.time_posted
            }
        });
        return done (err, result);
    })
};

exports.insertReview = function(venue_id, user_id, review_data, done) {

    var d = new Date();
    d = new Date(d.getTime() - 3000000);
    var date_format = d.getFullYear().toString()+"-"+((d.getMonth()+1).toString().length==2?(d.getMonth()+1).toString():
        "0"+(d.getMonth()+1).toString())+"-"+(d.getDate().toString().length==2?d.getDate().toString():"0"+d.getDate().toString())
        +" "+(d.getHours().toString().length==2?d.getHours().toString():"0"+d.getHours().toString())+":"+
        ((parseInt(d.getMinutes()/5)*5).toString().length==2?(parseInt(d.getMinutes()/5)*5).toString():"0"+
            (parseInt(d.getMinutes()/5)*5).toString())+":00";

    if (typeof review_data.reviewBody === 'undefined') review_data.reviewBody = "not given";
    if (typeof review_data.starRating === 'undefined') review_data.starRating = 0;
    if (typeof review_data.costRating === 'undefined') review_data.costRating = 0;

    let query = "INSERT INTO Review (reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating, time_posted)" +
        " VALUES (" + venue_id + ", " + user_id + ", \"" + review_data.reviewBody + "\", " + review_data.starRating + ", " +
        review_data.costRating + ", '" + date_format + "')";
    console.log(query);
    db.getPool().query(query, function (err, result) {
        if (err) done (err, result);
        done(err, result);
    })
};

exports.setPhoto = function(venue_id, description, makePrimary, fileName, done) {
    let query = "SELECT * FROM VenuePhoto WHERE venue_id = " + venue_id + "";
    db.getPool().query(query, function (err, result) {
        if (err) done(err, result);

        // if photos for this venue already exists
        console.log(result);
        if (result.length > 0 && makePrimary == 'true') {
            let updateQuery = "UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = " + venue_id + "";
            db.getPool().query(updateQuery, function (err, result) {
                if (err) done(err, result);
            });
        }
        // inserting values
        let is_primary = 0;
        // makePrimary is set true or there is no existing photos for the venue
        if (makePrimary == 'true' || result.length == 0) is_primary = 1;

        let insertQuery = "INSERT INTO VenuePhoto VALUES (" + venue_id + ", \"" + fileName + "\", \"" + description + "\", " + is_primary + ")";
        console.log(insertQuery);
        db.getPool().query(insertQuery, function (err, result) {
            if (err) done(err, result);
            done(err, result);
        });
    });
};

exports.deletePhoto = function(venue_id, fileName, done) {
    let wasPrimary = 0;
    let query = "SELECT * FROM VenuePhoto WHERE venue_id = " + venue_id + " AND photo_filename = \"" + fileName + "\"";
    db.getPool().query(query, function (err, result) {
        if (err || result.length == 0) {
            let err = "No file";
            done(err, result);
        }
        if (result.is_primary == 1) wasPrimary = 1;
        query = "DELETE FROM VenuePhoto WHERE photo_filename = \"" + fileName + "\"";
        db.getPool().query(query);

        let path = './venue_photo/' + fileName;
        fs.unlink(path, function(err) {
            if (err) done(err, result);
            if (wasPrimary) {
                // setting random photo to be primary (i.e the first one)
                query = "UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id IN (SELECT 1 FROM VenuePhoto WHERE venue_id = " + venue_id + ")";
                console.log(query);
                db.getPool().query(query, function (err, result) {
                    if (err) {
                        err = "No other venue";
                        done(err, result);
                    }
                    done(err, result);
                })
            }
            else done(err, result);
        });
    })
};

exports.primaryPhoto = function(venue_id, fileName, done) {
    let query = "UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = " + venue_id + "";
    // Set all the photos to not primary
    db.getPool().query(query, function (err, result) {
        if (err) done(err, result)
        query = "UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = " + venue_id + " AND photo_filename = \"" + fileName + "\"";
        // set filename to primary
        db.getPool().query(query, function (err, result) {
            if (err) done (err, result);
            done(err, result);
        })
    })
};