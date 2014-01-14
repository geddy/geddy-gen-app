module.exports = function(appPath, args) {
  var jake = require('jake');
  var path = require('path');
  // force to load local Jakefile and jakelib
  args.push('--jakefile');
  args.push(path.join(__dirname,'Jakefile'));
  args.push('--jakelibdir');
  args.push(path.join(__dirname,'jakelib'));

  // run our tasks
  jake.run.apply(jake, args);
}