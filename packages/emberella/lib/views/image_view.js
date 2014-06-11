// Generated by CoffeeScript 1.7.1

/*
@module emberella
@submodule emberella-views
 */

(function() {
  var Emberella, get, jQuery, set;

  Emberella = window.Emberella;

  jQuery = Ember.$;

  get = Ember.get;

  set = Ember.set;


  /*
    `Emberella.ImageView` creates an `<img>` element with load event handling
    that can be used to notify a parent view when a new source image begins and
    completes loading.
  
    This view can be used with `Emberella.ListView` to address a bug that causes
    the image defined by the `src` attribute of previous content to appear for a
    few moments until an updated image loads.
  
    @class ImageView
    @namespace Emberella
    @extends Ember.View
   */

  Emberella.ImageView = Ember.View.extend({

    /*
      Add the class name `emberella-image`.
    
      @property classNames
      @type Array
      @default ['emberella-image']
     */
    classNames: ['emberella-image'],

    /*
      Adds a `loading` class to the image element if its src isn't loaded.
    
      @property classNameBindings
      @type Array
      @default [ 'loading' ]
     */
    classNameBindings: ['loading'],

    /*
      The type of element to create for this view.
    
      @property tagName
      @type String
      @default 'img'
     */
    tagName: 'img',

    /*
      A list of element attributes to keep in sync with properties of this
      view instance.
    
      @property attributeBindings
      @type Array
      @default ['style', 'alt', 'title', 'draggable', 'width', 'height']
     */
    attributeBindings: ['style', 'alt', 'title', 'draggable', 'width', 'height'],

    /*
      Tracks loading state of the image element. Should be true when an image
      is being fetched and false once the image finishes loading.
    
      @property loading
      @type Boolean
      @default false
     */
    loading: false,

    /*
      The src path (URL) of the image to display in this element.
    
      @property src
      @type String
      @default ''
     */
    src: '',

    /*
      Image load event handler reference.
    
      @property didImageLoad
      @type Function
     */
    didImageLoad: Ember.computed(function() {
      var didImageLoad, view;
      view = this;
      return didImageLoad = function(e) {
        var $img, current, loaded, _ref;
        $img = jQuery(this);
        $img.off('load.image-view', didImageLoad);
        if (get(view, 'isDestroyed')) {
          return;
        }
        current = (_ref = get(view, 'src')) != null ? _ref : '';
        loaded = $img.attr('src').substr(-current.length);
        if (loaded !== current) {
          return;
        }
        return set(view, 'loading', false);
      };
    }),

    /*
      Update the src attribute of the `<img>` element. Once the corresponding
      image loads, update the `loading` property.
    
      @method updateSrc
      @chainable
     */
    updateSrc: function() {
      var $img, didImageLoad, src;
      $img = this.$();
      src = get(this, 'src');
      didImageLoad = get(this, 'didImageLoad');
      $img.removeAttr('src');
      if (jQuery.trim(src) === '') {
        return this;
      }
      set(this, 'loading', true);
      $img.on('load.image-view', didImageLoad);
      $img.attr('src', src);
      if ($img.prop('complete')) {
        didImageLoad.call($img);
      }
      return this;
    },

    /*
      Respond to changes of the `src` property
    
      @method srcDidChange
      @chainable
     */
    srcDidChange: Ember.observer(function() {
      return this.updateSrc();
    }, 'src'),

    /*
      Trigger events in the parent view when the loading state changes. This
      allows styling a parent element differently while waiting for an image to
      finish loading.
    
      Triggers an `imageWillLoad` event on the parent when loading begins.
    
      Trigger an `imageDidLoad` event on the parent when loading completes.
    
      @method loadingDidChange
      @chainable
     */
    loadingDidChange: Ember.observer(function() {
      var evt;
      evt = get(this, 'loading') ? 'imageWillLoad' : 'imageDidLoad';
      get(this, 'parentView').trigger(evt);
      return this;
    }, 'loading'),

    /*
      Handle insertion into the DOM.
    
      @event didInsertElement
     */
    didInsertElement: function() {
      this._super();
      return this.updateSrc();
    },

    /*
      Handle imminent destruction.
    
      @event willDestroyElement
     */
    willDestroyElement: function() {
      var $img, didImageLoad;
      $img = this.$();
      didImageLoad = get(this, 'didImageLoad');
      $img.off('load.image-view', didImageLoad);
      return this._super();
    }
  });

}).call(this);
