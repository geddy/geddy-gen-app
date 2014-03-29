#!/usr/bin/env node

var gen = require('../../index');
var argv = process.argv.slice(2);

gen(null, argv);