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
    var views = genutils.flagSet(null, '--views');

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

    process.chdir(appPath);

    if (bower) {
      jake.Task['app:bower'].invoke();
    }

    if (views) {
      jake.Task['app:views'].invoke();
    }
  });

  desc('Sets up bower for your app.');
  task('bower', function(deps) {
    if (!genutils.inAppRoot()) {
      fail('You must run this generator from the root of your application.');
      return;
    }

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

  desc('Creates the main views for your app.');
  task('views', {async: true}, function(engine, framework, templatesDir) {
    if (!genutils.inAppRoot()) {
      fail('You must run this generator from the root of your application.');
      return;
    }

    if (!engine) {
      var engine = process.env['engine'] || 'ejs';
    }

    if (!framework) {
      var framework = process.env['framework'] || 'bootstrap/none';
    }

    // parse the framework
    framework = framework.split('/', 2);
    framework = {
      css: framework[0],
      js: (framework.length == 2) ? framework[1] : 'none'
    };

    if (!templatesDir) {
      var templatesDir = process.env['templates'] || path.join(__dirname, 'views');
    }

    var bower = genutils.flagSet(null, '--bower');
    var ext = genutils.template.getExtFromEngine(engine);
    var appPath = process.cwd();

    var viewData = {
      engine: engine,
      framework: framework,
      genutils: genutils
    };

    // create views
    genutils.jake.loadFiles(genutils.getGenDir('geddy-gen-view'));
    var viewTask = jake.Task['view:create'];

    var files = new jake.FileList();
    files.include(templatesDir + '/**/*.html.ejs');

    files.toArray().forEach(function(file) {
      var relFile = path.relative(templatesDir, file);
      viewTask.reenable();
      viewTask.invoke(
        path.join(path.dirname(relFile), path.basename(relFile, path.extname(file)) + ext),
        file,
        viewData,
        transformTemplate
      );
    });

    // copy templates from the public/ folder
    var publicDir = path.join(__dirname, 'public');
    files = new jake.FileList();
    files.include(publicDir + '/**/*.*');

    files.toArray().forEach(function(file) {
      var relFile = path.relative(publicDir, file);
      var ext = path.extname(file);
      var dest;

      // render templates
      if (ext === '.ejs') {
        dest = path.join(appPath, 'public', path.dirname(relFile), path.basename(relFile, ext));
        jake.mkdirP(path.dirname(dest));
        genutils.template.write(
          file, dest,
          viewData,
          transformTemplate
        );
      }
      // but copy regular files
      else {
        dest = path.join(appPath, 'public', relFile);
        jake.mkdirP(path.dirname(dest));
        jake.cpR(file, dest, {silent: true});
      }
    });

    // install bower components based on frameworks
    if (bower) {
      console.log('installing bower components now ...');
      var deps = ['jquery'];
      if (['bootstrap', 'foundation'].indexOf(framework.css) !== -1) {
        deps.push(framework.css);
      }

      genutils.bower.install(deps, onBowerInstalled)
    }

    function transformTemplate(content)
    {
      return content.replace(/\<\@/g, '<%').replace(/\@\>/g, '%>').trim();
    }

    function onBowerInstalled(err)
    {
      if (err) {
        console.error(err);
      }

      complete();
    }
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
