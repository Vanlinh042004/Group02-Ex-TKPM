const studentRouter = require('../components/student/routes/studentRoute');

function route(app) {
  app.use('/api/student', studentRouter);
}

module.exports = route;
