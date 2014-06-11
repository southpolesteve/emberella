// Generated by CoffeeScript 1.7.1

/*
@module emberella
@submodule emberella-mixins
 */

(function() {
  var Emberella, get, jQuery, set;

  Emberella = window.Emberella;

  jQuery = window.jQuery;

  get = Ember.get;

  set = Ember.set;


  /*
    `Emberella.DraggableMixin` adds drag event handling to a view class.
  
    This mixin is rough around the edges and is not verified to work
    across browsers.
  
    @class DraggableMixin
    @namespace Emberella
   */

  Emberella.DraggableMixin = Ember.Mixin.create({

    /*
      @property isDraggable
      @type Boolean
      @default true
      @final
     */
    isDraggable: true,

    /*
      A list of element attributes to keep in sync with properties of this
      view instance.
    
      @property attributeBindings
      @type Array
      @default ['draggable']
     */
    attributeBindings: ['draggable'],

    /*
      Set draggable attribute value of host element.
    
      @property draggable
      @type String
      @default 'true'
     */
    draggable: 'true',

    /*
      The class name to apply to the element being dragged.
    
      @property draggingClass
      @type String
      @default 'dragging'
     */
    draggingClass: 'dragging',
    init: function() {
      if (!get(Emberella, '_draggableView')) {
        set(Emberella, '_draggableView', null);
      }
      return this._super();
    },

    /*
      Handle the start of a drag interaction. (DOM Event)
    
      @event dragStart
     */
    dragStart: function(e) {
      var $target;
      $target = jQuery(e.target);
      $target.addClass(get(this, 'draggingClass'));
      e.dataTransfer.setData('view', Ember.guidFor(this));
      set(Emberella, '_draggableView', this);
      return this.trigger('didDragStart', e);
    },

    /*
      Handle the end of a drag interaction. (DOM Event)
    
      @event dragEnd
     */
    dragEnd: function(e) {
      var $target, dragOverClass, dragOverSelector, draggingClass, draggingSelector;
      set(Emberella, '_draggableView', null);
      $target = jQuery(e.target);
      draggingClass = get(this, 'draggingClass');
      dragOverClass = get(this, 'dragOverClass');
      if ((draggingClass != null) && jQuery.trim(draggingClass) !== '') {
        draggingSelector = ['.', draggingClass].join('');
        jQuery(draggingSelector).removeClass(draggingClass);
      }
      if ((dragOverClass != null) && jQuery.trim(dragOverClass) !== '') {
        dragOverSelector = ['.', dragOverClass].join('');
        jQuery(dragOverSelector).removeClass(dragOverSelector);
      }
      return this.trigger('didDragEnd', e);
    },

    /*
      Handle the end of a drag interaction. Override with custom handling.
    
      @event didDragStart
     */
    didDragStart: Ember.K,

    /*
      Handle the end of a drag interaction. Override with custom handling.
    
      @event didDragEnd
     */
    didDragEnd: Ember.K
  });

}).call(this);
