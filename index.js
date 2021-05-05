require('module-alias/register');

const config = require('config');
const logger = require('@logger');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = require('express')();
app.use('/', require('./api'));
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument),
);

const {port, host}= config.get('serverConfig');
app.listen(port, host, () => {
  logger.info(`listening on ${host} on port ${port}`);
});
