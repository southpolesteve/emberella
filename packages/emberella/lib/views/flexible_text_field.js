// Generated by CoffeeScript 1.7.1

/*
@module emberella
@submodule emberella-views
 */

(function() {
  var Emberella, SIZER_CLASS, SIZER_CONTAINER, SIZER_PROPERTY, get, set;

  Emberella = window.Emberella;

  get = Ember.get;

  set = Ember.set;

  SIZER_PROPERTY = '_sizing_element';

  SIZER_CLASS = 'flexible-text-field-sizer';

  SIZER_CONTAINER = '__flexibleInputContainer';


  /*
    `Emberella.FlexibleTextField` enhances Ember's standard TextField with the
    ability to expand horizontally as the value grows in length.
  
    @class FlexibleTextField
    @namespace Emberella
    @extends Ember.TextField
   */

  Emberella.FlexibleTextField = Ember.TextField.extend(Ember.StyleBindingsMixin, Emberella.FocusableMixin, {
    attributeBindings: ['autocomplete'],
    autocomplete: 'off',

    /*
      Defines an array of properties to transform into styles on the listing's
      DOM element.
    
      Functionality provided by `Ember.StyleBindingsMixin`.
    
      @property styleBindings
      @type Array
      @default ['width']
     */
    styleBindings: ['width', 'max-width'],

    /*
      Add the class name `emberella-flexible-text-field`.
    
      @property classNames
      @type Array
      @default ['emberella-flexible-text-field']
     */
    classNames: ['emberella-flexible-text-field'],

    /*
      If true, leading and trailing whitespace will be trimmed from the value of
      the text field each time it loses focus.
    
      @property trimWhitespace
      @type Boolean
      @default true
     */
    trimWhitespace: true,

    /*
      In pixels, the maximum width allowed for the text field regardless of the
      value's length.
    
      Set to 0 to allow the text field to grow as tall as needed to display
      its value.
    
      @property maxWidth
      @type Integer
      @default 0
     */
    maxWidth: 0,

    /*
      In pixels, the minimum width allowed for the text field regardless of the
      value's length.
    
      @property minWidth
      @type Integer
      @default 4
     */
    minWidth: 4,

    /*
      In pixels, the current width of the text field.
    
      Note: the initial value of `null` is critical for allowing the flexible
      text field to accurately calculate the width necessary to display
      its value.
    
      @property width
      @type Integer|Null
      @default null
     */
    width: Ember.computed.defaultTo('minWidth'),

    /*
      A max-width style of 100% to keep the text field from easily growing out
      of bounds.
    
      @property max-width
      @type String
      @default '100%'
     */
    'max-width': '100%',

    /*
      @private
    
      A reference to the sizing element used to calculate the width necessary
      to display the current value of the text field without truncation.
    
      @property _sizing_element
      @type jQuery
      @default null
     */
    _sizing_element: null,

    /*
      After the value changes, recalculate the width of the text field
    
      @method adjustWidth
     */
    adjustWidth: Ember.observer(function() {
      var sizer, value;
      sizer = this.updateSizer();
      value = get(this, 'value');
      return Ember.run.later(this, function() {
        var maxWidth, width;
        if (get(this, 'isDestroyed') || get(this, 'isDestroying')) {
          return;
        }
        width = value === '' ? 2 + sizer.outerWidth() : sizer.outerWidth();
        width = Math.max(width, get(this, 'minWidth'));
        if (value !== '') {
          width = width + 4;
        }
        maxWidth = +get(this, 'maxWidth');
        if (maxWidth && width > maxWidth) {
          width = maxWidth;
        }
        return set(this, 'width', width);
      }, 1);
    }, "value", "placeholder", "hasFocus"),

    /*
      Create an invisible element to "mirror" the text field. Uses a jQuery
      object to quickly duplicate the styling of the text field to better
      ensure width calculations compensate for borders, padding, margins,
      fonts, etc.
    
      @method createSizer
      @return jQuery A reference to the sizer node
     */
    createSizer: function() {
      var sizer, syncStyles;
      sizer = Ember.$('<div/>');
      sizer.addClass(SIZER_CLASS);
      syncStyles = function() {
        var element;
        element = get(this, 'element');
        if (!element) {
          return;
        }
        sizer.attr('style', getComputedStyle(element, "").cssText);
        sizer.css({
          position: 'absolute',
          zIndex: -1000,
          visibility: 'hidden',
          width: 'auto',
          whiteSpace: 'nowrap'
        });
        return sizer.appendTo(this._getSizerContainer());
      };
      Ember.run.schedule('afterRender', this, syncStyles);
      set(this, SIZER_PROPERTY, sizer);
      return sizer;
    },

    /*
      Update the size calculation node with the current value of the text field.
    
      Will create the sizer node if it hasn't already been created.
    
      @method updateSizer
      @return jQuery A reference to the sizer node
     */
    updateSizer: function() {
      var sizer, value, _ref, _ref1;
      value = (_ref = get(this, 'value')) != null ? _ref : '';
      if (value === '') {
        value = get(this, 'placeholder');
      }
      sizer = (_ref1 = get(this, SIZER_PROPERTY)) != null ? _ref1 : this.createSizer();
      value = sizer.text(value).html().replace(/\s/gm, "&nbsp;");
      sizer.html(value);
      return sizer;
    },

    /*
      Removes the sizer node from the DOM.
    
      @method removeSizer
      @return null
     */
    removeSizer: function() {
      var _ref;
      if ((_ref = get(this, SIZER_PROPERTY)) != null) {
        _ref.remove();
      }
      set(this, SIZER_PROPERTY, null);
      return null;
    },

    /*
      Adjust width after entry into the DOM.
    
      @event didInsertElement
     */
    didInsertElement: function() {
      this._super();
      return this.adjustWidth();
    },

    /*
      Handle imminent destruction.
    
      @event willDestroyElement
     */
    willDestroyElement: function() {
      this.removeSizer();
      return this._super();
    },

    /*
      Handle blur event.
    
      @event focusOut
     */
    focusOut: function() {
      set(this, 'hasFocus', false);
      if (get(this, 'trimWhitespace')) {
        return set(this, 'value', Ember.$.trim(get(this, 'value')));
      }
    },
    _getSizerContainer: function() {
      var $div;
      $div = Ember.$('#' + SIZER_CONTAINER);
      if ($div.length === 0) {
        $div = Ember.$('<div id=' + SIZER_CONTAINER + '></div>').appendTo(document.body);
      }
      return $div;
    }
  });

}).call(this);
