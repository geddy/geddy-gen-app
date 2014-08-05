var jake = require('jake');
var path = require('path');
var genutils = require('geddy-genutils');
var validTasks = ['create', 'bower', 'migrate', 'update', 'upgradePrevious'];
var ns = 'app';

module.exports = function(appPath, args) {
  genutils.jake.run(__dirname, ns, validTasks, args);
};