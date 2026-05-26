'use strict';

const server = require('../dist/vercel.js');

module.exports = server.default || server;
