var path = require('path')
  , fs = require('fs')
  , cwd = process.cwd()
  , utilities = require('utilities')
  , genutils = require('geddy-genutils')
  , helpers = require('./helpers')
  , genDirname = __dirname;

var ns = 'app';

// Tasks
task('default', function(name, engine, realtime) {
  jake.Task['app:create'].invoke(name, engine, realtime);
});

namespace(ns, function() {
  task('help', function() {
    console.log(
      fs.readFileSync(
        path.join(__dirname, 'help.txt'),
        {encoding: 'utf8'}
      )
    );
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

    var bower = genutils.flagSet(null, '--bower');

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
    genutils.template.write(
      path.join(basePath, 'Jakefile.ejs'),
      path.join(appPath, 'Jakefile'),
      {appName: name}
    );

    // Compile package.json
    genutils.template.write(
      path.join(basePath, 'package.json.ejs'),
      path.join(appPath, 'package.json'),
      {appName: name}
    );

    console.log('Created app ' + name + '.');

    if (bower) {
      process.chdir(appPath);
      jake.Task['app:bower'].invoke();
    }
  });

  desc('Sets up bower for your app.');
  task('bower', function(deps) {
    if (!deps) {
      var deps = {};
    }

    var numDeps = 0;
    for(var key in deps) {
      numDeps++;
    }

    var appPath = process.cwd();
    var pkg = require(path.join(appPath, './package.json'));
    var bowerJsonPath = path.join(appPath, 'bower.json');
    var bowerrcPath = path.join(appPath, '.bowerrc');

    // create bower.json
    if (!fs.existsSync(bowerJsonPath)) {
      genutils.template.write(
        path.join(__dirname, 'bower', 'bower.json.ejs'),
        bowerJsonPath,
        { deps: deps, numDeps: numDeps, pkg: pkg }
      );
    }
    // update existing bower.json
    else {
      var bowerJson = fs.readFileSync(bowerJsonPath, 'utf8');
      fs.writeFileSync(bowerJsonPath, helpers.updateBowerJson(bowerJson, pkg), {encoding: 'utf8'});
      console.log('[Updated] bower.json');
    }

    // create .bowerrc
    if (!fs.existsSync(bowerrcPath)) {
      jake.cpR(path.join(__dirname, 'bower', '.bowerrc'), bowerrcPath, {silent: true});
      console.log('[Added] .bowerrc');
    }

    console.log('Setup bower for your app.');
  });

  desc('Clears the test temp directory.');
  task('clean', function() {
    console.log('Cleaning temp files ...');
    var tmpDir = path.join(__dirname, 'test', 'tmp');
    utilities.file.rmRf(tmpDir, {silent:true});
    fs.mkdirSync(tmpDir);
  });
});

testTask('App', ['app:clean'], function() {
  this.testFiles.exclude('test/helpers/**');
  this.testFiles.exclude('test/geddy-test-app');
  this.testFiles.exclude('test/tmp/**');
  this.testFiles.include('test/**/*.js');
});
