# UI Operations History Manager

## Usage

    var OH = window['piro.sakura.ne.jp'].operationHistory;
    
    // window specific history
    OH.doOperation(
      // the operation which becomes "undo-able" (optional)
      function() {
        MyService.myProp = newValue;
      },
      // name of history (optional)
      'MyAddonFeature',
      // target window for the history (optional)
      window,
      // history entry
      { name   : 'myaddon-changeTabbar',
        label  : 'Change tabbar position',
        onUndo : function() { MyService.myProp = oldValue; },
        onRedo : function() { MyService.myProp = newValue; } }
    );
    OH.undo('MyAddonFeature', window);
    OH.redo('MyAddonFeature', window);
    
    // global history (not associated to window)
    OH.doOperation(
      function() { ... },
      'MyAddonFeature',
      { ... }
    );
    OH.undo('MyAddonFeature');
    
    // anonymous, window specific
    OH.doOperation(function() { ... }, { ... }, window);
    OH.undo(window);
    
    // anonymous, global
    OH.doOperation(function() { ... }, { ... });
    OH.undo();
    
    // You should use "getId()" and "getTargetById()" to get
    // windows and DOM elements which are targets of operations.
    var w, b, t;
    OH.doOperation(
      function() {
        var tab = targetWindow.gBrowser.selectedTab;
        w = OH.getId(targetWindow);
        b = OH.getId(targetWindow.gBrowser);
        t = OH.getId(tab);
        tab.style.border = '2px solid red';
      },
      {
        id : OH.getWindowId(targetWindow),
        onUndo : function() {
          var win = OH.getTargetById(w);
          var browser = OH.getTargetById(b, win);
          var tab = OH.getTargetById(t, b.mTabContainer);
          tab.style.border = '';
        },
        onRedo : function() { ... }
      }
    );
    
    // enumerate history entries
    var history = OH.getHistory('MyAddonFeature', window); // options are same to undo/redo
    OH.entries.forEach(function(aEntry, aIndex) {
      var item = MyService.appendItem(aEntry.label);
      if (aIndex == history.index)
        item.setAttribute('checked', true);
    });

