var path = require('path')
    , geddyPath = path.normalize(path.join(require.resolve('geddy'), '../../'));

// Load the basic Geddy toolkit
require(path.join(geddyPath,'lib/geddy'));

// Dependencies
var cwd = process.cwd()
    , fs = require('fs')
    , utils = require(path.join(geddyPath, 'lib/utils'))
    , Adapter = require(path.join(geddyPath, 'lib/template/adapters')).Adapter
    , helpers = require('./helpers')
    , mixinJSONData = helpers.mixinJSONData
    , getRouterPath = helpers.getRouterPath
    , getRoutes = helpers.getRoutes
    , addRoute = helpers.addRoute
    , genDirname = path.join(__dirname, '..');

var _writeTemplate = function (name, filename, dirname, opts) {
  var options = opts || {}
      , names = utils.string.getInflections(name)
      , text = fs.readFileSync(path.join(genDirname, filename + '.ejs'), 'utf8').toString()
      , bare = options.bare || false // Default to full controller
      , adapter
      , templContent
      , fileDir
      , filePath;

  // Render with the right model name
  adapter = new Adapter({engine: 'ejs', template: text});
  templContent = adapter.render({names: names, bare: bare, properties: options.properties});

  // Write file
  fileDir = dirname;
  if (!utils.file.existsSync(fileDir)) {
    fs.mkdirSync(fileDir);
  }

  filePath = path.join(fileDir, names.filename[options.inflection] + '.js');
  fs.writeFileSync(filePath, templContent, 'utf8');

  console.log('[Added] ' + filePath);
};

var _formatModelProperties = function (properties) {
  var obj = {default: {name: '', type: ''}};
  if (!properties) {
    return obj;
  }
  obj['default'].name = 'id';
  obj['default'].type = 'string';

  var itemsArr = properties.split('%')
      , name
      , type
      , args
      , i
      , value;

  i = -1;
  while (++i < itemsArr.length) {
    value = itemsArr[i].split(':');
    name = utils.string.camelize(value.shift());
    type = value.shift() || '';
    args = value.shift() || '';

    // Take off any args on the type
    type = type.replace(/:.*/g, '');

    // Defaults and aliases
    if (!type) {
      type = 'string';
    }
    if (args === 'def') {
      args = 'default';
    }

    switch (type) {
      case 'integer':
        type = 'int';
        break;
      case 'bool':
        type = 'boolean';
        break;
      case 'default':
      case 'def':
        type = 'string';
        args = 'default';
        break;
    }

    // Manage properties that deal with changing default properties
    if (args === 'default') {
      // Reset old default property to its own property, only if it's not
      // already the default
      if (name !== obj['default'].name) {
        // If the new default item already exists then delete it
        if (obj[name]) {
          delete obj[name];
        }

        obj[obj['default'].name] = obj[obj['default'].name] || obj['default'];
      }

      // Add new default property
      obj['default'] = {name: name, type: type};
      continue;
    }

    // If ID property is given and it matches the default
    // then rewrite the default with the new ID property
    if (name === 'id' && obj['default'].name === 'id') {
      obj['default'] = {name: name, type: type};
      continue;
    }

    // If the name is name or title then set them to default, otherwise add
    // the property normally
    if (name === 'name' || name === 'title') {
      // Reset old default to its own property
      obj[obj['default'].name] = obj[obj['default'].name] || obj['default'];

      // Add new default property
      obj['default'] = {name: name, type: type};
    } else {
      obj[name] = {name: name, type: type};
    }
  }

  return obj;
};

task('default', function(name, engine, realtime) {
  jake.Task['create'].invoke(name, engine, realtime);
});

// Creates a new Geddy app scaffold
task('create', function(name, engine, realtime) {
  var basePath = path.join(genDirname, 'base')
      , mkdirs
      , cps
      , text
      , adapter;

  if (!name) {
    throw new Error('No app name specified.');
  }
  if (!engine || engine == 'default') {
    engine = 'ejs';
  }
  if (realtime == 'default') {
    realtime = false;
  }

  mkdirs = [
    ''
    , 'config'
    , 'app/models'
    , 'app/controllers'
    , 'app/helpers'
    , 'lib'
    , 'log'
    , 'node_modules'
    , 'test/models'
    , 'test/controllers'
  ];
  cps = [
    (realtime) ? ['realtime/views/' + engine, 'app/views'] : ['views/' + engine, 'app/views']
    , ['public', '']
    , ['router.js', 'config']
    , ['init.js', 'config']
    , (realtime) ? ['realtime/environment.js', 'config'] : ['environment.js', 'config']
    , ['development.js', 'config']
    , ['production.js', 'config']
    , ['secrets.json', 'config']
    , ['main.js', 'app/controllers']
    , ['application.js', 'app/controllers']
    , ['favicon.ico', 'public']
    , ['gitignore.txt', '.gitignore']
  ];

  mkdirs.forEach(function (dir) {
    jake.mkdirP(path.join(name, dir));
  });
  cps.forEach(function (cp) {
    jake.cpR(path.join(basePath, cp[0]), path.join(name, cp[1]), {silent: true});
  });

  // Compile Jakefile
  text = fs.readFileSync(path.join(basePath, 'Jakefile.ejs'), 'utf8').toString();
  adapter = new Adapter({engine: 'ejs', template: text});
  fs.writeFileSync(path.join(name, 'Jakefile'), adapter.render({appName: name}), 'utf8');

  // Compile package.json
  text = fs.readFileSync(path.join(basePath, 'package.json.ejs'), 'utf8').toString();
  adapter = new Adapter({engine: 'ejs', template: text});
  fs.writeFileSync(path.join(name, 'package.json'), adapter.render({appName: name}), 'utf8');

  // Add engine to package.json if it's not EJS
  if (engine !== 'ejs') {
    // Change to handlebars as we use it behind the scenes
    if (engine === 'mustache') {
      engine = 'handlebars';
    }
    var data = {dependencies: {}};
    data.dependencies[engine] = "*";

    mixinJSONData(path.join(name, 'package.json'), data);
  }

  console.log('Created app ' + name + '.');
  // one offs
  if (realtime) {
    console.log('This is a realtime app. Please `npm install socket.io --save` in your app.');
  }
});

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

// Creates a resource with a model, controller and a resource route
task('resource', function (name, modelProperties) {
  var names
      , modelTask = jake.Task['gen:model'];

  if (!name) {
    throw new Error('No resource name specified.');
  }

  modelTask.on('complete', function () {
    jake.Task['gen:controller'].invoke(name);
    jake.Task['gen:route'].invoke(name);
    jake.Task['gen:test'].invoke(name,
        {properties: modelProperties});
    names = utils.string.getInflections(name);
    // Create views folder but not actions
    jake.mkdirP(path.join('app', 'views', names.filename.plural));
    console.log('[Added] ' + names.filename.plural + ' view directory');
    complete();
  });
  modelTask.invoke(name, modelProperties);

}, {async: true});

task('controller', function (name) {
  if (!name) {
    throw new Error('No controller name specified.');
  }


  _writeTemplate(name, 'resource/controller', path.join('app', 'controllers'),
      {inflection: 'plural', bare: false});
});

task('test', function (name) {
  if (!name) {
    throw new Error('No test name specified.');
  }

  _writeTemplate(name, 'resource/test_model', 'test/models',
      {inflection: 'singular'});
  _writeTemplate(name, 'resource/test_controller', 'test/controllers',
      {inflection: 'plural'});
});

task('bareController', function (name, engine) {
  if (!name) {
    throw new Error('No controller name specified.');
  }
  if (!engine || engine == 'default') {
    engine = 'ejs';
  }

  _writeTemplate(name, 'resource/controller', path.join('app', 'controllers'),
      {inflection: 'plural', bare: true});
  jake.Task['gen:route'].invoke(name, {bare: true});
  jake.Task['gen:views'].invoke(name, {bare: true, engine: engine});
});

task('route', function (name, options) {
  if (!name) {
    throw new Error('No route name specified.');
  }
  options = options || {};

  var names = utils.string.getInflections(name)
      , routerPath = getRouterPath()
      , routeType = options.bare ? 'Bare' : 'Resource'
      , newRoute;

  if (routerPath) {
    if (routerPath.match('.coffee')) {
      if (options.bare) {
        newRoute = 'router.match(\'/' +  names.filename.plural +
            '\').to controller: \'' + names.constructor.plural +
            '\', action: \'index\'';
      } else {
        newRoute = 'router.resource \'' +  names.filename.plural + '\'';
      }
    } else if (routerPath.match('.js')) {
      if (options.bare) {
        newRoute = 'router.match(\'/' +  names.filename.plural +
            '\').to({controller: \'' + names.constructor.plural +
            '\', action: \'index\'});';
      } else {
        newRoute = 'router.resource(\'' +  names.filename.plural + '\');';
      }
    }

    if (addRoute(routerPath, newRoute)) {
      console.log('[Added] ' + routeType + ' ' + names.filename.plural +
          ' route added to ' + routerPath);
    }
    else {
      console.log(routeType + ' ' + names.filename.plural + ' route already defined in ' +
          routerPath);
    }
  }
  else {
    console.log('There is no router file to add routes too');
  }

});

// Delegate to stuff in jakelib/auth.jake
namespace('auth', function () {
  task('update', function () {
    var t = jake.Task['auth:update'];
    t.on('complete', function () {
      complete();
    });
    t.invoke.apply(t, arguments);
  });
});

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

// Delegate to stuff in jakelib/migration.jake
task('auth', {async: true}, function (name) {
  if (!name) {
    throw new Error('No migration name provided.');
  }
  var t = jake.Task['auth:init'];
  t.on('complete', function () {
    complete();
  });
  t.invoke.apply(t, arguments);
});