const db = require('../../config/db');
const crypto = require('crypto');
const fs = require("fs"); // File reader

let salt = 'fSHpdesioVd/P4e4RKCqNGXD39uIoAWnlUP+9uzD86kzTYt2f0S7tpZ';

exports.getOne = function(userId, done){
    db.getPool().query('SELECT * FROM User WHERE user_id = ?', userId, function(err, rows){
        if (err || !rows || rows.length == 0) return done(err, rows);
        // checking if user is authenticated
        if (rows[0].auth_token && userId == rows[0].user_id) {
            rows = rows.map(row => {
                return {
                    "username": row.username,
                    "email": row.email, // only give email when authenticated
                    "givenName": row.given_name,
                    "familyName": row.family_name,
                }
            });
        } else {
            rows = rows.map(row => {
                return {
                    "username": row.username,
                    "givenName": row.given_name,
                    "familyName": row.family_name,
                }
            });
        }
        return done(rows, err);
    });
};

exports.insert = function(user, done) {

    var user_data = [user.username, user.givenName, user.familyName, user.email, user.password];
    var valid = true;

    // method which checks all information is provided (i.e. username + password + email..)
    user_data.forEach(function(element) {
        if (typeof(element) == 'undefined' || element === "")
            valid = false;
    });

    if (valid)
    {
        // query to check the count of users with the same username or email
        db.getPool().query("SELECT count(*) from User WHERE username = '" + user.username + "' OR email ='" + user.email + "'",
            function (err, result){
            var count = result[0]['count(*)'];
            // only add the user if the username or email is in a valid format (by testing the email string with regex) and is not already taken
            if (count === 0 &&  /\S+@\S+\.\S+/.test(user.email)) {
                // Inserts the body values into the database
                console.log(salt);
                let hashedPassword = hashPassword(user.password);
                console.log(hashedPassword);
                db.getPool().query("INSERT INTO User (username, email, given_name, family_name, password) VALUES ('" + user.username
                    + "', '" + user.givenName + "', '" + user.familyName + "', '" + user.email + "', '" + hashedPassword + "');"
                    , function (err, result) {
                        // var hashedPassword = bcrypt.hashSync(user.password, 8);
                        /*        console.log(hashedPassword);*/
                        if (err) {
                            return done(err);
                        } else {
                            return done(result);
                        }
                    });
            } else {
                return done(null);
            }
        });
    } else {
        // will return null with any errors in the given body
        return done(null);
    }
};

// authenticates the user, by checking if user exists on database via username/email and password combination
exports.authenticate = function(user, done) {
    console.log(user.username, user.email, user.password);

    var query = "SELECT * FROM User WHERE User.username = '" + user.username + "' OR User.email = '" + user.email + "'";
    db.getPool().query(query, function(err, result) {
        if (err || result.length == 0) return done(err, result);
        console.log(result[0].password, user.password);
        let valid = validatePassword(result[0].password, user.password);
        console.log(valid);
        if (valid) done(err, result);
        else {
            err = "password not valid";
            done(err, result);
        }
    });
};

// generates a token for the user
exports.createToken = function(user, done) {
    let token = crypto.randomBytes(16).toString('hex');
    let query = "UPDATE User SET User.auth_token = '" + token + "' WHERE User.username = '" + user[0].username + "'";
    db.getPool().query(query, function(err, result) {
        console.log(result);
    });
    return done(token);
};

// sets the token on the user, sends the query to update the value on the database
exports.setToken = function(user, token, done){
    user = user.map(row => {
        return {
            "userId": row.user_id,
            "token": token
        }
    });
    return done(user);
};

exports.validateToken = function(token, user_id, done) {
    console.log(token);
    if (!user_id) {
        let query = "SELECT * FROM User WHERE User.auth_token = '" + token + "'";
        console.log(query);
        db.getPool().query(query, function (err, result) {
            if (result.length == 0) done(err, result);
            else {
                return done(err, result)
            }
        })
    } else {
        let query = "SELECT * FROM User WHERE User.auth_token = '" + token + "' AND User.user_id = " + user_id + "";
        console.log(query);
        db.getPool().query(query, function (err, result) {
            //console.log(result);
            if (result.length == 0 || err) return done(err, result);
            else {
                return done(err, result)
            }
        })
    }
};

exports.delToken = function(user, done) {

    let query = "UPDATE User SET User.auth_token = null WHERE User.user_id = " + user[0].user_id + "";
    db.getPool().query(query, function (err, result) {
        if (err) done(err, result);
        else done(err, result);
    })
};

exports.changeDetails = function(user_data, change_data, done) {
    let user = user_data[0];
    console.log(user);

    if (change_data.username) user.username = change_data.username;
    if (change_data.email) user.email = change_data.email;
    if (change_data.givenName) user.given_name = change_data.givenName;
    if (change_data.familyName) user.family_name = change_data.familyName;
    if (change_data.password) user.password = change_data.password;

    console.log(user);
    let query = "UPDATE User SET username = '" + user.username + "', email = '" + user.email + "', given_name = '" + user.given_name
    + "', family_name = '" + user.family_name + "', password = '" + user.password + "' WHERE user_id = " + user.user_id + "";
    console.log(query);
    db.getPool().query(query, function (err, result) {
        console.log(result);
        if (err) done(err, result);
        else done(err, result);
    });
};

exports.insertPhoto = function(req, user_id, fileType, done) {
    let alreadySet = false;
    let query = "SELECT * FROM User WHERE user_id = " + user_id + ";";

    db.getPool().query(query, function (err, result) {
        if (result[0].profile_photo_filename) alreadySet = true; // If not null

        let fileName = "ID: " + user_id + " " + result[0].username + fileType;
        let query2 = "UPDATE User SET profile_photo_filename = '" + fileName + "' WHERE user_id = " + user_id + ";";
        console.log(query2);
        db.getPool().query(query2);

        const eventEmitter = req.pipe(fs.createWriteStream('./user_photos/' + fileName));
        eventEmitter.on('finish', function(){
            done(err, alreadySet);
        });
    });
};

exports.getFilename = function(user_id, done) {
    let fileName = "";
    let query = "SELECT * FROM User WHERE user_id = " + user_id + ";";
    db.getPool().query(query, function (err, result) {
        if (typeof result[0] !== 'undefined') {
            fileName = result[0]['profile_photo_filename'];
        }
        if (err) done(err);
        return done(err, fileName);
    })
};

exports.deletePhoto = function(user_id, filename, done) {
    let path = './user_photos/' + filename;
    fs.unlink(path, function(err) {
        if (err) done(err, result);
    });
    let query = "UPDATE User SET profile_photo_filename = null WHERE user_id = " + user_id + ";";
    db.getPool().query(query, function (err, result) {
        done(err, result);
    })
};

exports.searchReviews = function(user_id, done) {
    let query = "SELECT * FROM User, Review, Venue WHERE User.user_id = " + user_id + " AND Review.review_author_id = " +
        "User.user_id AND Review.reviewed_venue_id = Venue.venue_id";
    console.log(query);
    db.getPool().query(query, function (err, result) {
        result = result.map(row => {
            return {
                "reviewAuthor": {
                    "userId": row.user_id,
                    "username": row.username
                },
                "reviewBody": row.review_body,
                "starRating": row.star_rating,
                "costRating": row.cost_rating,
                "timePosted": row.time_posted,
                "venue": {
                    "venueId": 0,
                    "venueName": row.venue_name,
                    "categoryName": row.category_id,
                    "city": row.city,
                    "shortDescription": row.short_description,
                    "primaryPhoto": row.profile_photo_filename
                }
            }
        });
        done(err, result);
    })
};

function hashPassword(password) {
    let hashed = crypto.pbkdf2Sync(password, salt, 100000, 20, "sha256").toString("hex");
    return hashed
}

function validatePassword(savedHash, passwordAttempt) {
    return savedHash == crypto.pbkdf2Sync(passwordAttempt, salt, 100000, 20, "sha256").toString("hex");
}