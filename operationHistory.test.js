utils.include('operationHistory.js', 'Shift_JIS');

var sv;
var log;

var win;
function windowSetUp() {
	utils.setUpTestWindow();
	win = utils.getTestWindow();
	eventListenersSetUp(win, 'window');
};
function windowTearDown() {
	eventListenersTearDown(win, 'window');
	utils.tearDownTestWindow();
	win = null;
}

function eventListenersSetUp(aWindow, aName) {
	aWindow.addEventListener('UIOperationHistoryPreUndo:'+aName, handleEvent, false);
	aWindow.addEventListener('UIOperationHistoryUndo:'+aName, handleEvent, false);
	aWindow.addEventListener('UIOperationHistoryRedo:'+aName, handleEvent, false);
	aWindow.addEventListener('UIOperationHistoryPostRedo:'+aName, handleEvent, false);
	aWindow.addEventListener('UIOperationHistoryUndoComplete:'+aName, handleEvent, false);
	aWindow.addEventListener('UIOperationHistoryRedoComplete:'+aName, handleEvent, false);
}
function eventListenersTearDown(aWindow, aName) {
	aWindow.removeEventListener('UIOperationHistoryPreUndo:'+aName, handleEvent, false);
	aWindow.removeEventListener('UIOperationHistoryUndo:'+aName, handleEvent, false);
	aWindow.removeEventListener('UIOperationHistoryRedo:'+aName, handleEvent, false);
	aWindow.removeEventListener('UIOperationHistoryPostRedo:'+aName, handleEvent, false);
	aWindow.removeEventListener('UIOperationHistoryUndoComplete:'+aName, handleEvent, false);
	aWindow.removeEventListener('UIOperationHistoryRedoComplete:'+aName, handleEvent, false);
}

function handleEvent(aEvent) {
	var prefix;
	switch (aEvent.type.split(':')[0])
	{
		case 'UIOperationHistoryPreUndo':
			prefix = 'event(pre-undo)';
			break;
		case 'UIOperationHistoryUndo':
			prefix = 'event(undo)';
			break;
		case 'UIOperationHistoryRedo':
			prefix = 'event(redo)';
			break;
		case 'UIOperationHistoryPostRedo':
			prefix = 'event(post-redo)';
			break;
		case 'UIOperationHistoryUndoComplete':
			log.push('event(undo-complete)');
			return;
		case 'UIOperationHistoryRedoComplete':
			log.push('event(redo-complete)');
			return;
	}
	log.push(prefix+' '+aEvent.entry.name+' (level '+aEvent.params.level+')');
}

function toSimpleList(aString) {
	return String(aString)
			.replace(/^\s+|\s+$/g, '')
			.replace(/\n\t+/g, '\n');
}

function setUp()
{
	sv = window['piro.sakura.ne.jp'].operationHistory;
	sv._db = {
		histories : {},
		observerRegistered : true
	};

	log = [];
	eventListenersSetUp(window, 'global');
}

function tearDown()
{
	eventListenersTearDown(window, 'global');
}


test_setGetWindowId.setUp = windowSetUp;
test_setGetWindowId.tearDown = windowTearDown;
function test_setGetWindowId()
{
	sv.setWindowId(win, 'foobar');
	assert.equals('foobar', sv.getWindowId(win));
	assert.equals('foobar', sv.getWindowId(win, 'default'));

	yield Do(windowTearDown());
	yield Do(windowSetUp());

	var id = sv.getWindowId(win, 'foobar');
	assert.isNotNull(id);
	assert.notEquals('', id);

	var newId = sv.getWindowId(win, 'foobar');
	assert.isNotNull(newId);
	assert.equals(id, newId);

	sv.setWindowId(win, 'foobar');
	assert.equals('foobar', sv.getWindowId(win));
}

test_getWindowById.setUp = windowSetUp;
test_getWindowById.tearDown = windowTearDown;
function test_getWindowById()
{
	var id = sv.getWindowId(win);
	var windowFromId = sv.getWindowById(id);
	assert.equals(win, windowFromId);

	windowFromId = sv.getWindowById('does not exist!');
	assert.isNull(windowFromId);
}

test_setGetElementId.setUp = windowSetUp;
test_setGetElementId.tearDown = windowTearDown;
function test_setGetElementId()
{
	var element = win.gBrowser;

	sv.setElementId(element, 'foobar');
	assert.equals('foobar', sv.getElementId(element));
	assert.equals('foobar', sv.getElementId(element, 'default'));

	yield Do(windowTearDown());
	yield Do(windowSetUp());
	element = win.gBrowser;

	var id = sv.getElementId(element, 'foobar');
	assert.isNotNull(id);
	assert.notEquals('', id);

	var newId = sv.getElementId(element, 'foobar');
	assert.equals(id, newId);

	sv.setElementId(element, 'foobar');
	assert.equals('foobar', sv.getElementId(element));

	// duplicated id is not allowed.
	newId = sv.setElementId(element.parentNode, 'foobar');
	assert.equals(newId, sv.getElementId(element.parentNode));
	assert.notEquals('foobar', newId);
	assert.notEquals('foobar', sv.getElementId(element.parentNode));
}

test_getElementById.setUp = windowSetUp;
test_getElementById.tearDown = windowTearDown;
function test_getElementById()
{
	var element = win.gBrowser;

	var id = sv.getElementId(element);
	var elementFromId = sv.getElementById(id, win);
	assert.equals(element, elementFromId);

	// returns null for a wrong parent
	elementFromId = sv.getElementById(id, content);
	assert.isNull(elementFromId);

	elementFromId = sv.getElementById('does not exist!', win);
	assert.isNull(elementFromId);
}

test_getId.setUp = windowSetUp;
test_getId.tearDown = windowTearDown;
function test_getId()
{
	var id = sv.getId(win);
	var windowFromId = sv.getWindowById(id);
	assert.equals(win, windowFromId);

	var element = win.gBrowser;

	id = sv.getId(element);
	assert.isNotNull(id);
	var elementFromId = sv.getElementById(id, win);
	assert.equals(element, elementFromId);

	assert.isNull(sv.getId(''));
	assert.isNull(sv.getId(0));
	assert.isNull(sv.getId(false));
	assert.isNull(sv.getId(null));
	assert.isNull(sv.getId(undefined));
	assert.raises('foo is an unknown type item.', function() {
		sv.getId('foo');
	});
}

test_getTargetById.setUp = windowSetUp;
test_getTargetById.tearDown = windowTearDown;
function test_getTargetById()
{
	var element = win.gBrowser;
	var windowId = sv.getId(win);
	var elementId = sv.getId(element);
	assert.equals(win, sv.getTargetById(windowId));
	assert.equals(element, sv.getTargetById(elementId, win));
}

test_getTargetsByIds.setUp = windowSetUp;
test_getTargetsByIds.tearDown = windowTearDown;
function test_getTargetsByIds()
{
	var tabs = [
			win.gBrowser.addTab(),
			win.gBrowser.addTab(),
			win.gBrowser.addTab()
		];
	var ids = tabs.map(function(aTab) {
			return sv.getId(aTab);
		});
	assert.equals(tabs, sv.getTargetsByIds(ids[0], ids[1], ids[2], win.gBrowser.mTabContainer));
	assert.equals(tabs, sv.getTargetsByIds(ids, win.gBrowser.mTabContainer));
	assert.equals([null, null, null], sv.getTargetsByIds(ids[0], ids[1], ids[2], win));
	assert.equals([null, null, null], sv.getTargetsByIds(ids, win));
}


test_addEntry.setUp = windowSetUp;
test_addEntry.tearDown = windowTearDown;
function test_addEntry()
{
	var name = 'foobar';

	// register global-anonymous
	sv.addEntry({ label : 'anonymous 1' });
	sv.addEntry({ label : 'anonymous 2' });
	sv.addEntry({ label : 'anonymous 3' });

	// register global-named
	sv.addEntry(name, { label : 'named 1' });
	sv.addEntry(name, { label : 'named 2' });
	sv.addEntry(name, { label : 'named 3' });

	// register window-anonymous
	sv.addEntry({ label : 'window, anonymous 1' }, win);
	sv.addEntry({ label : 'window, anonymous 2' }, win);
	sv.addEntry({ label : 'window, anonymous 3' }, win);

	// register window-named
	sv.addEntry(name, { label : 'window, named 1' }, win);
	sv.addEntry(name, { label : 'window, named 2' }, win);
	sv.addEntry(name, { label : 'window, named 3' }, win);

	function assertHistory(aLabels, aCurrentIndex, aHistory)
	{
		assert.equals(aLabels.length, aHistory.entries.length);
		assert.equals(aLabels,
		              aHistory.entries.map(function(aEntry) {
		                return aEntry.label;
		              }));
		assert.equals(aCurrentIndex, aHistory.index);
	}

	assertHistory(
		['anonymous 1',
		 'anonymous 2',
		 'anonymous 3'],
		2,
		sv.getHistory()
	);

	assertHistory(
		['named 1',
		 'named 2',
		 'named 3'],
		2,
		sv.getHistory(name)
	);

	assertHistory(
		['window, anonymous 1',
		 'window, anonymous 2',
		 'window, anonymous 3'],
		2,
		sv.getHistory(win)
	);

	assertHistory(
		['window, named 1',
		 'window, named 2',
		 'window, named 3'],
		2,
		sv.getHistory(name, win)
	);
}

function assertHistoryCount(aIndex, aCount)
{
	var history = sv.getHistory();
	assert.equals(
		aIndex+' / '+aCount,
		history.index+' / '+history.entries.length,
		utils.inspect(history.entries)
	);
}

function assertUndoingState(aExpectedUndoing, aExpectedRedoing, aMessage)
{
	if (aExpectedUndoing)
		assert.isTrue(sv.isUndoing(), aMessage);
	else
		assert.isFalse(sv.isUndoing(), aMessage);

	if (aExpectedRedoing)
		assert.isTrue(sv.isRedoing(), aMessage);
	else
		assert.isFalse(sv.isRedoing(), aMessage);

	if (aExpectedUndoing || aExpectedRedoing)
		assert.isFalse(sv.isUndoable(), aMessage);
	else
		assert.isTrue(sv.isUndoable(), aMessage);
}

function test_undoRedo_simple()
{
	assertUndoingState(false, false);

	sv.addEntry({ name   : 'entry 1',
	              label  : 'entry 1',
	              onUndo : function(aParams) {
	                log.push('u1');
	                assertUndoingState(true, false);
	              },
	              onRedo : function(aParams) {
	                log.push('r1');
	                assertUndoingState(false, true);
	              } });
	sv.addEntry({ name   : 'entry 2',
	              label  : 'entry 2',
	              onPreUndo : function(aParams) {
	                log.push('u2pre');
	                assertUndoingState(true, false);
	              },
	              onUndo : function(aParams) {
	                log.push('u2');
	                assertUndoingState(true, false);
	              },
	              onRedo : function(aParams) {
	                log.push('r2');
	                assertUndoingState(false, true);
	              },
	              onPostRedo : function(aParams) {
	                log.push('r2post');
	                assertUndoingState(false, true);
	              } });
	sv.addEntry({ name   : 'entry 3',
	              label  : 'entry 3' });

	assertHistoryCount(2, 3);
	assert.isTrue(sv.undo().done); // entry 3
	assert.isTrue(sv.undo().done); // u2pre, u2
	assertUndoingState(false, false);
	assertHistoryCount(0, 3);
	assert.isTrue(sv.redo().done); // r2, r2post
	assert.isTrue(sv.redo().done); // entry 3
	assertUndoingState(false, false);

	assert.equals(
		toSimpleList(<![CDATA[
			event(pre-undo) entry 3 (level 0)
			event(undo) entry 3 (level 0)
			event(undo-complete)
			u2pre
			event(pre-undo) entry 2 (level 0)
			u2
			event(undo) entry 2 (level 0)
			event(undo-complete)
			r2
			event(redo) entry 2 (level 0)
			r2post
			event(post-redo) entry 2 (level 0)
			event(redo-complete)
			event(redo) entry 3 (level 0)
			event(post-redo) entry 3 (level 0)
			event(redo-complete)
		]]>),
		log.join('\n')
	);
}

function test_undoRedo_goToIndex()
{
	sv.addEntry({ name   : 'entry 1',
	              label  : 'entry 1',
	              onPreUndo : function(aParams) { log.push('u1pre'); },
	              onUndo : function(aParams) { log.push('u1'); sv.undo(); /* <= this should be ignored */ },
	              onRedo : function(aParams) { log.push('r1'); },
	              onPostRedo : function(aParams) { log.push('r1post'); } });
	sv.addEntry({ name   : 'entry 2',
	              label  : 'entry 2',
	              onPreUndo : function(aParams) { log.push('u2pre'); },
	              onUndo : function(aParams) { log.push('u2'); },
	              onRedo : function(aParams) { log.push('r2'); sv.redo(); /* <= this should be ignored */ },
	              onPostRedo : function(aParams) { log.push('r2post'); sv.redo(); } });
	sv.addEntry({ name   : 'entry 3',
	              label  : 'entry 3',
	              onPreUndo : function(aParams) { log.push('u3pre'); sv.undo(); /* <= this should be ignored */ },
	              onUndo : function(aParams) { log.push('u3'); sv.undo(); /* <= this should be ignored */ },
	              onRedo : function(aParams) { log.push('r3'); sv.redo(); /* <= this should be ignored */ },
	              onPostRedo : function(aParams) { log.push('r3post'); sv.redo(); /* <= this should be ignored */ } });

	assertHistoryCount(2, 3);
	sv.undo(); // u3pre, u3
	assertHistoryCount(1, 3);
	sv.redo(); // r3, r3post
	assertHistoryCount(2, 3);
	sv.undo(); // u3pre, u3
	assertHistoryCount(1, 3);
	sv.undo(); // u2pre, u2
	assertHistoryCount(0, 3);
	sv.undo(); // u1pre, u1
	assertHistoryCount(0, 3);
	sv.redo(); // r1, r1post
	assertHistoryCount(0, 3);
	sv.redo(); // r2, r2post
	assertHistoryCount(1, 3);
	sv.redo(); // r3, r3post
	assertHistoryCount(2, 3);
	sv.redo(); // --
	assertHistoryCount(2, 3);
	sv.redo(); // --
	assertHistoryCount(2, 3);
	sv.undo(); // u3pre, u3
	assertHistoryCount(1, 3);
	sv.undo(); // u2pre, u2
	assertHistoryCount(0, 3);
	sv.undo(); // u1pre, u1
	assertHistoryCount(0, 3);
	sv.undo(); // --
	assertHistoryCount(0, 3);
	sv.undo(); // --
	assertHistoryCount(0, 3);
	sv.undo(); // --
	assertHistoryCount(0, 3);
	sv.redo(); // r1, r1post
	assertHistoryCount(0, 3);
	sv.redo(); // r2, r2post
	assertHistoryCount(1, 3);

	log.push('----insert');
	sv.addEntry({ name   : 'entry 4',
	              label  : 'entry 4',
	              onPreUndo : function(aParams) { log.push('u4pre'); sv.addEntry({ label: 'invalid/undo' }); },
	              onUndo : function(aParams) { log.push('u4'); sv.addEntry({ label: 'invalid/undo' }); },
	              onRedo : function(aParams) { log.push('r4'); sv.addEntry({ label: 'invalid/redo' }); },
	              onPostRedo : function(aParams) { log.push('r4post'); sv.addEntry({ label: 'invalid/redo' }); } });
	assertHistoryCount(2, 3);
	sv.undo(); // u4pre, u4
	assertHistoryCount(1, 3);
	sv.redo(); // r4, r4post
	assertHistoryCount(2, 3);
	sv.undo(); // u4pre, u4
	assertHistoryCount(1, 3);
	sv.undo(); // u2pre, u2
	assertHistoryCount(0, 3);
	sv.undo(); // u1pre, u1
	assertHistoryCount(0, 3);
	sv.redo(); // r1, r1post
	assertHistoryCount(0, 3);
	sv.redo(); // r2, r2post
	assertHistoryCount(1, 3);
	sv.redo(); // r4, r4post
	assertHistoryCount(2, 3);

	log.push('----goToIndex back');
	sv.goToIndex(0);
	log.push('----goToIndex same');
	sv.goToIndex(0);
	log.push('----goToIndex forward');
	sv.goToIndex(2);
	log.push('----goToIndex back');
	sv.goToIndex(-5);
	log.push('----goToIndex forward');
	sv.goToIndex(5);

	assert.equals(
		toSimpleList(<![CDATA[
			u3pre
			event(pre-undo) entry 3 (level 0)
			u3
			event(undo) entry 3 (level 0)
			event(undo-complete)
			r3
			event(redo) entry 3 (level 0)
			r3post
			event(post-redo) entry 3 (level 0)
			event(redo-complete)
			u3pre
			event(pre-undo) entry 3 (level 0)
			u3
			event(undo) entry 3 (level 0)
			event(undo-complete)
			u2pre
			event(pre-undo) entry 2 (level 0)
			u2
			event(undo) entry 2 (level 0)
			event(undo-complete)
			u1pre
			event(pre-undo) entry 1 (level 0)
			u1
			event(undo) entry 1 (level 0)
			event(undo-complete)
			r1
			event(redo) entry 1 (level 0)
			r1post
			event(post-redo) entry 1 (level 0)
			event(redo-complete)
			r2
			event(redo) entry 2 (level 0)
			r2post
			event(post-redo) entry 2 (level 0)
			event(redo-complete)
			r3
			event(redo) entry 3 (level 0)
			r3post
			event(post-redo) entry 3 (level 0)
			event(redo-complete)
			u3pre
			event(pre-undo) entry 3 (level 0)
			u3
			event(undo) entry 3 (level 0)
			event(undo-complete)
			u2pre
			event(pre-undo) entry 2 (level 0)
			u2
			event(undo) entry 2 (level 0)
			event(undo-complete)
			u1pre
			event(pre-undo) entry 1 (level 0)
			u1
			event(undo) entry 1 (level 0)
			event(undo-complete)
			r1
			event(redo) entry 1 (level 0)
			r1post
			event(post-redo) entry 1 (level 0)
			event(redo-complete)
			r2
			event(redo) entry 2 (level 0)
			r2post
			event(post-redo) entry 2 (level 0)
			event(redo-complete)
			----insert
			u4pre
			event(pre-undo) entry 4 (level 0)
			u4
			event(undo) entry 4 (level 0)
			event(undo-complete)
			r4
			event(redo) entry 4 (level 0)
			r4post
			event(post-redo) entry 4 (level 0)
			event(redo-complete)
			u4pre
			event(pre-undo) entry 4 (level 0)
			u4
			event(undo) entry 4 (level 0)
			event(undo-complete)
			u2pre
			event(pre-undo) entry 2 (level 0)
			u2
			event(undo) entry 2 (level 0)
			event(undo-complete)
			u1pre
			event(pre-undo) entry 1 (level 0)
			u1
			event(undo) entry 1 (level 0)
			event(undo-complete)
			r1
			event(redo) entry 1 (level 0)
			r1post
			event(post-redo) entry 1 (level 0)
			event(redo-complete)
			r2
			event(redo) entry 2 (level 0)
			r2post
			event(post-redo) entry 2 (level 0)
			event(redo-complete)
			r4
			event(redo) entry 4 (level 0)
			r4post
			event(post-redo) entry 4 (level 0)
			event(redo-complete)
			----goToIndex back
			u4pre
			event(pre-undo) entry 4 (level 0)
			u4
			event(undo) entry 4 (level 0)
			event(undo-complete)
			u2pre
			event(pre-undo) entry 2 (level 0)
			u2
			event(undo) entry 2 (level 0)
			event(undo-complete)
			----goToIndex same
			----goToIndex forward
			r2
			event(redo) entry 2 (level 0)
			r2post
			event(post-redo) entry 2 (level 0)
			event(redo-complete)
			r4
			event(redo) entry 4 (level 0)
			r4post
			event(post-redo) entry 4 (level 0)
			event(redo-complete)
			----goToIndex back
			u4pre
			event(pre-undo) entry 4 (level 0)
			u4
			event(undo) entry 4 (level 0)
			event(undo-complete)
			u2pre
			event(pre-undo) entry 2 (level 0)
			u2
			event(undo) entry 2 (level 0)
			event(undo-complete)
			u1pre
			event(pre-undo) entry 1 (level 0)
			u1
			event(undo) entry 1 (level 0)
			event(undo-complete)
			----goToIndex forward
			r1
			event(redo) entry 1 (level 0)
			r1post
			event(post-redo) entry 1 (level 0)
			event(redo-complete)
			r2
			event(redo) entry 2 (level 0)
			r2post
			event(post-redo) entry 2 (level 0)
			event(redo-complete)
			r4
			event(redo) entry 4 (level 0)
			r4post
			event(post-redo) entry 4 (level 0)
			event(redo-complete)
		]]>),
		log.join('\n')
	);
}

function handlEvent_skip(aEvent) {
	if (aEvent.entry.name == 'skip both')
		aEvent.skip();
}
test_undoRedo_skip.setUp = function() {
	window.addEventListener('UIOperationHistoryUndo:global', handlEvent_skip, false);
	window.addEventListener('UIOperationHistoryRedo:global', handlEvent_skip, false);
}
test_undoRedo_skip.tearDown = function() {
	window.removeEventListener('UIOperationHistoryUndo:global', handlEvent_skip, false);
	window.removeEventListener('UIOperationHistoryRedo:global', handlEvent_skip, false);
}
function test_undoRedo_skip()
{
	sv.addEntry({ name   : 'skip redo',
	              label  : 'skip redo',
	              onUndo : function(aParams) { log.push('u redo'); },
	              onRedo : function(aParams) { log.push('r redo'); aParams.skip(); } });
	sv.addEntry({ name   : 'skip undo',
	              label  : 'skip undo',
	              onUndo : function(aParams) { log.push('u undo'); aParams.skip(); },
	              onRedo : function(aParams) { log.push('r undo'); } });
	sv.addEntry({ name   : 'skip both',
	              label  : 'skip both',
	              onUndo : function(aParams) { log.push('u both'); },
	              onRedo : function(aParams) { log.push('r both'); } });
	sv.addEntry({ name   : 'normal',
	              label  : 'normal',
	              onUndo : function(aParams) { log.push('u normal'); },
	              onRedo : function(aParams) { log.push('r normal'); } });

	assertHistoryCount(3, 4);
	sv.undo(); // u normal
	log.push('----');
	assertHistoryCount(2, 4);
	sv.undo(); // u both, u undo, u redo
	log.push('----');
	assertHistoryCount(0, 4);
	sv.redo(); // r redo, r undo
	log.push('----');
	assertHistoryCount(1, 4);
	sv.redo(); // r both, r normal
	assertHistoryCount(3, 4);

	assert.equals(
		toSimpleList(<![CDATA[
			event(pre-undo) normal (level 0)
			u normal
			event(undo) normal (level 0)
			event(undo-complete)
			----
			event(pre-undo) skip both (level 0)
			u both
			event(undo) skip both (level 0)
			event(pre-undo) skip undo (level 0)
			u undo
			event(undo) skip undo (level 0)
			event(pre-undo) skip redo (level 0)
			u redo
			event(undo) skip redo (level 0)
			event(undo-complete)
			----
			r redo
			event(redo) skip redo (level 0)
			event(post-redo) skip redo (level 0)
			r undo
			event(redo) skip undo (level 0)
			event(post-redo) skip undo (level 0)
			event(redo-complete)
			----
			r both
			event(redo) skip both (level 0)
			event(post-redo) skip both (level 0)
			r normal
			event(redo) normal (level 0)
			event(post-redo) normal (level 0)
			event(redo-complete)
		]]>),
		log.join('\n')
	);
}

function test_undoRedo_wait()
{
	sv.addEntry({ name   : 'normal',
	              label  : 'normal' });
	sv.addEntry({
	              name   : 'delayed',
	              label  : 'delayed',
	              onPreUndo : function(aParams) {
	                aParams.wait();
	                window.setTimeout(function() {
	                  aParams.continue();
	                }, 300);
	              },
	              onRedo : function(aParams) {
	                aParams.wait();
	                window.setTimeout(function() {
	                  aParams.continue();
	                }, 300);
	              }
	            });

	assertHistoryCount(1, 2);

	var info;

	assertUndoingState(false, false);

	info = sv.undo();
	assertHistoryCount(0, 2);
	assert.isFalse(info.done);
	assertUndoingState(true, false);
	log.push('--waiting');
	yield 600;
	assert.isTrue(info.done);
	assertUndoingState(false, false);

	log.push('----');
	info = sv.redo();
	assertHistoryCount(1, 2);
	assert.isFalse(info.done);
	assertUndoingState(false, true);
	log.push('--waiting');
	yield 600;
	assert.isTrue(info.done);
	assertUndoingState(false, false);

	assert.equals(
		toSimpleList(<![CDATA[
			event(pre-undo) delayed (level 0)
			--waiting
			event(undo) delayed (level 0)
			event(undo-complete)
			----
			event(redo) delayed (level 0)
			--waiting
			event(post-redo) delayed (level 0)
			event(redo-complete)
		]]>),
		log.join('\n')
	);
}

function test_doOperation()
{
	var info = sv.doOperation(
		function(aParams) {
			log.push('parent operation (level '+aParams.level+')');
			sv.doOperation(
				function(aParams) {
					log.push('child operation (level '+aParams.level+')');
					sv.doOperation(
						function(aParams) {
							log.push('deep operation (level '+aParams.level+')');
						},
						{ name   : 'deep',
						  label  : 'deep' }
					);
					// If the operation returns false,
					// it should not be registered to the history.
					sv.doOperation(
						function(aParams) {
							log.push('canceled operation (level '+aParams.level+')');
							return false;
						},
						{ name   : 'canceled',
						  label  : 'canceled' }
					);
				},
				{ name   : 'child',
				  label  : 'child',
				  onUndo : function(aParams) {
				    log.push('--canceled');
				    return false;
				  },
				  onPostRedo : function(aParams) {
				    log.push('--canceled');
				    return false;
				  } }
			);
		},
		{ name   : 'parent',
		  label  : 'parent' }
	);
	assert.isTrue(info.done);

	var history = sv.getHistory();
	assert.equals(1, history.entries.length, utils.inspect(history.entries));
	assert.equals('parent', history.entries[0].label, utils.inspect(history.entries[0]));

	log.push('----');
	sv.undo();
	log.push('----');
	sv.redo();

	assert.equals(
		toSimpleList(<![CDATA[
			parent operation (level 0)
			child operation (level 1)
			deep operation (level 2)
			canceled operation (level 2)
			----
			event(pre-undo) parent (level 0)
			event(pre-undo) child (level 1)
			event(pre-undo) deep (level 2)
			event(undo) deep (level 2)
			--canceled
			event(undo-complete)
			----
			event(redo) parent (level 0)
			event(redo) child (level 1)
			event(redo) deep (level 2)
			event(post-redo) deep (level 2)
			--canceled
			event(redo-complete)
		]]>),
		log.join('\n')
	);
}

function handlEvent_cancel(aEvent) {
	if (aEvent.entry.name == 'child') {
		aEvent.preventDefault();
		log.push('--canceled');
	}
}
test_doOperation_canceledByEventListener.setUp = function() {
	window.addEventListener('UIOperationHistoryUndo:global', handlEvent_cancel, false);
	window.addEventListener('UIOperationHistoryPostRedo:global', handlEvent_cancel, false);
}
test_doOperation_canceledByEventListener.tearDown = function() {
	window.removeEventListener('UIOperationHistoryUndo:global', handlEvent_cancel, false);
	window.removeEventListener('UIOperationHistoryPostRedo:global', handlEvent_cancel, false);
}
function test_doOperation_canceledByEventListener()
{
	var info = sv.doOperation(
		function(aParams) {
			log.push('parent operation (level '+aParams.level+')');
			sv.doOperation(
				function(aParams) {
					log.push('child operation (level '+aParams.level+')');
					sv.doOperation(
						function(aParams) {
							log.push('deep operation (level '+aParams.level+')');
						},
						{ name   : 'deep',
						  label  : 'deep' }
					);
				},
				{ name   : 'child',
				  label  : 'child' }
			);
		},
		{ name   : 'parent',
		  label  : 'parent' }
	);
	assert.isTrue(info.done);

	var history = sv.getHistory();
	assert.equals(1, history.entries.length, utils.inspect(history.entries));
	assert.equals('parent', history.entries[0].label, utils.inspect(history.entries[0]));

	log.push('----');
	sv.undo();
	log.push('----');
	sv.redo();

	assert.equals(
		toSimpleList(<![CDATA[
			parent operation (level 0)
			child operation (level 1)
			deep operation (level 2)
			----
			event(pre-undo) parent (level 0)
			event(pre-undo) child (level 1)
			event(pre-undo) deep (level 2)
			event(undo) deep (level 2)
			event(undo) child (level 1)
			--canceled
			event(undo-complete)
			----
			event(redo) parent (level 0)
			event(redo) child (level 1)
			event(redo) deep (level 2)
			event(post-redo) deep (level 2)
			event(post-redo) child (level 1)
			--canceled
			event(redo-complete)
		]]>),
		log.join('\n')
	);
}

function test_doOperation_wait()
{
	var info;

	info = sv.doOperation(
		function(aParams) {
			log.push('op delayed parent (level '+aParams.level+')');
			aParams.wait();
			var info = sv.doOperation(
				function(aParams) {
					log.push('op normal child (level '+aParams.level+')');
				},
				{ name   : 'normal child',
				  label  : 'normal child' }
			);
			window.setTimeout(function() {
			  aParams.continue();
			}, 300);
			assert.isTrue(info.done);
		},
		{ name   : 'delayed parent',
		  label  : 'delayed parent' }
	);
	assert.isFalse(info.done);
	yield 600;
	assert.isTrue(info.done);

	info = sv.doOperation(
		function(aParams) {
			log.push('op normal parent (level '+aParams.level+')');
			var info = sv.doOperation(
				function(aParams) {
					log.push('op delayed child (level '+aParams.level+')');
					aParams.wait();
					window.setTimeout(function() {
					  aParams.continue();
					}, 300);
				},
				{ name   : 'delayed child',
				  label  : 'delayed child' }
			);
			assert.isFalse(info.done);
		},
		{ name   : 'normal parent',
		  label  : 'normal parent' }
	);
	assert.isTrue(info.done);

	log.push('----');
	sv.undo();
	log.push('----');
	sv.undo();
	log.push('----');
	sv.redo();
	log.push('----');
	sv.redo();

	assert.equals(
		toSimpleList(<![CDATA[
			op delayed parent (level 0)
			op normal child (level 1)
			op normal parent (level 0)
			op delayed child (level 1)
			----
			event(pre-undo) normal parent (level 0)
			event(pre-undo) delayed child (level 1)
			event(undo) delayed child (level 1)
			event(undo) normal parent (level 0)
			event(undo-complete)
			----
			event(pre-undo) delayed parent (level 0)
			event(pre-undo) normal child (level 1)
			event(undo) normal child (level 1)
			event(undo) delayed parent (level 0)
			event(undo-complete)
			----
			event(redo) delayed parent (level 0)
			event(redo) normal child (level 1)
			event(post-redo) normal child (level 1)
			event(post-redo) delayed parent (level 0)
			event(redo-complete)
			----
			event(redo) normal parent (level 0)
			event(redo) delayed child (level 1)
			event(post-redo) delayed child (level 1)
			event(post-redo) normal parent (level 0)
			event(redo-complete)
		]]>),
		log.join('\n')
	);
}

test_fakeUndoRedo.setUp = windowSetUp;
test_fakeUndoRedo.tearDown = windowTearDown;
function test_fakeUndoRedo()
{
	var parent = [];
	var child = [];

	sv.doOperation(
		function(aParams) {
			sv.doOperation(
				function(aParams) {
				},
				win,
				(child[0] = {
					name  : 'child0',
					label : 'child0'
				})
			);
		},
		win,
		(parent[0] = {
			name  : 'parent0',
			label : 'parent0'
		})
	);
	sv.doOperation(
		function(aParams) {
			sv.doOperation(
				function(aParams) {
				},
				win,
				(child[1] = {
					name  : 'child1',
					label : 'child1'
				})
			);
		},
		win,
		(parent[1] = {
			name  : 'parent1',
			label : 'parent1'
		})
	);
	sv.doOperation(
		function(aParams) {
			sv.doOperation(
				function(aParams) {
				},
				win,
				(child[2] = {
					name  : 'child2',
					label : 'child2'
				})
			);
		},
		win,
		(parent[2] = {
			name  : 'parent2',
			label : 'parent2'
		})
	);

	var history = sv.getHistory(win);
	assert.equals(2, history.index);

	function assertFakeUndoSuccess(aCurrent, aEntry, aExpected)
	{
		log = [];
		history.index = aCurrent;
		sv.fakeUndo(aEntry, win);
		assert.equals(aExpected, history.index);
		assert.equals(['event(undo-complete)'], log);
	}

	function assertFakeUndoFail(aCurrent, aEntry)
	{
		log = [];
		history.index = aCurrent;
		sv.fakeUndo(aEntry, win);
		var current = Math.min(aCurrent, history.entries.length-1);
		assert.equals(current, history.index);
		assert.equals([], log);
	}

	assertFakeUndoFail(2, parent[0]);
	assertFakeUndoSuccess(2, parent[1], 0);
	assertFakeUndoSuccess(2, parent[2], 1);
	assertFakeUndoFail(3, parent[0]);
	assertFakeUndoFail(3, parent[1]);
	assertFakeUndoSuccess(3, parent[2], 1);

	assertFakeUndoFail(2, child[0]);
	assertFakeUndoSuccess(2, child[1], 0);
	assertFakeUndoSuccess(2, child[2], 1);
	assertFakeUndoFail(3, child[0]);
	assertFakeUndoFail(3, child[1]);
	assertFakeUndoSuccess(3, child[2], 1);

	function assertFakeRedoSuccess(aCurrent, aEntry, aExpected)
	{
		log = [];
		history.index = aCurrent;
		sv.fakeRedo(aEntry, win);
		assert.equals(aExpected, history.index);
		assert.equals(['event(redo-complete)'], log);
	}

	function assertFakeRedoFail(aCurrent, aEntry)
	{
		log = [];
		history.index = aCurrent;
		sv.fakeRedo(aEntry, win);
		var current = Math.max(aCurrent, 0);
		assert.equals(current, history.index);
		assert.equals([], log);
	}

	assertFakeRedoSuccess(-1, parent[0], 1);
	assertFakeRedoFail(-1, parent[1]);
	assertFakeRedoFail(-1, parent[2]);
	assertFakeRedoSuccess(0, parent[0], 1);
	assertFakeRedoSuccess(0, parent[1], 2);
	assertFakeRedoFail(0, parent[2]);

	assertFakeRedoSuccess(-1, child[0], 1);
	assertFakeRedoFail(-1, child[1]);
	assertFakeRedoFail(-1, child[2]);
	assertFakeRedoSuccess(0, child[0], 1);
	assertFakeRedoSuccess(0, child[1], 2);
	assertFakeRedoFail(0, child[2]);
}

function test_exceptions()
{
	assert.raises('EXCEPTION FROM UNDOABLE OPERATION', function() {
		sv.doOperation(
			function(aParams) {
				log.push('op success (level '+aParams.level+')');
				sv.doOperation(
					function(aParams) {
						log.push('op fail (level '+aParams.level+')');
						throw 'EXCEPTION FROM UNDOABLE OPERATION';
					},
					{ name   : 'cannot redo',
					  label  : 'cannot redo',
					  onUndo : function(aParams) {
					    log.push('u cannot redo');
					  },
					  onRedo : function(aParams) {
					    throw 'EXCEPTION FROM REDO PROCESS';
					    log.push('r cannot redo');
					  } }
				);
			},
			{ name   : 'cannot undo',
			  label  : 'cannot undo',
			  onUndo : function(aParams) {
			    throw 'EXCEPTION FROM UNDO PROCESS';
			    log.push('u cannot undo');
			  },
			  onRedo : function(aParams) {
			    log.push('r cannot undo');
			  } }
		);
	});

	log.push('----');

	assert.raises('EXCEPTION FROM UNDO PROCESS', function() {
		sv.undo();
	});
	assert.raises('EXCEPTION FROM REDO PROCESS', function() {
		sv.redo();
	});

	assert.equals(
		toSimpleList(<![CDATA[
			op success (level 0)
			op fail (level 1)
			----
			event(pre-undo) cannot undo (level 0)
			event(pre-undo) cannot redo (level 1)
			u cannot redo
			event(undo) cannot redo (level 1)
			r cannot undo
			event(redo) cannot undo (level 0)
		]]>),
		log.join('\n')
	);
}



/* tests for internal classes */

function test_UIHistory_init()
{
	var history = new sv.UIHistory('test', null, null);
	assert.equals([], history.entries);
	assert.equals([], history.metaData);
	assert.equals(-1, history.index);
	assert.isFalse(history.inOperation);
}

var testMaxPrefKeyGlobal = 'extensions.UIOperationsHistoryManager@piro.sakura.ne.jp.test.max.global';
var testMaxPrefKeyWindow = 'extensions.UIOperationsHistoryManager@piro.sakura.ne.jp.test.max.window';
test_UIHistory_max_global.setUp = test_UIHistory_max_window.setUp = function() {
	utils.clearPref(testMaxPrefKeyGlobal);
	utils.clearPref(testMaxPrefKeyWindow);
	assert.isNull(utils.getPref(testMaxPrefKeyGlobal));
	assert.isNull(utils.getPref(testMaxPrefKeyWindow));
};
test_UIHistory_max_global.tearDown = test_UIHistory_max_window.tearDown = function() {
	utils.clearPref(testMaxPrefKeyGlobal);
	utils.clearPref(testMaxPrefKeyWindow);
};
function test_UIHistory_max_global()
{
	var maxDefault = sv.UIHistory.prototype.MAX_ENTRIES;
	var history;

	history = new sv.UIHistory('test', null, null);
	assert.equals(maxDefault, history.max);
	assert.equals(testMaxPrefKeyGlobal, history.maxPref);
	history.max = 10;
	assert.equals(10, history.max);
	assert.equals(10, utils.getPref(testMaxPrefKeyGlobal));
	assert.isNull(utils.getPref(testMaxPrefKeyWindow));

	history = new sv.UIHistory('test', null, null);
	assert.equals(10, history.max);

	history = new sv.UIHistory('test', window, 'test');
	assert.equals(maxDefault, history.max);
}
function test_UIHistory_max_window()
{
	var maxDefault = sv.UIHistory.prototype.MAX_ENTRIES;
	var history

	history = new sv.UIHistory('test', window, 'test');
	assert.equals(maxDefault, history.max);
	assert.equals(testMaxPrefKeyWindow, history.maxPref);
	history.max = 10;
	assert.equals(10, history.max);
	assert.isNull(utils.getPref(testMaxPrefKeyGlobal));
	assert.equals(10, utils.getPref(testMaxPrefKeyWindow));

	history = new sv.UIHistory('test', null, null);
	assert.equals(maxDefault, history.max);

	history = new sv.UIHistory('test', window, 'test');
	assert.equals(10, history.max);
}

function test_UIHistory_addEntry()
{
	var history = new sv.UIHistory('test', null, null);
	assert.equals([], history.entries);
	assert.equals([], history.metaData);
	assert.equals(-1, history.index);
	assert.isFalse(history.inOperation);

	history.addEntry(0);
	history.addEntry(1);
	history.addEntry(2);
	assert.equals([0, 1, 2], history.entries);
	assert.equals(3, history.metaData.length);
	assert.equals([], history.metaData[0].children);
	assert.equals([], history.metaData[1].children);
	assert.equals([], history.metaData[2].children);
	assert.equals(3, history.index);

	history.inOperation = true;

	history.addEntry(3);
	history.addEntry(4);
	history.addEntry(5);
	assert.equals([0, 1, 2], history.entries);
	assert.equals(3, history.metaData.length);
	assert.equals([], history.metaData[0].children);
	assert.equals([], history.metaData[1].children);
	assert.equals([3, 4, 5], history.metaData[2].children);
	assert.equals(3, history.index);

	history.inOperation = false;

	history.addEntry(6);
	assert.equals([0, 1, 2, 6], history.entries);
	assert.equals(4, history.metaData.length);
	assert.equals(4, history.index);
}

function test_UIHistory_canUndoRedo()
{
	var history = new sv.UIHistory('test', null, null);

	history.addEntry(0);
	history.addEntry(1);
	history.addEntry(2);
	assert.isTrue(history.canUndo);
	assert.isFalse(history.canRedo);
	history.index = 4;
	assert.isTrue(history.canUndo);
	assert.isFalse(history.canRedo);
	history.index = 10;
	assert.isTrue(history.canUndo);
	assert.isFalse(history.canRedo);

	history.index = 0;
	assert.isTrue(history.canUndo);
	assert.isTrue(history.canRedo);
	history.index = -1;
	assert.isFalse(history.canUndo);
	assert.isTrue(history.canRedo);
	history.index = -10;
	assert.isFalse(history.canUndo);
	assert.isTrue(history.canRedo);

	history.index = 1;
	assert.isTrue(history.canUndo);
	assert.isTrue(history.canRedo);
}

function test_UIHistory_currentLastEntry()
{
	var history = new sv.UIHistory('test', null, null);

	history.addEntry('0');
	history.addEntry('1');
	history.addEntry('2');
	assert.isNull(history.currentEntry);
	assert.equals('2', history.lastEntry);
	history.index = 2;
	assert.equals('2', history.currentEntry);
	assert.equals('2', history.lastEntry);
	history.index = 4;
	assert.isNull(history.currentEntry);
	assert.equals('2', history.lastEntry);
	history.index = 10;
	assert.isNull(history.currentEntry);
	assert.equals('2', history.lastEntry);

	history.index = 0;
	assert.equals('0', history.currentEntry);
	assert.equals('2', history.lastEntry);
	history.index = -1;
	assert.isNull(history.currentEntry);
	assert.equals('2', history.lastEntry);
	history.index = -10;
	assert.isNull(history.currentEntry);
	assert.equals('2', history.lastEntry);

	history.index = 1;
	assert.equals('1', history.currentEntry);
	assert.equals('2', history.lastEntry);
}

function test_UIHistory_currentLastMetaData()
{
	var history = new sv.UIHistory('test', null, null);

	history.addEntry('0');
	history.addEntry('1');
	history.addEntry('2');
	var metaData = history.metaData;
	assert.isNull(history.currentMetaData);
	assert.strictlyEquals(metaData[2], history.lastMetaData);
	history.index = 2;
	assert.strictlyEquals(metaData[2], history.currentMetaData);
	assert.strictlyEquals(metaData[2], history.lastMetaData);
	history.index = 4;
	assert.isNull(history.currentMetaData);
	assert.strictlyEquals(metaData[2], history.lastMetaData);
	history.index = 10;
	assert.isNull(history.currentMetaData);
	assert.strictlyEquals(metaData[2], history.lastMetaData);

	history.index = 0;
	assert.strictlyEquals(metaData[0], history.currentMetaData);
	assert.strictlyEquals(metaData[2], history.lastMetaData);
	history.index = -1;
	assert.isNull(history.currentMetaData);
	assert.strictlyEquals(metaData[2], history.lastMetaData);
	history.index = -10;
	assert.isNull(history.currentMetaData);
	assert.strictlyEquals(metaData[2], history.lastMetaData);

	history.index = 1;
	assert.strictlyEquals(metaData[1], history.currentMetaData);
	assert.strictlyEquals(metaData[2], history.lastMetaData);
}

function test_UIHistory_currentLastEntries()
{
	var history = new sv.UIHistory('test', null, null);

	history.addEntry('0');
	history.inOperation = true;
	history.addEntry('0.1');
	history.addEntry('0.2');
	history.inOperation = false;
	history.addEntry('1');
	history.inOperation = true;
	history.addEntry('1.1');
	history.addEntry('1.2');
	history.inOperation = false;
	history.addEntry('2');
	history.inOperation = true;
	history.addEntry('2.1');
	history.addEntry('2.2');
	history.inOperation = false;

	assert.equals([], history.currentEntries);
	assert.equals(['2', '2.1', '2.2'], history.lastEntries);
	history.index = 2;
	assert.equals(['2', '2.1', '2.2'], history.currentEntries);
	assert.equals(['2', '2.1', '2.2'], history.lastEntries);
	history.index = 4;
	assert.equals([], history.currentEntries);
	assert.equals(['2', '2.1', '2.2'], history.lastEntries);
	history.index = 10;
	assert.equals([], history.currentEntries);
	assert.equals(['2', '2.1', '2.2'], history.lastEntries);

	history.index = 0;
	assert.equals(['0', '0.1', '0.2'], history.currentEntries);
	assert.equals(['2', '2.1', '2.2'], history.lastEntries);
	history.index = -1;
	assert.equals([], history.currentEntries);
	assert.equals(['2', '2.1', '2.2'], history.lastEntries);
	history.index = -10;
	assert.equals([], history.currentEntries);
	assert.equals(['2', '2.1', '2.2'], history.lastEntries);

	history.index = 1;
	assert.equals(['1', '1.1', '1.2'], history.currentEntries);
	assert.equals(['2', '2.1', '2.2'], history.lastEntries);
}

function test_UIHistory_namedEntry()
{
	var history = new sv.UIHistory('test', null, null);
	history.addEntry({ name : '0' });
	history.inOperation = true;
	history.addEntry({ name : '1' });
	history.addEntry({ name : '2' });
	history.addEntry({ name : '3' });
	history.inOperation = false;
	assert.equals('0,1,2,3', history.metaData[history.safeIndex].names.join(','));
}


function test_UIHistoryProxy_index()
{
	var history = new sv.UIHistory('test', null, null);
	history.addEntry('0');
	history.addEntry('1');
	history.addEntry('2');
	var proxy = new sv.UIHistoryProxy(history);

	history.index = 0;
	assert.equals(0, proxy.index);
	history.index = -1;
	assert.equals(0, proxy.index);
	history.index = -10;
	assert.equals(0, proxy.index);
	history.index = 2;
	assert.equals(2, proxy.index);
	history.index = 3;
	assert.equals(2, proxy.index);
	history.index = 10;
	assert.equals(2, proxy.index);
}


function test_UIHistoryMetaData_children()
{
	var metaData = new sv.UIHistoryMetaData();

	assert.equals([], metaData.children);
}

