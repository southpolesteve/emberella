// Generated by CoffeeScript 1.7.1
(function() {
  var Emberella;

  Emberella = window.Emberella;

  Emberella.throttle = function(func, wait) {
    var args, context, later, previous, result, timeout;
    context = null;
    args = null;
    timeout = null;
    result = null;
    previous = 0;
    later = function() {
      previous = new Date();
      timeout = null;
      return result = func.apply(context, args);
    };
    return function() {
      var now, remaining;
      now = new Date();
      remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  Emberella.debounce = function(func, wait, immediate) {
    var result, timeout;
    timeout = null;
    result = null;
    return function() {
      var args, callNow, context, later;
      context = this;
      args = arguments;
      later = function() {
        timeout = null;
        if (!immediate) {
          return result = func.apply(context, args);
        }
      };
      callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
      }
      return result;
    };
  };

}).call(this);
