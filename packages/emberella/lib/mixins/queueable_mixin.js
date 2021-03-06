// Generated by CoffeeScript 1.7.1

/*
@module emberella
@submodule emberella-mixins
 */

(function() {
  var Emberella, get, guidFor, set,
    __slice = [].slice;

  Emberella = window.Emberella;

  get = Ember.get;

  set = Ember.set;

  guidFor = Ember.guidFor;


  /*
    `Emberella.QueueableMixin` empowers an array controller to establish a queue
    of items or objects for further processing. Items will be processed a
    configurable number at a time in the order they are added. The queue also
    calculates how much of the queue has been completed.
  
    To add items to the queue, pass them as arguments to the `addToQueue` method.
  
    Currently, I use this mixin as part of a file uploader mechanism. Sending a
    large set of files to the server all at once flirts with disaster. Thus,
    files are queued and uploaded a few at a time.
  
    This mixin is rough around the edges and is not verified to work
    across browsers.
  
    TODO: Refactor. Still feels a bit over-complex and in need of testing.
  
    @class QueueableMixin
    @namespace Emberella
   */

  Emberella.QueueableMixin = Ember.Mixin.create({

    /*
      @property isQueueable
      @type Boolean
      @default true
      @final
     */
    isQueueable: true,

    /*
      The reference to the queue array. This array keeps a reference to all
      objects added to the queue, including items in progress or completed.
    
      @property queued
      @type Array
      @default null
     */
    queued: null,

    /*
      An array of objects currently being processed.
    
      @property inProgress
      @type Array
      @default null
     */
    inProgress: null,

    /*
      An array of objects marked as completed.
    
      @property completed
      @type Array
      @default null
     */
    completed: null,

    /*
      If true, the queue will stop adding objects from the queue to an in
      progress state.
    
      @property isPaused
      @type Boolean
      @default false
     */
    isPaused: false,

    /*
      The maximum number of objects allowed into the `inProgress` array.
    
      @property simultaneous
      @type Integer
      @default 4
     */
    simultaneous: 4,

    /*
      @deprecated Use `queued` instead
      @property in_queue
     */
    in_queue: Ember.computed.alias('queued'),

    /*
      @deprecated Use `inProgress` instead
      @property in_progress
     */
    in_progress: Ember.computed.alias('inProgress'),

    /*
      @deprecated Use `completed` instead
      @property is_complete
     */
    is_complete: Ember.computed.alias('completed'),
    init: function(simultaneous) {
      if (simultaneous == null) {
        simultaneous = 4;
      }
      set(this, 'queued', Ember.A());
      set(this, 'inProgress', Ember.A());
      set(this, 'completed', Ember.A());
      return this._super();
    },

    /*
      (length of completed items) / (length of queued items)
    
      Represented as a number between 0 and 1.
    
      @property percentComplete
      @type Number
      @default 0
     */
    percentComplete: Ember.computed(function() {
      var completedLength, percent, queuedLength;
      queuedLength = +get(this, 'queued.length');
      completedLength = +get(this, 'completed.length');
      if (queuedLength === 0 || completedLength === 0) {
        return 0;
      }
      percent = completedLength / queuedLength;
      return Math.min(percent, 1);
    }).property('completed', 'completed.length', 'queued', 'queued.length'),

    /*
      Boolean flag that indicates if the queue has finished being processed.
    
      @property isComplete
      @type Boolean
      @default false
     */
    isComplete: Ember.computed(function() {
      return !!(get(this, 'queued.length') > 0 && get(this, 'completed.length') >= get(this, 'queued.length') && get(this, 'inProgress.length') === 0);
    }).property('completed', 'queued', 'inProgress', 'completed.length', 'queued.length', 'inProgress.length'),

    /*
      A state property to inject into queued objects.
    
      @property stateKey
      @type String
     */
    stateKey: Ember.computed(function() {
      return [guidFor(this), 'queue-state'].join('-');
    }),

    /*
      An error property to inject into queued objects.
    
      @property errorKey
      @type String
     */
    errorKey: Ember.computed(function() {
      return [guidFor(this), 'queue-attempts'].join('-');
    }),

    /*
      Updates state of completed items.
    
      @method queueCompleted
      @return null
     */
    queueCompleted: Ember.observer(function() {
      if (!get(this, 'isComplete')) {
        return;
      }
      get(this, 'completed').invoke('set', get(this, 'stateKey'), 'was_completed');
      this.didCompleteQueue();
      return null;
    }).observes('isComplete'),

    /*
      Add items from the queue into the in progress stack until the number of
      items in progress equals the number of items specified in the
      `simultaneous` property.
    
      @method manageQueue
      @return null
     */
    manageQueue: Ember.observer(function() {
      var item, stateKey;
      stateKey = get(this, 'stateKey');
      if (get(this, 'isPaused')) {
        return;
      }
      if (+get(this, 'inProgress.length') < get(this, 'simultaneous')) {
        item = get(this, 'queued').find(function(obj) {
          return get(obj, stateKey) === 'in_queue';
        });
        if (item) {
          get(this, 'inProgress').addObject(item);
        }
      }
      return null;
    }).observes('inProgress', 'inProgress.length', 'queued', 'queued.length', 'simultaneous', 'isPaused'),

    /*
      Begin processing of objects newly added to the `inProgress` array.
    
      @method activateQueued
      @return null
     */
    activateQueued: Ember.observer(function() {
      var stateKey;
      stateKey = get(this, 'stateKey');
      get(this, 'inProgress').forEach((function(_this) {
        return function(item) {
          if (!(get(item, stateKey) === 'in_progress' || get(item, stateKey) === 'isError')) {
            set(item, stateKey, 'in_progress');
            return _this.didActivateQueueItem(item);
          }
        };
      })(this));
      return null;
    }).observes('inProgress', 'inProgress.length'),

    /*
      Cleanup queues when items removed from content array.
    
      @method removeDeletedItemsFromQueues
      @return null
     */
    removeDeletedItemsFromQueues: Ember.observer(function() {
      var filterFn, remove;
      if (!get(this, 'queued')) {
        return;
      }
      filterFn = (function(_this) {
        return function(item) {
          return !_this.contains(item);
        };
      })(this);
      remove = get(this, 'queued').filter(filterFn);
      get(this, 'completed').removeObjects(remove);
      get(this, 'queued').removeObjects(remove);
      get(this, 'inProgress').removeObjects(remove);
      return null;
    }).observes('content'),

    /*
      Add an item, multiple items, or an array of items to the queue.
    
      @method addToQueue
      @param {Object|Array} items Objects to add to the queue for processing
      @chainable
     */
    addToQueue: function() {
      var item, items, obj, stateKey, _i, _len;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      items = [].concat.apply([], [].concat(items));
      stateKey = get(this, 'stateKey');
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        obj = item instanceof Ember.Object ? item : Ember.Object.create({
          'isQueueableItem': true,
          'content': item
        });
        if (!obj.get(stateKey)) {
          set(obj, stateKey, 'in_queue');
          get(this, 'in_queue').pushObject(obj);
        }
      }
      return this;
    },

    /*
      Retry an item that reported an error during processing.
    
      @method retry
      @param {Object|Array} items Objects to recover from error state
      @chainable
     */
    retry: function() {
      var item, items, stateKey, _i, _len;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      stateKey = get(this, 'stateKey');
      items = [].concat.apply([], [].concat(items));
      if (!items.length) {
        items = get(this, 'queued').filter(function(obj) {
          return obj.get(stateKey) === 'isError';
        });
      }
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        if (this.willRetryQueueItem(item) !== false) {
          set(item, stateKey, 'in_queue');
        }
      }
      if (items.length) {
        this.propertyDidChange('queued');
      }
      return this;
    },

    /*
      Put the queue into a paused state.
    
      @method pauseQueue
      @chainable
     */
    pauseQueue: function() {
      set(this, 'isPaused', true);
      return this;
    },

    /*
      Unpause the queue.
    
      @method resumeQueue
      @chainable
     */
    resumeQueue: function() {
      set(this, 'isPaused', false);
      get(this, 'inProgress').removeObjects(get(this, 'completed'));
      return this;
    },

    /*
      Flag a queued object as completed and move it into the completed pile.
    
      @method markAsComplete
      @param {Object} item Object to mark as complete
      @chainable
     */
    markAsComplete: function(item) {
      set(item, get(this, 'stateKey'), 'is_complete');
      get(this, 'completed').pushObject(item);
      this.didCompleteQueueItem(item);
      if (get(item, 'isQueueableItem')) {
        set(item, 'content', null);
        item.destroy();
      }
      if (!get(this, 'isPaused')) {
        get(this, 'inProgress').removeObject(item);
      }
      return this;
    },

    /*
      Place a queued object into an error state.
    
      @method markAsError
      @param {Object} item Object to put into an error state
      @chainable
     */
    markAsError: function(item) {
      var errorKey;
      errorKey = get(this, 'errorKey');
      set(item, get(this, 'stateKey'), 'isError');
      item.incrementProperty(errorKey, 1);
      if (this.didQueueItemError(item, get(item, errorKey)) !== false) {
        get(this, 'inProgress').removeObject(item);
      }
      return this;
    },

    /*
      Reset all queue arrays.
    
      @method clearAll
      @chainable
     */
    clearAll: function() {
      return this.clearQueue().clearInProgress().clearComplete();
    },

    /*
      Reset the `queued` array.
    
      @method clearQueue
      @chainable
     */
    clearQueue: function() {
      this._clearQueued();
      return this;
    },

    /*
      Reset the `inProgress` array.
    
      @method clearInProgress
      @chainable
     */
    clearInProgress: function() {
      this._clearInProgress();
      return this;
    },

    /*
      Reset the `completed` array.
    
      @method clearComplete
      @chainable
     */
    clearComplete: function() {
      this._clearCompleted();
      return this;
    },

    /*
      Remove completed items from the queue management arrays.
    
      @method removePreviouslyCompletedItems
      @chainable
     */
    removePreviouslyCompletedItems: function() {
      var previouslyComplete, stateKey;
      stateKey = get(this, 'stateKey');
      previouslyComplete = get(this, 'queued').filter(function(item) {
        return item.get(stateKey) === 'was_completed';
      });
      get(this, 'queued').removeObjects(previouslyComplete);
      get(this, 'completed').removeObjects(previouslyComplete);
      return this;
    },

    /*
      Hook for intercepting queued objects that experienced errors during
      processing and are about to be retried.
    
      Override to add pre-processing of queued items to be retried. Return
      `false` to prevent the retry attempt.
    
      @method willRetryQueueItem
      @param {Object} item The item about to be retried
     */
    willRetryQueueItem: Ember.K,

    /*
      Hook for intercepting queued objects that experienced and error during
      processing.
    
      Override to add custom error handling for the queued item.
    
      @method didQueueItemError
      @param {Object} item The item with the error
     */
    didQueueItemError: Ember.K,

    /*
      Hook for objects moving from the queue to in progress. Override with your
      own handler to begin processing for the given object.
    
      @method didActivateQueueItem
     */
    didActivateQueueItem: function(item) {
      return this.markAsComplete(item);
    },

    /*
      Hook for objects moving from in progress to completed. Override with your
      own handler to finalize processing for the given object.
    
      @method didCompleteQueueItem
     */
    didCompleteQueueItem: Ember.K,

    /*
      Hook for performing actions after queue processing is complete.
      Override this method to add custom behavior.
    
      @method didCompleteQueue
     */
    didCompleteQueue: Ember.K,

    /*
      Hook for responding to the queued array being replaced with a new
      array instance. Override to add custom handling.
    
      @method queuedWillChange
      @param {Object} self
     */
    queuedWillChange: Ember.K,

    /*
      Hook for responding to the queued array being replaced with a new
      array instance. Override to add custom handling.
    
      @method queuedDidChange
      @param {Object} self
     */
    queuedDidChange: Ember.K,

    /*
      Hook for responding to impending updates to the queued array. Override to
      add custom handling for array updates.
    
      @method queuedArrayWillChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    queuedArrayWillChange: function(array, idx, removedCount, addedCount) {
      return this;
    },

    /*
      Hook for responding to updates to the queued array. Override to
      add custom handling for array updates.
    
      @method queuedArrayDidChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    queuedArrayDidChange: function(array, idx, removedCount, addedCount) {
      return this;
    },

    /*
      @private
    
      Queue array change handler.
    
      @method _queuedWillChange
     */
    _queuedWillChange: Ember.beforeObserver(function() {
      var len, queued;
      queued = get(this, 'queued');
      len = queued ? get(queued, 'length') : 0;
      this.queuedArrayWillChange(this, 0, len, void 0);
      this.queuedWillChange(this);
      return this._teardownQueued(queued);
    }, 'queued'),

    /*
      @private
    
      Queue array change handler.
    
      @method _queuedDidChange
     */
    _queuedDidChange: Ember.observer(function() {
      var len, queued;
      queued = get(this, 'queued');
      len = queued ? get(queued, 'length') : 0;
      this._setupQueued(queued);
      this.queuedDidChange(this);
      return this.queuedArrayDidChange(this, 0, void 0, len);
    }, 'queued'),

    /*
      @private
    
      Remove change observing on queued array.
    
      @method _teardownQueued
     */
    _teardownQueued: function() {
      var queued;
      this._clearQueued();
      queued = get(this, 'queued');
      if (queued) {
        return queued.removeArrayObserver(this, {
          willChange: 'queuedArrayWillChange',
          didChange: 'queuedArrayDidChange'
        });
      }
    },

    /*
      @private
    
      Begin change observing on queued array.
    
      @method _setupQueued
     */
    _setupQueued: function() {
      var queued;
      queued = get(this, 'queued');
      if (queued) {
        return queued.addArrayObserver(this, {
          willChange: 'queuedArrayWillChange',
          didChange: 'queuedArrayDidChange'
        });
      }
    },

    /*
      @private
    
      Empty the queued array.
    
      @method _clearQueued
     */
    _clearQueued: function() {
      var queued;
      queued = get(this, 'queued');
      if (queued) {
        return queued.clear();
      }
    },

    /*
      Hook for responding to the inProgress array being replaced with a new
      array instance. Override to add custom handling.
    
      @method inProgressWillChange
      @param {Object} self
     */
    inProgressWillChange: Ember.K,

    /*
      Hook for responding to the inProgress array being replaced with a new
      array instance. Override to add custom handling.
    
      @method inProgressDidChange
      @param {Object} self
     */
    inProgressDidChange: Ember.K,

    /*
      Hook for responding to impending updates to the inProgress array. Override to
      add custom handling for array updates.
    
      @method inProgressArrayWillChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    inProgressArrayWillChange: function(array, idx, removedCount, addedCount) {
      return this;
    },

    /*
      Hook for responding to updates to the inProgress array. Override to
      add custom handling for array updates.
    
      @method inProgressArrayDidChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    inProgressArrayDidChange: function(array, idx, removedCount, addedCount) {
      return this;
    },

    /*
      @private
    
      In progress array change handler.
    
      @method _inProgressWillChange
     */
    _inProgressWillChange: Ember.beforeObserver(function() {
      var inProgress, len;
      inProgress = get(this, 'inProgress');
      len = inProgress ? get(inProgress, 'length') : 0;
      this.inProgressArrayWillChange(this, 0, len, void 0);
      this.inProgressWillChange(this);
      return this._teardownInProgress(inProgress);
    }, 'inProgress'),

    /*
      @private
    
      In progress array change handler.
    
      @method _inProgressDidChange
     */
    _inProgressDidChange: Ember.observer(function() {
      var inProgress, len;
      inProgress = get(this, 'inProgress');
      len = inProgress ? get(inProgress, 'length') : 0;
      this._setupInProgress(inProgress);
      this.inProgressDidChange(this);
      return this.inProgressArrayDidChange(this, 0, void 0, len);
    }, 'inProgress'),

    /*
      @private
    
      Remove change observing on in progress array.
    
      @method _teardownInProgress
     */
    _teardownInProgress: function() {
      var inProgress;
      this._clearInProgress();
      inProgress = get(this, 'inProgress');
      if (inProgress) {
        return inProgress.removeArrayObserver(this, {
          willChange: 'inProgressArrayWillChange',
          didChange: 'inProgressArrayDidChange'
        });
      }
    },

    /*
      @private
    
      Begin change observing on in progress array.
    
      @method _setupInProgress
     */
    _setupInProgress: function() {
      var inProgress;
      inProgress = get(this, 'inProgress');
      if (inProgress) {
        return inProgress.addArrayObserver(this, {
          willChange: 'inProgressArrayWillChange',
          didChange: 'inProgressArrayDidChange'
        });
      }
    },

    /*
      @private
    
      Empty the in progress array.
    
      @method _clearInProgress
     */
    _clearInProgress: function() {
      var inProgress;
      inProgress = get(this, 'inProgress');
      if (inProgress) {
        return inProgress.clear();
      }
    },

    /*
      Hook for responding to the completed array being replaced with a new
      array instance. Override to add custom handling.
    
      @method completedWillChange
      @param {Object} self
     */
    completedWillChange: Ember.K,

    /*
      Hook for responding to the completed array being replaced with a new
      array instance. Override to add custom handling.
    
      @method completedWillChange
      @param {Object} self
     */
    completedDidChange: Ember.K,

    /*
      Hook for responding to impending updates to the completed array. Override to
      add custom handling for array updates.
    
      @method completedArrayWillChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    completedArrayWillChange: function(array, idx, removedCount, addedCount) {
      return this;
    },

    /*
      Hook for responding to updates to the completed array. Override to
      add custom handling for array updates.
    
      @method completedArrayDidChange
      @param {Array} array The array instance being updated
      @param {Integer} idx The index where changes applied
      @param {Integer} removedCount
      @param {Integer} addedCount
     */
    completedArrayDidChange: function(array, idx, removedCount, addedCount) {
      return this;
    },

    /*
      @private
    
      Completed array change handler.
    
      @method _completedWillChange
     */
    _completedWillChange: Ember.beforeObserver(function() {
      var completed, len;
      completed = get(this, 'completed');
      len = completed ? get(completed, 'length') : 0;
      this.completedArrayWillChange(this, 0, len, void 0);
      this.completedWillChange(this);
      return this._teardownCompleted(completed);
    }, 'completed'),

    /*
      @private
    
      Completed array change handler.
    
      @method _completedDidChange
     */
    _completedDidChange: Ember.observer(function() {
      var completed, len;
      completed = get(this, 'completed');
      len = completed ? get(completed, 'length') : 0;
      this._setupCompleted(completed);
      this.completedDidChange(this);
      return this.completedArrayDidChange(this, 0, void 0, len);
    }, 'completed'),

    /*
      @private
    
      Remove change observing on completed array.
    
      @method _teardownCompleted
     */
    _teardownCompleted: function() {
      var completed;
      this._clearCompleted();
      completed = get(this, 'completed');
      if (completed) {
        return completed.removeArrayObserver(this, {
          willChange: 'completedArrayWillChange',
          didChange: 'completedArrayDidChange'
        });
      }
    },

    /*
      @private
    
      Begin change observing on completed array.
    
      @method _setupCompleted
     */
    _setupCompleted: function() {
      var completed;
      completed = get(this, 'completed');
      if (completed) {
        return completed.addArrayObserver(this, {
          willChange: 'completedArrayWillChange',
          didChange: 'completedArrayDidChange'
        });
      }
    },

    /*
      @private
    
      Empty the completed array.
    
      @method _clearCompleted
     */
    _clearCompleted: function() {
      var completed;
      completed = get(this, 'completed');
      if (completed) {
        return completed.clear();
      }
    },

    /*
      Called before destruction of the host object.
    
      @method willDestroy
     */
    willDestroy: function() {
      this._super();
      this._teardownQueued();
      this._teardownInProgress();
      return this._teardownCompleted();
    }
  });

}).call(this);
