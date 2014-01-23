module.exports = function(appPath, args) {
  var jake = require('jake');
  var path = require('path');

  // keep support of old style app gen syntax
  if (args.length > 0) {
    // TODO: add deprecation warning
    args[0] = 'create[' + args[0] + ']';
  }

  // force to load local Jakefile and jakelib
  args.push('--jakefile');
  args.push(path.join(__dirname,'Jakefile'));
  args.push('--jakelibdir');
  args.push(path.join(__dirname,'jakelib'));

  // run our tasks
  jake.run.apply(jake, args);
}