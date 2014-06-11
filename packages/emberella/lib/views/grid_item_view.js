// Generated by CoffeeScript 1.7.1

/*
@module emberella
@submodule emberella-views
 */

(function() {
  var Emberella, GRID_ITEM_CLASS, get, set;

  Emberella = window.Emberella;

  get = Ember.get;

  set = Ember.set;

  GRID_ITEM_CLASS = 'emberella-grid-item-view';


  /*
    `Emberella.GridItemView` is an `Ember.View` designed for use as a child
    listing of `Emberella.GridView`.
  
    Extends `Emberella.ListItemView` and adds left and width position styling to
    support columns.
  
    @class GridItemView
    @namespace Emberella
    @extends Emberella.ListItemView
   */

  Emberella.GridItemView = Emberella.ListItemView.extend({

    /*
      Add the class name `emberella-grid-item-view`.
    
      @property classNames
      @type Array
      @default ['emberella-grid-item-view']
     */
    classNames: [GRID_ITEM_CLASS],

    /*
      Defines an array of properties to transform into styles on the listing's
      DOM element.
    
      Functionality provided by `Ember.StyleBindingsMixin`.
    
      @property styleBindings
      @type Array
      @default ['top', 'left', 'width', 'display', 'position']
     */
    styleBindings: ['top', 'left', 'width', 'display', 'position'],

    /*
      In pixels, the width of this listing. Typically, this value is provided
      by the `adjustedColumnWidth` property of the parent `Emberella.GridView`.
    
      @property columnWidth
      @type Integer
     */
    columnWidthBinding: 'parentView.adjustedColumnWidth',

    /*
      The number of columns to account for when calculating the position of
      this listing. This value is obtained from the `columns` property of the
      parent `Emberella.GridView`.
    
      @property columns
      @type Integer
     */
    columnsBinding: 'parentView.columns',

    /*
      Override with column count.
    
      @property fluctuateListing
      @type Integer
     */
    fluctuateListing: Ember.computed.defaultTo('columns'),

    /*
      The seed for the fluctuated class name.
    
      For example, setting this property to `item-listing` would result in class
      names like `item-listing-0` and `item-listing-1`.
    
      @property fluctuateListingPrefix
      @type String
      @default 'emberella-grid-item-view'
     */
    fluctuateListingPrefix: GRID_ITEM_CLASS,

    /*
      In pixels, the size of the margin to incorporate into this listing's
      positioning calculations. This value is obtained from the `margin` property
      of the parent `Emberella.GridView`.
    
      @property margin
      @type Integer
     */
    marginBinding: 'parentView.margin',

    /*
      In pixels, calculate the distance from the top this listing should be
      positioned within the scrolling list.
    
      Adjusts styling to account for the number of columns in the grid.
    
      @property top
      @type Integer
     */
    top: Ember.computed(function() {
      var columns;
      columns = get(this, 'columns');
      if (columns < 1) {
        columns = 1;
      }
      return Math.floor(get(this, 'contentIndex') / columns) * get(this, 'rowHeight');
    }).property('contentIndex', 'rowHeight', 'columns'),

    /*
      In pixels, calculate the distance from the left this listing should be
      positioned within the scrolling list.
    
      @property left
      @type Integer
     */
    left: Ember.computed(function() {
      var columns;
      columns = get(this, 'columns');
      if (columns < 1) {
        columns = 1;
      }
      return ((get(this, 'contentIndex') % columns) * get(this, 'columnWidth')) + get(this, 'margin');
    }).property('contentIndex', 'columns', 'columnWidth'),

    /*
      In pixels, the width of this listing.
    
      @property width
      @type Integer
     */
    width: Ember.computed(function() {
      return get(this, 'columnWidth') - get(this, 'margin');
    }).property('margin', 'columnWidth')
  });

}).call(this);
