const apiRoute = require('express').Router();

apiRoute.use('/api/v1/characters', require('./characters'));

module.exports = apiRoute;
