// Generated by CoffeeScript 1.7.1

/*
@module emberella
@submodule emberella-controllers
 */

(function() {
  var Emberella, get, set,
    __slice = [].slice;

  Emberella = window.Emberella;

  get = Ember.get;

  set = Ember.set;


  /*
    `Emberella.SparseArrayController` is a variation on an
    `Ember.ArrayController` that allows content to be lazily loaded from the
    persistence layer.
  
    @class SparseArrayController
    @namespace Emberella
    @extends Ember.ArrayProxy
   */

  Emberella.SparseArrayController = Ember.ArrayProxy.extend(Ember.ControllerMixin, {

    /*
      @private
    
      Stash a reference to the original content object.
    
      @property _content
      @type {Mixed}
      @default null
     */
    _content: null,

    /*
      @private
    
      Stash the potential total number of items as reported by the
      persistence layer.
    
      @property _length
      @type {Integer}
      @default null
     */
    _length: null,

    /*
      @property isSelectable
      @type Boolean
      @default true
      @final
     */
    isSparseArrayController: true,

    /*
      The number of items to fetch together in a single request. Essentially,
      the "page size" of each query.
    
      @property rangeSize
      @type {Integer}
      @default 1
     */
    rangeSize: 1,

    /*
      Flag to indicate if this controller should attempt to fetch data.
    
      @property shouldRequestObjects
      @type {Boolean}
      @default true
     */
    shouldRequestObjects: true,

    /*
      Alias to `content` property. Override to customize the behavior of
      content referencing.
    
      @property sparseContent
     */
    sparseContent: Ember.computed.alias('content'),

    /*
      The total number of potential items in the sparse array. If the length is
      unknown, requesting this property will cause the controller to try to fetch
      the total length from the persistence layer.
    
      @property length
      @type {Integer}
      @default 0
      @readOnly
     */
    length: Ember.computed(function() {
      var ret;
      ret = get(this, '_length');
      if (Ember.isEmpty(ret)) {
        this.requestLength();
      }
      return get(this, '_length') || 0;
    }).property('_length').readOnly(),

    /*
      True if this controller instance is attempting to fetch its length.
    
      @property isRequestingLength
      @type {Boolean}
      @default false
     */
    isRequestingLength: null,

    /*
      True if this controller instance is attempting to fetch its length.
    
      @property isUpdating
      @type {Boolean}
      @default false
     */
    isUpdating: Ember.computed(function() {
      return !!(get(this, 'isRequestingLength'));
    }).property('isRequestingLength'),
    init: function() {
      this._TMP_OBJECT = {
        isSparseArrayItem: true,
        isStale: true
      };
      this._TMP_PROVIDE_ARRAY = [];
      this._TMP_PROVIDE_RANGE = {
        length: 1
      };
      this._TMP_RANGE = {};
      return this._super();
    },

    /*
      Return the content in array format.
    
      @method toArray
      @return {Array}
     */
    toArray: function() {
      var sparseContent;
      sparseContent = get(this, 'sparseContent');
      if (!sparseContent) {
        return Ember.A();
      }
      return sparseContent.toArray();
    },

    /*
      Check the content to see if a valid, non-stale object is available at the
      provided index.
    
      @method isObjectAt
      @param {Integer} idx The index to check for object existence
      @return {Boolean}
     */
    isObjectAt: function(idx) {
      var result;
      result = this.objectAt(idx, true);
      return !!(result && result.isStale !== true);
    },

    /*
      Get the data from the specified index.
    
      If an object is found at a given index, it will be returned immediately.
    
      Otherwise, a "stale" placeholder object will be returned and a new remote
      query to fetch the data for the given index will be created.
    
      @method objectAt
      @param {Integer} idx The index to obtain content for
      @param {Boolean} dontFetch Won't obtain remote data if `true`
      @return {Object}
     */
    objectAt: function(idx, dontFetch) {
      var result, _ref;
      idx = parseInt(idx, 10);
      if (isNaN(idx) || (idx < 0) || (idx >= get(this, 'length'))) {
        return void 0;
      }
      result = (_ref = this._super(idx)) != null ? _ref : this.insertSparseArrayItem(idx);
      if (result && result.isStale !== true) {
        return result;
      }
      return this.requestObjectAt(idx, dontFetch);
    },

    /*
      Fetches data at the specified index. If `rangeSize` is greater than 1, this
      method will also retrieve adjacent items to form a "page" of results.
    
      @method requestObjectAt
      @param {Integer} idx The index to fetch content for
      @param {Boolean} dontFetch Won't obtain remote data if `true`
      @return {Object|Null} A placeholder object or null if content is empty
     */
    requestObjectAt: function(idx, dontFetch) {
      var content, i, placeholders, range, rangeSize, start, _i, _j, _ref, _results;
      if (dontFetch == null) {
        dontFetch = !get(this, 'shouldRequestObjects');
      }
      if (dontFetch) {
        return (_ref = get(this, 'sparseContent')[idx]) != null ? _ref : this.insertSparseArrayItem(idx);
      }
      content = get(this, 'content');
      rangeSize = parseInt(get(this, 'rangeSize'), 10) || 1;
      if (content == null) {
        return null;
      }
      start = Math.floor(idx / rangeSize) * rangeSize;
      start = Math.max(start, 0);
      placeholders = Math.min(start + rangeSize, get(this, 'length'));
      this.insertSparseArrayItems((function() {
        _results = [];
        for (var _i = start; start <= placeholders ? _i < placeholders : _i > placeholders; start <= placeholders ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this));
      if (this.didRequestRange !== Ember.K) {
        range = this._TMP_RANGE;
        range.start = start;
        range.length = rangeSize;
        this._didRequestRange(range);
      } else {
        for (i = _j = start; start <= rangeSize ? _j < rangeSize : _j > rangeSize; i = start <= rangeSize ? ++_j : --_j) {
          this._didRequestIndex(i);
        }
      }
      return get(this, 'sparseContent')[idx];
    },

    /*
      Fetches data regarding the total number of objects in the
      persistence layer.
    
      @method requestLength
      @return {Integer} The current known length
     */
    requestLength: function() {
      var len;
      len = get(this, '_length');
      if (!((this.didRequestLength === Ember.K) || get(this, 'isRequestingLength'))) {
        set(this, 'isRequestingLength', true);
        this._didRequestLength();
        return len;
      }
      return get(this, '_content.length');
    },

    /*
      Empty the sparse array.
    
      @method reset
      @chainable
     */
    reset: function() {
      var len;
      this.beginPropertyChanges();
      len = get(this, '_length');
      this._clearSparseContent();
      set(this, '_length', len);
      this.endPropertyChanges();
      return this;
    },

    /*
      Uncache the item at the specified index.
    
      @method unset
      @param {Integer} idx The index to unset
      @chainable
     */
    unset: function(idx) {
      var sparseContent;
      if (idx == null) {
        return this;
      }
      sparseContent = get(this, 'sparseContent');
      sparseContent[idx] = void 0;
      return this;
    },

    /*
      Remove the item at the specified index.
    
      @method removeObject
      @param {Mixed} obj The object to remove from the content
      @chainable
     */
    removeObject: function(obj) {
      var shouldRequestObjects;
      shouldRequestObjects = get(this, 'shouldRequestObjects');
      this.disableRequests();
      this._super(obj);
      if (shouldRequestObjects) {
        this.enableRequests();
      }
      return this;
    },

    /*
      Enable data fetching.
    
      @method enableRequests
      @chainable
     */
    enableRequests: function() {
      set(this, 'shouldRequestObjects', true);
      return this;
    },

    /*
      Disable data fetching.
    
      @method disableRequests
      @chainable
     */
    disableRequests: function() {
      set(this, 'shouldRequestObjects', false);
      return this;
    },

    /*
      Insert a placeholder object at the specified index.
    
      @method insertSparseArrayItem
      @param {Integer} idx Where to inject a placeholder
      @param {Boolean} force If true, placeholder replaces existing content
      @return {Object}
     */
    insertSparseArrayItem: function(idx, force) {
      var proxy, sparseContent;
      if (force == null) {
        force = false;
      }
      sparseContent = get(this, 'sparseContent');
      proxy = Ember.copy(this._TMP_OBJECT);
      proxy.contentIndex = idx;
      if (force || (sparseContent[idx] == null)) {
        sparseContent[idx] = proxy;
      }
      return sparseContent[idx];
    },

    /*
      Insert placeholder objects at the specified indexes.
    
      @method insertSparseArrayItems
      @param {Integer|Array} idx Multiple indexes
      @chainable
     */
    insertSparseArrayItems: function() {
      var i, idx, _i, _len, _ref;
      idx = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = [].concat.apply([], idx);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        this.insertSparseArrayItem(i);
      }
      return this;
    },

    /*
      Async callback to provide total number of objects available to this
      controller stored in the persistence layer.
    
      @method provideLength
      @param {Integer} length The total number of available objects
      @chainable
     */
    provideLength: function(length) {
      set(this, '_length', length);
      set(this, 'isRequestingLength', false);
      return this;
    },

    /*
      Async callback to provide objects in a specific range.
    
      @method provideObjectsInRange
      @param {Object} [range] A range object
        @param {Integer} [range.start]
          The index at which objects should be inserted into the content array
        @param {Integer} [range.length]
          The number of items to replace with the updated data
      @param {Array} array The data to inject into the sparse array
      @chainable
     */
    provideObjectsInRange: function(range, array) {
      var sparseContent;
      sparseContent = get(this, 'sparseContent');
      sparseContent.replace(range.start, range.length, array);
      return this;
    },

    /*
      Async callback to provide an object at a specific index.
    
      Ultimately, this method calls `provideObjectsInRange`. Override
      `provideObjectsInRange` to inject custom behavior.
    
      @method provideObjectAtIndex
      @param {Integer} idx The index to insert data at
      @param {Object} obj The object to insert
      @chainable
     */
    provideObjectAtIndex: function(idx, obj) {
      var array, range;
      array = this._TMP_PROVIDE_ARRAY;
      range = this._TMP_PROVIDE_RANGE;
      array[0] = obj;
      range.start = idx;
      return this.provideObjectsInRange(range, array);
    },

    /*
      Hook for responding to impending updates to the content array. Override to
      add custom handling for array updates.
    
      @method contentArrayWillChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    contentArrayWillChange: function(array, idx, removedCount, addedCount) {
      return this;
    },

    /*
      Hook for responding to updates to the content array. Override to
      add custom handling for array updates.
    
      @method contentArrayWillChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    contentArrayDidChange: function(array, idx, removedCount, addedCount) {
      return this;
    },

    /*
      @private
    
      Override Ember's `_contentWillChange` to observe `_content`.
    
      @method _contentWillChange
     */
    _contentWillChange: Ember.beforeObserver(function() {
      return this._super();
    }, '_content'),

    /*
      @private
    
      Override Ember's `_contentDidChange` to observe `_content` and `content`.
    
      @method _contentDidChange
     */
    _contentDidChange: Ember.observer(function() {
      return this._super();
    }, 'content', '_content'),

    /*
      @private
    
      Move any array set to the `content` property to the `_content` property.
    
      This allows `content` to be used for referencing the sparse array while
      retaining a reference to the originally provided content object.
    
      @method _setupContent
      @return {Array} The sparse array
     */
    _setupContent: function() {
      var controller, sparseContent, _content, _ref;
      controller = this;
      _content = get(controller, 'content');
      if (_content && _content.isSparseArray) {
        return;
      }
      if (_content) {
        _content.addArrayObserver(controller, {
          willChange: "contentArrayWillChange",
          didChange: "contentArrayDidChange"
        });
      }
      sparseContent = Ember.A((_ref = _content && _content.slice()) != null ? _ref : []);
      sparseContent.isSparseArray = true;
      set(controller, '_content', _content);
      set(controller, 'sparseContent', sparseContent);
      return sparseContent;
    },

    /*
      @private
    
      Remove observers from `_content`.
    
      @method _teardownContent
      @return null
     */
    _teardownContent: function() {
      var controller, _content;
      controller = this;
      _content = get(controller, '_content');
      if (_content) {
        _content.removeArrayObserver(controller, {
          willChange: "contentArrayWillChange",
          didChange: "contentArrayDidChange"
        });
      }
      return null;
    },

    /*
      @private
    
      Set reported length to `content.total` if it changes.
    
      @method _contentTotalChanged
      @chainable
     */
    _contentTotalChanged: Ember.observer(function() {
      set(this, '_length', get(this, 'content.total'));
      return this;
    }, 'content.total'),

    /*
      Hook for responding to the sparse array being replaced with a new
      array instance. Override to add custom handling.
    
      @method sparseContentWillChange
      @param {Object} self
     */
    sparseContentWillChange: Ember.K,

    /*
      Hook for responding to the sparse array being replaced with a new
      array instance. Override to add custom handling.
    
      @method sparseContentDidChange
      @param {Object} self
     */
    sparseContentDidChange: Ember.K,

    /*
      Hook for injecting custom behavior when an item in the sparse array gets
      replaced with new data.
    
      @method sparseContentDidChange
      @param {Object} item The previous value
      @param {Object} addedObject The new value
     */
    didReplaceSparseArrayItem: Ember.K,

    /*
      Hook for responding to impending updates to the sparse array. Extend to
      add custom handling for array updates.
    
      @method sparseContentArrayWillChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    sparseContentArrayWillChange: function(array, idx, removedCount, addedCount) {
      this._PREVIOUS_SPARSE_CONTENT = array.slice(idx, idx + removedCount);
      return this;
    },

    /*
      Hook for responding to updates to the sparse array. Extend to
      add custom handling for array updates.
    
      @method sparseContentArrayDidChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    sparseContentArrayDidChange: function(array, idx, removedCount, addedCount) {
      var addedObjects, delta, i, item, removedObjects, _i, _len, _ref;
      removedObjects = (_ref = this._PREVIOUS_SPARSE_CONTENT) != null ? _ref : Ember.A();
      addedObjects = array.slice(idx, idx + addedCount);
      delta = ((addedObjects != null ? addedObjects.length : void 0) || 0) - ((removedObjects != null ? removedObjects.length : void 0) || 0);
      set(this, '_length', get(this, '_length') + delta);
      for (i = _i = 0, _len = removedObjects.length; _i < _len; i = ++_i) {
        item = removedObjects[i];
        if (item && item.isSparseArrayItem) {
          this.didReplaceSparseArrayItem(item, addedObjects[i]);
        }
      }
      this._PREVIOUS_SPARSE_CONTENT = null;
      return this;
    },

    /*
      @private
    
      Sparse array change handler.
    
      @method _sparseContentWillChange
     */
    _sparseContentWillChange: Ember.beforeObserver(function() {
      var len, sparseContent;
      sparseContent = get(this, 'sparseContent');
      len = sparseContent ? get(sparseContent, 'length') : 0;
      this.sparseContentArrayWillChange(this, 0, len, void 0);
      this.sparseContentWillChange(this);
      return this._teardownSparseContent(sparseContent);
    }, 'sparseContent'),

    /*
      @private
    
      Sparse array change handler.
    
      @method _sparseContentDidChange
     */
    _sparseContentDidChange: Ember.observer(function() {
      var len, sparseContent;
      sparseContent = get(this, 'sparseContent');
      len = sparseContent ? get(sparseContent, 'length') : 0;
      this._setupSparseContent(sparseContent);
      this.sparseContentDidChange(this);
      return this.sparseContentArrayDidChange(this, 0, void 0, len);
    }, 'sparseContent'),

    /*
      @private
    
      Remove change observing on sparse array.
    
      @method _teardownSparseContent
     */
    _teardownSparseContent: function() {
      var sparseContent;
      this._clearSparseContent();
      sparseContent = get(this, 'sparseContent');
      if (sparseContent) {
        return sparseContent.removeArrayObserver(this, {
          willChange: 'sparseContentArrayWillChange',
          didChange: 'sparseContentArrayDidChange'
        });
      }
    },

    /*
      @private
    
      Add change observing on sparse array.
    
      @method _setupSparseContent
     */
    _setupSparseContent: function() {
      var sparseContent;
      sparseContent = get(this, 'sparseContent');
      if (sparseContent) {
        sparseContent.addArrayObserver(this, {
          willChange: 'sparseContentArrayWillChange',
          didChange: 'sparseContentArrayDidChange'
        });
      }
      return this._lengthDidChange();
    },

    /*
      @private
    
      Set the sparse array's length to the controller's length.
    
      @method _lengthDidChange
     */
    _lengthDidChange: Ember.observer(function() {
      var length, sparseContent, _ref;
      length = (_ref = get(this, 'length')) != null ? _ref : 0;
      sparseContent = get(this, 'sparseContent');
      if (Ember.isArray(sparseContent) && sparseContent.isSparseArray && sparseContent.length !== length) {
        return sparseContent.length = length;
      }
    }, 'length'),

    /*
      @private
    
      Empty the sparse array.
    
      @method _clearSparseContent
     */
    _clearSparseContent: function() {
      var sparseContent;
      sparseContent = get(this, 'sparseContent');
      if (sparseContent && sparseContent.isSparseArray) {
        sparseContent.clear();
      }
      return this;
    },

    /*
      Called before controller destruction.
    
      @method willDestroy
     */
    willDestroy: function() {
      this._super();
      return this._teardownSparseContent();
    },

    /*
      Hook for single object requests. Override this method to enable this
      controller to obtain a single persisted object.
    
      If the request is successful, insert the fetched object into the sparse
      array using the `provideObjectAtIndex` method.
    
      @method didRequestIndex
      @param {Integer} idx
     */
    didRequestIndex: Ember.K,

    /*
      Hook for range requests. Override this method to enable this controller
      to obtain a page of persisted data.
    
      If the request is successful, insert the fetched objects into the sparse
      array using the `provideObjectsInRange` method.
    
      @method didRequestRange
      @param {Object} [range] A range object
        @param {Integer} [range.start]
          The index to fetch
        @param {Integer} [range.length]
          The number of items to fetch
     */
    didRequestRange: Ember.K,

    /*
      Hook for initiating requests for the total number of objects available to
      this controller in the persistence layer. Override this method to enable
      this controller to obtain its length.
    
      If the request is successful, set the length of this sparse array
      controller using the `provideLength` method.
    
      @method didRequestLength
     */
    didRequestLength: Ember.K,

    /*
      @private
    
      Prevents the controller from continuously attempting to fetch data for
      objects that are already in the process of being fetched.
    
      @method _markSparseArrayItemInProgress
      @param {Integer} idx The index of the object to place into a loading state
     */
    _markSparseArrayItemInProgress: function(idx) {
      var item, sparseContent;
      sparseContent = get(this, 'sparseContent');
      if (!(sparseContent && Ember.typeOf(sparseContent === 'array'))) {
        return;
      }
      item = sparseContent[idx];
      if (item && item.isStale) {
        item.isStale = false;
      }
      return item;
    },

    /*
      @private
    
      Prepare to fetch a page of data from the persistence layer.
    
      @method _didRequestRange
      @param {Object} [range] A range object
        @param {Integer} [range.start]
          The index to fetch
        @param {Integer} [range.length]
          The number of items to fetch
     */
    _didRequestRange: function(range) {
      var idx, _i, _ref, _ref1;
      for (idx = _i = _ref = range.start, _ref1 = range.start + range.length; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; idx = _ref <= _ref1 ? ++_i : --_i) {
        this._markSparseArrayItemInProgress(idx);
      }
      return this.didRequestRange(range);
    },

    /*
      @private
    
      Prepare to fetch a single object from the persistence layer.
    
      @method _didRequestIndex
      @param {Integer} idx
     */
    _didRequestIndex: function(idx) {
      this._markSparseArrayItemInProgress(idx);
      return this.didRequestIndex(idx);
    },

    /*
      @private
    
      Prepare to fetch the total number of available objects from the
      persistence layer.
    
      @method _didRequestLength
     */
    _didRequestLength: function() {
      return this.didRequestLength();
    }
  });

}).call(this);
