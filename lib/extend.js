var skipKeys = ['INITIALIZERS', 'TEMPLATES'];

var extendParent = function(obj) {
  obj = obj || {};
  var self = Object.create(this);
  for (var key in obj) {
    self[key] = obj[key];
  }
  return self;
};

module.exports = function extend(_dest, src) {
  src = src || {};
  var dest = Object.create(src);
  var key;
  for (key in _dest) {
    if (!Object.hasOwnProperty(src, key)) {
      dest[key] = _dest[key];
    }
  }
  if (src.INITIALIZERS || _dest.INITIALIZERS) {
    var DEST_INITIALIZERS = dest.INITIALIZERS =
      Object.create(src.INITIALIZERS || {});
    var INITIALIZERS = _dest.INITIALIZERS;
    for (key in INITIALIZERS) {
      if (!Object.hasOwnProperty(src.INITIALIZERS, key)) {
        DEST_INITIALIZERS[key] = INITIALIZERS[key];
      }
    }
  }
  if (src.TEMPLATES || _dest.TEMPLATES) {
    var DEST_TEMPLATES = dest.TEMPLATES = Object.create(src.TEMPLATES || {});
    var TEMPLATES = _dest.TEMPLATES;
    for (key in TEMPLATES) {
      if (!Object.hasOwnProperty(src.TEMPLATES, key)) {
        DEST_TEMPLATES[key] = TEMPLATES[key];
      }
    }
  }
  if (src.ROUTING || _dest.ROUTING) {
    var SRC_ROUTING = src.ROUTING || [];
    SRC_ROUTING = Array.isArray(SRC_ROUTING) ? SRC_ROUTING : [SRC_ROUTING];
    var DEST_ROUTING = _dest.ROUTING || [];
    DEST_ROUTING = Array.isArray(DEST_ROUTING) ? DEST_ROUTING : [DEST_ROUTING];
    dest.ROUTING = SRC_ROUTING.concat(DEST_ROUTING);
  }

  if (!dest.extend) {
    Object.defineProperty(dest, 'extend', {
      enumerable: false,
      value: extendParent,
    });
  }

  return dest;
};
