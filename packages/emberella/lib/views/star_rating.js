// Generated by CoffeeScript 1.7.1

/*
@module emberella
@submodule emberella-views
 */

(function() {
  var Emberella, get, set;

  Emberella = window.Emberella;

  get = Ember.get;

  set = Ember.set;


  /*
    `Emberella.StarRating` creates a star rating widget.
  
    Experimental.
  
    @class StarRating
    @namespace Emberella
   */

  Emberella.StarRating = Ember.View.extend({
    classNames: ['ember-star-rating'],
    classNameBindings: ['disabled'],
    defaultTemplate: Ember.Handlebars.compile(['<span class="star-rating" {{bind-attr style="view.outerStyle"}}>', '<span class="star-rating star-rating-value" {{bind-attr style="view.innerStyle"}}></span>', '</span>'].join(' ')),
    value: 0,
    maximum: 5,
    disabled: false,
    size: 14,
    outerStyle: (function() {
      var maximum, size, width;
      size = get(this, 'size');
      maximum = get(this, 'maximum');
      width = maximum * size;
      return ['height: ', size, 'px; width: ', width, 'px;'].join('');
    }).property('maximum', 'value'),
    innerStyle: (function() {
      var decimal, percent, size;
      size = get(this, 'size');
      decimal = get(this, 'value') / get(this, 'maximum');
      percent = decimal * 100;
      return ['width: ', percent, '%; background-position: 0 -', size, 'px;'].join('');
    }).property('maximum', 'value'),
    click: function(e) {
      var halfway, target, value, width;
      if (get(this, 'disabled')) {
        return;
      }
      target = e.target;
      if (target === get(this, 'element')) {
        width = this.$().width();
        halfway = width / 2;
        return set(this, 'value', e.offsetX < halfway ? 0 : get(this, 'maximum'));
      } else {
        width = this.$().children().width();
        value = Math.ceil(get(this, 'maximum') * e.offsetX / width);
        return set(this, 'value', value);
      }
    }
  });

}).call(this);
