// Generated by CoffeeScript 1.7.1

/*
@module emberella
@submodule emberella-mixins
 */

(function() {
  var Emberella, get, retrieveFromCurrentState, set, typeOf,
    __slice = [].slice;

  Emberella = window.Emberella;

  get = Ember.get;

  set = Ember.set;

  typeOf = Ember.typeOf;


  /*
    Each item in the queue manages state with an instance of
    `Emberella.MQStateManager`.
  
    A queue item can be in one of four states: `queued`, `active`, `completed`,
    or `error`.
  
    When in its initial state, `queued`, an object is in the queue waiting for
    its turn to be processed. Before work begins on an object, it is "activated"
    and moved into the `active` state. From here, the processing will either
    succeed and reach the `completed` state or fail and land in an `error` state.
  
    Each state also has an associated boolean flag to more readily identify items
    in the same state.
  
    `queued`: `isQueueItemWaiting: true`
    `active`: `isQueueItemInProgress: true`
    `completed`: `isQueueItemComplete: true`
    `error`: `isQueueItemError: true`
  
    Lastly, as objects change state, the state manager will inform your queueable
    controller by calling various hooks. By overriding the following methods, you
    can inject custom processing, error handling, and general behavior into the
    queueable object.
  
    `didAddQueueItem` is called when entering `queued` state.
    `didActivateQueueItem` is called when work on an object should begin.
    `didCompleteQueueItem` is called when work on an object is successful
    `didQueueItemError` is called when something goes wrong
    `willRetryQueueItem` is called when trying to recover an object from an error
  
    @class MQStateManager
    @namespace Emberella
    @extends Ember.StateManager
   */

  Emberella.MQStateManager = Ember.StateManager.extend({

    /*
      All objects in the queue begin in the `queued` state.
    
      @property initialState
      @type String
      @default 'queued'
      @final
     */
    initialState: 'queued',

    /*
      The number of times processing of the queued object has been retried after
      entering the error state.
    
      @property retries
      @type Integer
      @default 0
     */
    retries: 0,
    invokeQueueCallback: function(message) {
      var privateFn, queue, queueItem;
      queueItem = get(this, 'queueItem');
      queue = get(queueItem, 'queue');
      privateFn = '_' + message;
      if (queue != null) {
        if (typeOf(queue[privateFn]) === 'function') {
          queue[privateFn].call(queue, queueItem);
        }
        if (typeOf(queue[message]) === 'function') {
          return queue[message].call(queue, queueItem);
        }
      }
    },
    unhandledEvent: function(manager, eventName, e) {
      Ember.debug("MQ state manager did not handle an event :: " + eventName);
      return [manager, eventName, e];
    },
    queued: Ember.State.create({
      isQueueItemWaiting: true,
      setup: function(manager) {
        return manager.invokeQueueCallback('didAddQueueItem');
      },
      activate: function(manager) {
        return manager.transitionTo('active');
      },
      skip: function(manager) {
        return manager.transitionTo('completed');
      },
      didError: function(manager) {
        return manager.transitionTo('error');
      }
    }),
    active: Ember.State.create({
      isQueueItemInProgress: true,
      setup: function(manager) {
        return manager.invokeQueueCallback('didActivateQueueItem');
      },
      finish: function(manager) {
        return manager.transitionTo('completed');
      },
      didError: function(manager) {
        return manager.transitionTo('error');
      }
    }),
    completed: Ember.State.create({
      isQueueItemComplete: true,
      setup: function(manager) {
        return manager.invokeQueueCallback('didCompleteQueueItem');
      },
      didError: Ember.K
    }),
    error: Ember.State.create({
      isQueueItemError: true,
      setup: function(manager) {
        return manager.invokeQueueCallback('didQueueItemError');
      },
      retry: function(manager) {
        manager.invokeQueueCallback('willRetryQueueItem');
        manager.incrementProperty('retries');
        return Ember.run(function() {
          return manager.transitionTo('queued');
        });
      },
      didError: function(manager) {
        return manager.transitionTo('error');
      }
    })
  });

  retrieveFromCurrentState = Ember.computed(function(key, value) {
    return !!get(get(this, 'mqStateManager.currentState'), key);
  }).property('mqStateManager.currentState').readOnly();


  /*
    Each queued item is wrapped in an `Emberella.MQObject` object proxy to enable
    state management. Ideally, any object can be queued for gradual or delayed
    processing. Wrapping queued objects in a proxy allows queue state to be
    managed without altering the original content. It also allows an object to be
    inserted into multiple queues.
  
    @class MQObject
    @namespace Emberella
    @extends Ember.ObjectProxy
   */

  Emberella.MQObject = Ember.ObjectProxy.extend({
    init: function() {
      var stateManager;
      this._super();
      stateManager = Emberella.MQStateManager.create({
        queueItem: this
      });
      set(this, 'mqStateManager', stateManager);
      get(this, 'mqStateManager.currentState');
      get(this, 'isQueueItemWaiting');
      get(this, 'isQueueItemInProgress');
      get(this, 'isQueueItemComplete');
      return get(this, 'isQueueItemError');
    },

    /*
      @property isQueueableItem
      @type Boolean
      @default true
      @final
     */
    isQueueableItem: true,

    /*
      Holds a reference to this queued object's state manager.
    
      @property mqStateManager
      @type Emberella.MQStateManager
      @default null
     */
    mqStateManager: null,

    /*
      The number of times processing of the queued object has been retried after
      entering the error state.
    
      Bound to the `retries` property of this object's `mqStateManager`.
    
      @property retries
      @type Integer
      @default 0
     */
    retries: Ember.computed.alias('mqStateManager.retries').readOnly(),

    /*
      A computed property that returns true when this object is in the
      `queued` state.
    
      @property isQueueItemWaiting
      @type Boolean
      @default true
      @readOnly
     */
    isQueueItemWaiting: retrieveFromCurrentState,

    /*
      A computed property that returns true when this object is in the
      `active` state.
    
      @property isQueueItemInProgress
      @type Boolean
      @default false
      @readOnly
     */
    isQueueItemInProgress: retrieveFromCurrentState,

    /*
      A computed property that returns true when this object is in the
      `completed` state.
    
      @property isQueueItemComplete
      @type Boolean
      @default false
      @readOnly
     */
    isQueueItemComplete: retrieveFromCurrentState,

    /*
      A computed property that returns true when this object is in the
      `error` state.
    
      @property isQueueItemError
      @type Boolean
      @default false
      @readOnly
     */
    isQueueItemError: retrieveFromCurrentState,

    /*
      Send a message to the state manager. Valid messages may cause the state to
      change. Others will throw an exception.
    
      @method send
      @param String message to the state manager
      @param Mixed context
     */
    send: function(name, context) {
      get(this, 'mqStateManager').send(name, context);
      return context;
    }
  });


  /*
    `Emberella.MQMixin` empowers an array controller to establish a queue of
    items or objects for further processing. Items will be processed a
    configurable number at a time in the order they are added. The queue also
    calculates how much of the queue has been completed.
  
    To add items to the queue, pass them as arguments to the `addToQueue` method.
  
    Currently, I use this mixin as part of a file uploader mechanism. Sending a
    large set of files to the server all at once flirts with disaster. Thus,
    files are queued and uploaded a few at a time.
  
    This mixin replaces the over-complex and less reliable
    `Emberella.QueueableMixin`.
  
    TODO: Testing
    TODO: Cross browser fixes as needed
  
    @class MQMixin
    @namespace Emberella
   */

  Emberella.MQMixin = Ember.Mixin.create();

  Emberella.MQMixin.reopen({
    init: function() {
      var ret;
      ret = this._super.apply(this, arguments);
      set(this, 'queue', Ember.A());
      get(this, 'waiting');
      get(this, 'inProgress');
      get(this, 'completed');
      get(this, 'isComplete');
      get(this, 'percentComplete');
      return ret;
    },

    /*
      @property isQueueable
      @type Boolean
      @default true
      @final
     */
    isQueueable: true,

    /*
      If true, the queue will stop moving objects into or out of the
      `inProgress` bucket.
    
      @property isPaused
      @type Boolean
      @default false
     */
    isPaused: false,

    /*
      The maximum number of objects allowed to be in progress at a given time.
    
      @property simultaneous
      @type Integer
      @default 4
     */
    simultaneous: 4,

    /*
      An array of objects in the queue. This property will always contain all
      queued items in any state. From here, various computed properties will help
      identify queued objects in active, completed, and error states.
    
      @property queue
      @type Array
      @default null
     */
    queue: null,

    /*
      A boolean property to observe on each object in the queue. When the
      property specified here changes from `false` to `true`, the queued object
      will move to the `completed` state.
    
      @property itemCompleteProperty
      @type String
      @default 'isComplete'
     */
    itemCompleteProperty: 'isComplete',

    /*
      A boolean property to observe on each object in the queue. When the
      property specified here changes from `false` to `true`, the queued object
      will move to the `error` state.
    
      @property itemErrorProperty
      @type String
      @default 'isError'
     */
    itemErrorProperty: 'isError',

    /*
      (length of completed items) / (length of queued items)
    
      Represented as a number between 0 and 1.
    
      @property percentComplete
      @type Number
      @default 0
      @readOnly
     */
    percentComplete: Ember.computed(function() {
      var completedLength, percent, queueLength;
      queueLength = +get(this, 'queue.length');
      completedLength = +get(this, 'completed.length');
      if (queueLength === 0 || completedLength === 0) {
        return 0;
      }
      percent = completedLength / queueLength;
      return Math.min(percent, 1);
    }).property('completed', 'completed.length', 'queued', 'queued.length').readOnly(),

    /*
      Boolean flag that indicates if the queue has finished processing.
    
      @property isComplete
      @type Boolean
      @default false
     */
    isComplete: Ember.computed(function() {
      var completedLength, inProgressLength, queueLength;
      queueLength = +get(this, 'queue.length');
      completedLength = +get(this, 'completed.length');
      inProgressLength = +get(this, 'inProgress.length');
      return queueLength > 0 && completedLength >= queueLength && inProgressLength === 0;
    }).property('queue.@each', 'completed.@each', 'inProgress.@each'),

    /*
      An array of objects waiting to be processed. Once items are added to the
      queue, this property will initially contain all objects in the queue.
    
      @property waiting
      @type Array
      @default []
      @readOnly
     */
    waiting: Ember.computed(function() {
      var queue;
      if (!(queue = get(this, 'queue'))) {
        return Ember.A();
      }
      return queue.filter(function(item) {
        return !!(get(item, 'isQueueItemWaiting'));
      });
    }).property('queue.@each.isQueueItemWaiting').readOnly(),

    /*
      An array of objects currently being processed. This array's length should
      never exceed the numeric value provided by the `simultaneous` property.
    
      @property inProgress
      @type Array
      @default []
      @readOnly
     */
    inProgress: Ember.computed(function() {
      var queue;
      if (!(queue = get(this, 'queue'))) {
        return Ember.A();
      }
      return queue.filter(function(item) {
        return !!(get(item, 'isQueueItemInProgress'));
      });
    }).property('queue.@each.isQueueItemInProgress').readOnly(),

    /*
      An array of objects that were successfully processed.
    
      @property completed
      @type Array
      @default []
      @readOnly
     */
    completed: Ember.computed(function() {
      var queue;
      if (!(queue = get(this, 'queue'))) {
        return Ember.A();
      }
      return queue.filter(function(item) {
        return !!(get(item, 'isQueueItemComplete'));
      });
    }).property('queue.@each.isQueueItemComplete').readOnly(),

    /*
      An array of objects that reported an error during processing.
    
      @property failed
      @type Array
      @default []
      @readOnly
     */
    failed: Ember.computed(function() {
      return get(this, 'queue').filter(function(item) {
        return !!(get(item, 'isQueueItemError'));
      });
    }).property('queue.@each.isQueueItemError').readOnly(),

    /*
      The next object waiting in line for processing.
    
      @property nextInQueue
      @type Object
      @readOnly
     */
    nextInQueue: Ember.computed(function() {
      return get(this, 'waiting.firstObject');
    }).property('waiting').readOnly(),

    /*
      Add an object, multiple object, or an array of object to the queue.
    
      This method will wrap each object in an `Emberella.MQObject` proxy.
    
      Notably, the `queue` and `content` properties are managed independently.
    
      @method addToQueue
      @param {Object|Array} items Objects to add to the queue for processing
      @chainable
     */
    addToQueue: function() {
      var itemCompleteProperty, itemErrorProperty, items, processItem, queue, toBeAdded;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      items = Ember.A([].concat.apply([], [].concat(items)));
      queue = get(this, 'queue');
      itemCompleteProperty = get(this, 'itemCompleteProperty');
      itemErrorProperty = get(this, 'itemErrorProperty');
      toBeAdded = [];
      processItem = function(item) {
        var queueItem;
        queueItem = Emberella.MQObject.create({
          content: item,
          queue: this
        });
        if (get(queueItem, itemCompleteProperty)) {
          queueItem.send('skip');
        } else if (get(queueItem, itemErrorProperty)) {
          queueItem.send('didError');
        }
        return toBeAdded.push(queueItem);
      };
      Emberella.forEachAsync(this, items, processItem, function() {
        return queue.pushObjects(toBeAdded);
      });
      return this;
    },

    /*
      Remove an object, multiple object, or an array of object from the queue.
    
      @method removeFromQueue
      @param {Object|Array} items Objects to remove from the queue
      @chainable
     */
    removeFromQueue: function() {
      var itemCompleteProperty, itemErrorProperty, items, queue, queueItems;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      items = [].concat.apply([], [].concat(items));
      queue = get(this, 'queue');
      itemCompleteProperty = get(this, 'itemCompleteProperty');
      itemErrorProperty = get(this, 'itemErrorProperty');
      queueItems = items.map((function(_this) {
        return function(item) {
          var queueItem;
          return queueItem = _this.searchQueue(item);
        };
      })(this)).compact();
      queueItems.forEach((function(_this) {
        return function(item) {
          return _this._removeObserversFromItem(item);
        };
      })(this));
      queue.removeObjects(queueItems);
      return this;
    },

    /*
      Clears the queue array.
    
      @method emptyQueue
      @chainable
     */
    emptyQueue: function() {
      set(this, 'queue.length', 0);
      return this;
    },

    /*
      Finds the first queue proxy object with content that matches the
      given item.
    
      @method searchQueue
      @param Mixed the queued item to search for
      @return Object matching MQObject or undefined
     */
    searchQueue: function(item) {
      return get(this, 'queue').find(function(queueItem) {
        return get(queueItem, 'content') === item;
      });
    },

    /*
      If more items can be activated, this method finds the next object in the
      queue and sends it to the active state.
    
      @method activateNextItem
      @chainable
     */
    activateNextItem: Ember.observer(function() {
      var inProgressLength, nextInQueue, simultaneous;
      simultaneous = get(this, 'simultaneous');
      inProgressLength = get(this, 'inProgress.length');
      if (inProgressLength >= simultaneous || get(this, 'isPaused')) {
        return this;
      }
      nextInQueue = get(this, 'nextInQueue');
      if ((nextInQueue != null) && (nextInQueue.get('mqStateManager.currentState.name') === 'queued')) {
        nextInQueue.send('activate');
      }
      return this;
    }).observes('nextInQueue', 'isPaused', 'inProgress', 'inProgress.length'),

    /*
      Calls `didCompleteQueue` hook when the queue finishes processing.
    
      @method queueCompleted
      @return null
     */
    queueCompleted: Ember.observer(function() {
      if (!get(this, 'isComplete')) {
        return;
      }
      this.didCompleteQueue();
      return null;
    }).observes('isComplete'),

    /*
      Pause the queue.
    
      @method pauseQueue
      @chainable
     */
    pauseQueue: function() {
      this.set('isPaused', true);
      return this;
    },

    /*
      Unpause the queue.
    
      @method resumeQueue
      @chainable
     */
    resumeQueue: function() {
      this.set('isPaused', false);
      return this;
    },

    /*
      Move the given queue object into a `completed` state.
    
      If the queue is paused, this method will wait until the queue resumes
      before placing any objects into a `completed` state.
    
      @method markAsComplete
      @param Emberella.MQObject the object to mark complete
      @chainable
     */
    markAsComplete: function(item) {
      var isPaused, markAsCompleteFn;
      if (!get(item, 'isQueueableItem')) {
        Ember.warn("Item to mark as complete was not a queueable item.");
        return this;
      }
      isPaused = get(this, 'isPaused');
      markAsCompleteFn = function() {
        if (get(this, 'isPaused')) {
          return;
        }
        this.removeObserver('isPaused', this, markAsCompleteFn);
        if (!get(item, 'isQueueItemInProgress')) {
          Ember.warn("Item to mark as complete was not active or in progress.");
        }
        return item.send('finish');
      };
      if (isPaused) {
        this.addObserver('isPaused', this, markAsCompleteFn);
      } else {
        markAsCompleteFn.call(this);
      }
      return this;
    },

    /*
      Move the given queue object into an `error` state.
    
      @method markAsError
      @param Emberella.MQObject the object with the error
      @chainable
     */
    markAsError: function(item) {
      if (!get(item, 'isQueueableItem')) {
        Ember.warn("Item to put into error state was not a queueable item.");
        return this;
      }
      item.send('didError');
      return this;
    },

    /*
      Recover an object from an error state. The given object will return to a
      `queued` state and call the `willRetryQueueItem` hook to allow the object
      to be prepared for re-processing.
    
      @method retry
      @param Emberella.MQObject the object to retry
      @chainable
     */
    retry: function(item) {
      if (!get(item, 'isQueueableItem')) {
        Ember.warn("Item to retry was not a queueable item.");
        return this;
      }
      item.send('retry');
      return this;
    },

    /*
      Override this method to add custom preparations for an object when it is
      added to the queue.
    
      @method didAddQueueItem
      @param Emberella.MQObject the object added to the queue
     */
    didAddQueueItem: Ember.K,

    /*
      Override this method to inject custom object processing instructions.
    
      This method is where your magic happens. The default behavior is simply to
      mark the object complete after 100ms.
    
      @method didActivateQueueItem
      @param Emberella.MQObject the queued proxy with content to process
     */
    didActivateQueueItem: function(item) {
      var itemCompleteProperty;
      itemCompleteProperty = get(this, 'itemCompleteProperty');
      return Ember.run.later(item, function() {
        return item.set(itemCompleteProperty, true);
      }, 100);
    },

    /*
      Hook for objects moving from in progress to completed. Override with your
      own handler to finalize processing for the given object.
    
      @method didCompleteQueueItem
      @param Emberella.MQObject the completed object
     */
    didCompleteQueueItem: Ember.K,

    /*
      Override this method to inject custom handling for queued objects entering
      an error state.
    
      @method didQueueItemError
      @param Emberella.MQObject the object that encountered an error
     */
    didQueueItemError: Ember.K,

    /*
      Override this method to prepare a queued object for processing after the
      previous attempt failed.
    
      @method willRetryQueueItem
      @param Emberella.MQObject the object to retry
     */
    willRetryQueueItem: Ember.K,

    /*
      Hook for performing actions after queue processing is complete.
      Override this method to add custom behavior.
    
      @method didCompleteQueue
     */
    didCompleteQueue: Ember.K,

    /*
      @private
    
      Setup and teardown observing for `itemCompleteProperty` and
      `itemErrorProperty` as objects move into an `active` state.
    
      @method _didActivateQueueItem
      @param Emberella.MQObject the queued proxy with content to process
     */
    _didActivateQueueItem: function(item) {
      var itemCompleteProperty, itemErrorProperty;
      itemCompleteProperty = get(this, 'itemCompleteProperty');
      itemErrorProperty = get(this, 'itemErrorProperty');
      if (get(item, itemCompleteProperty)) {
        return Ember.run.next(this, function() {
          return this.markAsComplete(item);
        });
      } else if (get(item, itemErrorProperty)) {
        return this.markAsError(item);
      } else {
        item.addObserver(itemCompleteProperty, this, '_handleStatusChange');
        return item.addObserver(itemErrorProperty, this, '_handleStatusChange');
      }
    },

    /*
      @private
    
      Handle changes to completed/error properties on active queue objects.
    
      @method _handleStatusChange
      @param Emberella.MQObject the queued proxy with content to process
      @param String the property that changed
      @return Emberella.MQObject the target object
     */
    _handleStatusChange: function(item, property) {
      if (!get(item, property)) {
        return;
      }
      this._removeObserversFromItem(item);
      if (property === get(this, 'itemCompleteProperty')) {
        this.markAsComplete(item);
      } else if (property === get(this, 'itemErrorProperty')) {
        this.markAsError(item);
      }
      return item;
    },

    /*
      @private
    
      Remove property observers from the given queue object.
    
      @method _removeObserversFromItem
      @param Emberella.MQObject the queued proxy with content to process
      @return Emberella.MQObject the target object
     */
    _removeObserversFromItem: function(item) {
      var itemCompleteProperty, itemErrorProperty;
      itemCompleteProperty = get(this, 'itemCompleteProperty');
      itemErrorProperty = get(this, 'itemErrorProperty');
      item.removeObserver(itemCompleteProperty, this, '_handleStatusChange');
      item.removeObserver(itemCompleteProperty, this, '_handleStatusChange');
      return item;
    }
  });

}).call(this);