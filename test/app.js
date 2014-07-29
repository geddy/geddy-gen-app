var path = require('path')
  , assert = require('assert')
  , fs = require('fs')
  , exec = require('child_process').exec
  , tests;

var testAppDir = path.join(__dirname, 'geddy-test-app');
var tmpTestAppDir = path.join(__dirname, 'tmp', 'geddy-test-app');

tests = {
  'Create test app': function(next)
  {
    // go to tmp dir
    process.chdir(path.join(__dirname, 'tmp'));

    exec(path.join(__dirname, 'helpers', 'exec.js') + ' geddy-test-app', onGenDone);

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
      assert.ok(appFiles.length === tmpAppFiles.length || appFiles.length - 3 === tmpAppFiles.length);

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
          assert.strictEqual(
            fs.readFileSync(file, {encoding: 'utf8'}),
            fs.readFileSync(testAppFile, {encoding: 'utf8'})
          );
        }
      });
      next();
    }
  }
};

module.exports = tests;