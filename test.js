
/**
 * Test dependencies.
 */

var should = require('should')
  , jade = require('jade')
  , jadevu = require('./lib/jadevu')
  , vm = require('vm')
  , fs = require('fs')

/**
 * Render utility.
 */

function render (fixture, opts) {
  return jade.compile(
      fs.readFileSync(__dirname + '/test/' + fixture + '.jade')
    , opts
  )();
};

/**
 * Executes client side code.
 */

function execute (str) {
  var str = str.replace(/<script>/g, '').replace(/<\/script>/g, '')
    , script = vm.createScript(str)
    , obj = { window: {} }

  script.runInNewContext(obj);

  return obj.window.template;
};

/**
 * Tests.
 */

console.log('Testing that template wont render without and id');

var thrown = false;

try {
  render('noid');
} catch (e) {
  e.message.should.include('`id`');
  thrown = true;
}

thrown.should.be.true;

console.log('Testing that compiling a template includes the wrapper');

render('wrapper').should.include('template');
render('wrapper').should.include('template._');;
render('wrapper').should.include('noConflict');
render('wrapper').should.include('<script>');

console.log('Testing that the wrapper appears only once');

render('twice').should.include('<span>Hello world</span>');
render('twice').should.include('uno');
render('twice').should.include('dos');
render('twice').indexOf('.noConflict').should.equal(
  render('twice').lastIndexOf('.noConflict')
);

console.log('Testing that templates compile');

var template = execute(render('compile'));

template('woot', { times: 5 }).should.equal(
  '<div><a>woot</a><a>woot</a><a>woot</a><a>woot</a><a>woot</a></div>'
);

template('tj', { woot: 'haha' }).should.equal('<p>haha</p>');

console.log('Testing that templates with multiple lines compile');

var template = execute(render('multiple'));

template('woot').should.equal('<div>woot\n<p>woot\n</p></div>');

console.log('Testing that templates dont include debug code');

render('twice').should.not.include('.lineno');

console.log('Testing that many nodes are ok');

var template = execute(render('many-nodes'));

template('many-nodes', { three: 3 }).should.equal('<tr><td>1</td></tr><tr><td>2</td></tr><tr><td>3</td></tr>');

console.log('+ All tests passed');
