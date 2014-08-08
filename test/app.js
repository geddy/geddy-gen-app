var path = require('path')
  , assert = require('assert')
  , fs = require('fs')
  , exec = require('child_process').exec
  , tests;

var testAppDir = path.join(__dirname, 'geddy-test-app');
var tmpTestAppDir = path.join(__dirname, 'tmp', 'geddy-test-app');

function clearViews()
{
  var viewsPath = path.join(tmpTestAppDir, 'app', 'views');
  jake.rmRf(viewsPath, {silent: true});
  jake.mkdirP(viewsPath, {silent: true});
}

function createViews()
{
  var args = Array.prototype.slice.call(arguments);
  var next = args.shift();

  process.chdir(tmpTestAppDir);

  var p = exec(path.join(__dirname, 'helpers', 'exec.js') + ' views ' + args.join(' '), onGenDone);
  p.stdout.pipe(process.stdout);

  function onGenDone(err, stdout, stderr)
  {
    if (err) {
      console.error(err);
      fail();
      return;
    }

    // TODO: compare with fixtures
    next();
  }
}

tests = {
  'Create test app': function(next)
  {
    // go to tmp dir
    process.chdir(path.join(__dirname, 'tmp'));

    var p = exec(path.join(__dirname, 'helpers', 'exec.js') + ' geddy-test-app --bower', onGenDone);
    p.stdout.pipe(process.stdout);

    function onGenDone(err, stdout, stderr)
    {
      if (err) {
        console.log(err);
        fail();
        return;
      }

      // check validity of test app
      if (!fs.existsSync(tmpTestAppDir) || !fs.statSync(tmpTestAppDir).isDirectory()) {
        fail();
        return;
      }

      var appFiles = jake.readdirR(testAppDir);
      var tmpAppFiles = jake.readdirR(tmpTestAppDir);

      // on some servers hidden files are not copied over, this includes 3 .gitkeep files
      assert.ok(appFiles.length === tmpAppFiles.length || appFiles.length === tmpAppFiles.length - 3);

      // compare name and contents of each file
      tmpAppFiles.forEach(function(file, i) {
        var relFile = path.relative(tmpTestAppDir, file);
        var testAppFile = path.join(testAppDir, relFile);

        // does file exist in test app?
        assert.equal(fs.existsSync(testAppFile), true);

        // dir or file?
        var fileIsDir = fs.statSync(file).isDirectory();

        assert.strictEqual(fileIsDir, fs.statSync(testAppFile).isDirectory());

        if (!fileIsDir) {
          // is the content the same
          assert.equal(
            fs.readFileSync(file, {encoding: 'utf8'}),
            fs.readFileSync(testAppFile, {encoding: 'utf8'})
          );
        }
      });
      next();
    }
  },
  'Update bower setup': function(next)
  {
    process.chdir(tmpTestAppDir);

    var pkgJsonPath = path.join(tmpTestAppDir, 'package.json');

    // update version number
    fs.writeFileSync(
      pkgJsonPath,
      fs.readFileSync(pkgJsonPath, 'utf8').replace('0.0.1', '0.0.2').replace('geddy-test-app', 'geddy-test-app-updated'),
      { encoding: 'utf8'}
    );

    var p = exec(path.join(__dirname, 'helpers', 'exec.js') + ' bower', onGenDone);
    p.stdout.pipe(process.stdout);

    function onGenDone(err, stdout, stderr)
    {
      if (err) {
        console.log(err);
        fail();
        return;
      }

      // validate bower.json
      assert.equal(
        fs.readFileSync(path.join(tmpTestAppDir, 'bower.json'), 'utf8'),
        fs.readFileSync(path.join(__dirname, 'fixtures', 'updated_bower.json'), 'utf8')
      );

      next();
    }
  },
  'Create main views without any engine and framework specified --bower': function(next)
  {
    clearViews();
    createViews(next, '--bower');
  },
  'Create main views with foundation --bower': function(next)
  {
    clearViews();
    createViews(next, 'framework=foundation', '--bower');
  }
};

var engines = ['ejs', 'handlebars', 'mustache', 'jade', 'swig'];
var frameworks = ['bootstrap', 'foundation', 'none'];

engines.forEach(function(engine) {
  frameworks.forEach(function(framework) {
    tests['Create main views in ' + engine + ' and ' + framework] = function(next)
    {
      clearViews();
      createViews(next, 'engine=' + engine, 'framework=' + framework);
    }
  });
});

module.exports = tests;