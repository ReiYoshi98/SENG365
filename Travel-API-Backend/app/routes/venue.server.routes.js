const venues = require('../controllers/venue.server.controller');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: './venue_photo',
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage})

module.exports = function(app){

    app.route('/api/v1/venues')
        .get(venues.list)
        .post(venues.create);

    app.route('/api/v1/venues/:venue_id')
        .get(venues.read)
        .patch(venues.change);

    app.route('/api/v1/categories')
        .get(venues.list_cat);

    app.route('/api/v1/venues/:venue_id/reviews')
        .post(venues.createReview)
        .get(venues.readReview);

    app.route('/api/v1/venues/:venue_id/photos')
        .post(upload.single('photo'), venues.postPhoto);

    app.route('/api/v1/venues/:venue_id/photos/:photoFilename')
        .get(venues.readPhoto)
        .delete(venues.removePhoto);

    app.route('/api/v1/venues/:venue_id/photos/:photoFilename/setPrimary')
        .post(venues.setPrimary)

};