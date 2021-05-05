const route = require('express').Router();

const {characterController} = require('@controller');

route.get('/', characterController.list);
route.get('/:id', characterController.get);

module.exports = route;
