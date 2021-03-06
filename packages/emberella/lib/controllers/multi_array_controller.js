// Generated by CoffeeScript 1.7.1

/*
@module emberella
@submodule emberella-controllers
 */

(function() {
  var Emberella, get, set;

  Emberella = window.Emberella;

  get = Ember.get;

  set = Ember.set;


  /*
    Assembles an array of array controllers.
  
    @example
      // Sets `arrangedContent` to an array containing the array controllers
      // App.PeopleController, App.PlacesController, and App.ThingsController
      App.SidebarController = Emberella.MultiArrayController.extend({
        subArrays: ['people', 'places', 'things']
      });
  
    @class MultiArrayController
    @namespace Emberella
    @extends Ember.ArrayController
   */

  Emberella.MultiArrayController = Ember.ArrayController.extend({
    init: function() {
      this._subArraysDidChange();
      Ember.run.scheduleOnce('sync', this, function() {
        return this.notifyPropertyChange('subArrays');
      });
      return this._super();
    },

    /*
      An array of strings describing the names of array controllers to include
      as part of the `arrangedContent`. Sub-controllers will be arranged in the
      order listed.
    
      @property subArrays
      @type Array
      @default []
     */
    subArrays: [],
    arrangedContent: Ember.computed(function(key, value) {
      var selfContent, subArrays;
      subArrays = Ember.A(get(this, 'subArrays'));
      if (!get(this, 'allowDuplicates')) {
        subArrays = subArrays.uniq();
      }
      selfContent = this._super(key, value);
      return [].concat((Ember.isArray(selfContent) ? selfContent : []), subArrays.map((function(_this) {
        return function(name) {
          var controller, heading;
          controller = get(_this, 'controllers.' + name);
          heading = Ember.String.capitalize(name);
          return Ember.Object.create({
            heading: heading,
            children: controller
          });
        };
      })(this)));
    }).property('content', 'sortProperties.@each', 'needs.@each', 'subArrays.@each'),

    /*
      Assembles array of objects contained in this mixed array controller and all
      descendant arrays.
    
      @method getFlattenedContent
      @return Array
     */
    getFlattenedContent: function() {
      var arrangedContent, flatten;
      arrangedContent = get(this, 'arrangedContent');
      flatten = function(input, arr) {
        var item;
        if (arr == null) {
          arr = Ember.A();
        }
        item = get(input, 'children') || input;
        if (Ember.isArray(item)) {
          item.forEach(function(value) {
            return flatten(value, arr);
          });
        } else {
          arr.push(item);
        }
        return arr;
      };
      return flatten(arrangedContent);
    },

    /*
      @private
    
      Ensure sub-arrays are also added to the `needs` array so they can be
      accessed by this controller.
    
      @method _subArraysDidChange
      @chainable
     */
    _subArraysDidChange: Ember.observer(function() {
      get(this, 'needs').addObjects(Ember.A(get(this, 'subArrays')));
      return this;
    }, 'subArrays', 'subArrays.@each')
  });

}).call(this);
