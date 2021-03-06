var path = require('path')
  , fs = require('fs')
  , cwd = process.cwd()
  , utilities = require('utilities')
  , genutils = require('geddy-genutils')
  , genDirname = path.join(__dirname, '..');

var ns = 'app';

// Load the basic Geddy toolkit
genutils.loadGeddy();
var utils = genutils.loadGeddyUtils();

namespace(ns, function() {
  /*
   task('upgrade', {async: true}, function () {
   var envs = ['development', 'production']
   , doIt = function () {
   var installTask;
   if ((env = envs.shift())) {
   console.log('env', env);
   process.env.environment = env;
   jake.Task['env:config'].reenable();
   jake.Task['env:model'].reenable();
   installTask = jake.Task['db:install'];
   installTask.reenable();
   installTask.on('complete', function () {
   doIt();
   });
   installTask.invoke();
   }
   else {
   complete();
   }
   };
   doIt();
   });

   // Upgrades an app with older scaffolding
   task('upgradePrevious', function (engine, realtime) {
   var basePath = path.join(genDirname, 'base')
   , appViewDir = path.join('app', 'views')
   , appLayoutDir = path.join('app', 'views', 'layouts')
   , templateErrorsDir
   , templateLayoutsDir
   , errorLayouts = [
   'errors.html.ejs'
   , 'layout_footer.html.ejs'
   , 'layout_header.html.ejs'
   ];

   if (!engine || engine == 'default') {
   engine = 'ejs';
   }

   // Get view paths
   templateErrorsDir = realtime === 'realtime' ?
   path.join(basePath, 'realtime', 'views', engine, 'errors') :
   path.join(basePath, 'views', engine, 'errors');
   templateLayoutsDir = realtime === 'realtime' ?
   path.join(basePath, 'realtime', 'views', engine, 'layouts') :
   path.join(basePath, 'views', engine, 'layouts');

   // Copy in errors dir
   jake.cpR(path.join(templateErrorsDir), path.join(appViewDir), {silent: true});

   // Copy in stuff in layout folder
   errorLayouts.forEach(function (filename) {
   jake.cpR(path.join(templateLayoutsDir, filename), path.join(appLayoutDir, filename), {silent: true});
   });

   console.log('[Added] Error templates');
   // Remove patch number from version
   console.log('Upgraded to 0.10. Please run `geddy gen upgrade`.');
   });
   */

  // Delegate to stuff in jakelib/migration.jake
  /*task('migration', {async: true}, function (name) {
    if (!name) {
      throw new Error('No migration name provided.');
    }
    var t = jake.Task['app:migration:create'];
    t.on('complete', function () {
      complete();
    });
    t.invoke.apply(t, arguments);
  });*/
});