const users = require('../controllers/user.server.controller');

module.exports = function(app) {

    app.route('/api/v1/users')
        .post(users.create);

    app.route('/api/v1/users/login')
        .post(users.login);

    app.route('/api/v1/users/logout')
        .post(users.logout);

    app.route('/api/v1/users/:user_id')
        .get(users.read);

    app.route('/api/v1/users/:user_id')
        .patch(users.change);

    app.route('/api/v1/users/:user_id/photo')
        .get(users.readPhoto)
        .put(users.setPhoto)
        .delete(users.deletePhoto);

    app.route('/api/v1/users/:user_id/reviews')
        .get(users.getReviews);

};
