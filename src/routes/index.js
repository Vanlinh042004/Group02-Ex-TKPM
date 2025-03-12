const studentRouter = require('../components/student/routes/StudentRoute');

function route(app) {
  app.use('/api/student', studentRouter);
}

module.exports = route;
