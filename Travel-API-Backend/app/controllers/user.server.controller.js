const User = require('../models/user.server.model');
const fs = require("fs"); // File reader

exports.create = function(req, res) {
    let user_data = req.body;

    User.insert(user_data, function(result){
        if (result == null ) {
            res.status(400).send("bad request");
        } else {
            result = {"userId": +" " + result.insertId};
            res.status(201).json(result);
        }
    });
};

exports.login = function(req, res) {
    let user_data = req.body;
    User.authenticate(user_data, function(err, result){
        if (err || result.length == 0) {
            res.sendStatus(400);
        } else {
            User.createToken(result, function (token) {
                console.log(token);
                if (token) {
                    User.setToken(result, token, function (result) {
                        res.json(result[0]);
                    })
                }
            })
        }
    })
    //
};

// logs out the user
exports.logout = function(req, res) {
    let token = req.get('X-Authorization');
    console.log(token);
    User.validateToken(token,0, function(err, result){
        if (result.length == 0) {
            res.sendStatus(401);
        } else {
            User.delToken(result, function(err, result){
                res.sendStatus(200);
            })

        }
    });
};

exports.read = function(req, res) {
    let id = req.params.user_id;

    User.getOne(id, function (result, err) {
        if (err) {
            res.status(404).send('User Not Found');
        } else {
            res.json(result[0]);
        }
    });
};

exports.change = function(req, res) {
    let user_token = req.get('X-Authorization');
    let user_id = req.params.user_id;
    let data_ok = true; // Boolean to check if each variable has a value (e.g. no empty email)
    console.log(user_id);
    let user_data = req.body;
    if (user_token == null) {
        res.sendStatus(401); // Unauthorized, no authentication token
    } else {
        if (Object.keys(user_data).length === 0 || typeof user_data.password === 'number') { // No data provided or if password is a number
            res.sendStatus(400);
        } else {
            Object.keys(user_data).forEach(function(key) { // checking there is no empty values in the body
                if (user_data[key].length == 0) data_ok = false;
            });
            if (data_ok) {
                User.validateToken(user_token, user_id, function (err, result) {
                    if (err || result.length == 0) {
                        res.sendStatus(403) // authentication token is for different user
                    } else {
                        User.changeDetails(result, user_data, function (err, result) {
                            if (err) {
                                res.sendStatus(400);
                            } else {
                                res.sendStatus(200);
                            }
                        })
                    }
                })
            } else {
                res.sendStatus(400);
            }
        }
    }
};

exports.readPhoto = function(req, res) {
    let user_id = req.params.user_id;

    User.getFilename(user_id, function (err, result) {
        if (err || !result) res.sendStatus(404); // Image or User not found
        else {
            let path  = './user_photos/' + result;
            let contents = result.split('.');
            if (contents[1] == 'jpg') contents[1] = 'jpeg';
            if (contents[1] == 'jpeg' || contents[1] == 'png') {
                let contentType = 'image/' + contents[1];
                console.log(contentType);
                if (err) res.sendStatus(404);
                else {
                    fs.readFile(path, function(err, data) {
                        if (err) res.sendStatus(404);
                        console.log(data);
                        res.writeHead(200, {'Content-Type': contentType});
                        res.end(data);
                    });
                }
            }
        }
    })
};

exports.setPhoto = function(req, res) {
    let user_id = req.params.user_id;
    let user_token = req.get('X-Authorization');
    let contentType = req.get('Content-Type');
    let fileType = null;

    if (contentType == "image/jpeg") fileType = ".jpeg";
    else if (contentType == "image/png") fileType = ".png";
    else res.status(400); // bad request

    User.getOne(user_id, function (result, err) {
        if (err || result.length == 0) {
            res.sendStatus(404); // user not found
        } else {
            if (typeof user_token === 'undefined') {
                res.sendStatus(401); // user is unauthorized
            } else {
                User.validateToken(user_token, user_id, function (err, result) {
                    if (err || result.length == 0) {
                        res.sendStatus(403); // authentication token is for different user
                    } else {
                        User.insertPhoto(req, user_id, fileType, function (err, result) {
                            if (err) res.sendStatus(400);
                            if (result) res.sendStatus(200); // if photo is already set
                            else res.sendStatus(201);
                        });
                    }
                })
            }
        }})
};

exports.deletePhoto = function(req, res) {
    let user_id = req.params.user_id;
    let user_token = req.get('X-Authorization');

    User.getOne(user_id, function (result, err) {
        if (err || result.length == 0) {
            res.sendStatus(404); // user does not exist
        } else {
            if (typeof user_token === 'undefined') {
                res.sendStatus(401); // user is unauthorized
            } else {
                User.validateToken(user_token, user_id, function (err, result) {
                    if (err || result.length == 0) {
                        res.sendStatus(403); // authentication token is for different user
                    } else {
                        User.getFilename(user_id, function (err, result) {
                            if (err || !result) res.sendStatus(404); // Image or User not found
                            else {
                                User.deletePhoto(user_id, result, function (err, result) {
                                    if (err) res.sendStatus(400);
                                    else res.sendStatus(200);
                                });
                            }
                        })

                    }
                })
            }
        }
    })
};

exports.getReviews = function(req, res) {
    let user_id = req.params.user_id;
    let user_token = req.get('X-Authorization');

    if (typeof user_token === 'undefined') {
        res.sendStatus(401); // user is unauthorized
    } else {
        User.validateToken(user_token, user_id, function (err, result) {
            if (err || result.length == 0) {
                res.sendStatus(401); // authentication token is for different user
            } else {
                User.searchReviews(user_id, function (err, result) {
                    if (err || result.length == 0) res.sendStatus(404);
                    res.json(result);
                });
            }
        })
    }
};