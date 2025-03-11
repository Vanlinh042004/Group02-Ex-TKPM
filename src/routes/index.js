const studentRouter = require('./student');

function route(app) {
    app.use('/api/student', studentRouter);
}

module.exports = route;