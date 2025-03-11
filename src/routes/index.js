const studentRouter = require('./StudentRoute');

function route(app) {
    app.use('/api/student', studentRouter);
}

module.exports = route;