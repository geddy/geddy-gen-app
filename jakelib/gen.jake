var path = require('path')
    , geddyPath = path.normalize(path.join(require.resolve('geddy'), '../../'));

// Load the basic Geddy toolkit
require(path.join(geddyPath,'lib/geddy'));

// Dependencies
var cwd = process.cwd()
    , fs = require('fs')
    , utils = require(path.join(geddyPath, 'lib/utils'))
    , Adapter = require(path.join(geddyPath, 'lib/template/adapters')).Adapter
    , genDirname = path.join(__dirname, '..');

task('default', function(name, engine, realtime) {
  jake.Task['create'].invoke(name, engine, realtime);
});

// Creates a new Geddy app scaffold
task('create', function(name) {
  var basePath = path.join(genDirname, 'base')
      , templatePath = path.join(genDirname, 'template')
      , mkdirs
      , cps
      , text
      , adapter;

  if (!name) {
    throw new Error('No app name specified.');
  }
  var appPath = path.join(process.cwd(), name);

  // create app dir
  jake.mkdirP(appPath);

  // copy template/ into app dir

  var templateFiles = fs.readdirSync(templatePath);
  templateFiles.forEach(function(_path) {
    var fullPath = path.join(templatePath, _path);

    if (fs.statSync(fullPath).isDirectory()) {
      jake.cpR(fullPath, appPath, { silent: true });
    }
    else {
      fs.writeFileSync(path.join(appPath, _path), fs.readFileSync(fullPath));
    }
  });

  cps = [
    ['gitignore.txt', '.gitignore']
  ];

  cps.forEach(function (cp) {
    jake.cpR(path.join(basePath, cp[0]), path.join(appPath, cp[1]), {silent: true});
  });

  // Compile Jakefile
  text = fs.readFileSync(path.join(basePath, 'Jakefile.ejs'), 'utf8').toString();
  adapter = new Adapter({engine: 'ejs', template: text});
  fs.writeFileSync(path.join(appPath, 'Jakefile'), adapter.render({appName: name}), 'utf8');

  // Compile package.json
  text = fs.readFileSync(path.join(basePath, 'package.json.ejs'), 'utf8').toString();
  adapter = new Adapter({engine: 'ejs', template: text});
  fs.writeFileSync(path.join(appPath, 'package.json'), adapter.render({appName: name}), 'utf8');

  console.log('Created app ' + name + '.');
});
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
task('migration', {async: true}, function (name) {
  if (!name) {
    throw new Error('No migration name provided.');
  }
  var t = jake.Task['migration:create'];
  t.on('complete', function () {
    complete();
  });
  t.invoke.apply(t, arguments);
});