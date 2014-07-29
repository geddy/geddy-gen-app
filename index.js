var jake = require('jake');
var path = require('path');
var validTasks = ['create','migrate','update','upgradePrevious'];

module.exports = function(appPath, args) {
  // keep support of old style gen syntax
  if (args.length > 0 && validTasks.indexOf(args[0]) === -1) {
    console.warn('This syntax is deprecated and will not be supported in future versions.\nThe new syntax is: geddy gen app create[app-name].\n');
    args = ['default[' + args.join(',') + ']'];
  }
  else if(args.length == 0) {
    args = ['help'];
  }

  // force to load local Jakefile and jakelib
  args.push('--jakefile');
  args.push(path.join(__dirname,'Jakefile'));
  args.push('--jakelibdir');
  args.push(path.join(__dirname,'jakelib'));

  // run our tasks
  jake.run.apply(jake, args);
}

validTasks.forEach(function(task) {
  module.exports[task] = function() {
    var t = jake.Task.create;
    t.invoke.apply(t, Array.prototype.slice.call(arguments));
  }
});