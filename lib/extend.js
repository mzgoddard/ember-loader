var skipKeys = ['INITIALIZERS', 'TEMPLATES'];

module.exports = function extend(dest, src) {
  src = src || {};
  for (var key in src) {
    if (skipKeys.indexOf(key) !== -1) {
      continue;
    }
    dest[key] = src[key];
  }
  if (src.INITIALIZERS) {
    var DEST_INITIALIZERS = dest.INITIALIZERS = dest.INITIALIZERS || {};
    var INITIALIZERS = src.INITIALIZERS;
    for (var key in INITIALIZERS) {
      DEST_INITIALIZERS[key] = INITIALIZERS[key];
    }
  }
  if (src.TEMPLATES) {
    var DEST_TEMPLATES = dest.TEMPLATES = dest.TEMPLATES || {};
    var TEMPLATES = src.TEMPLATES;
    for (var key in TEMPLATES) {
      DEST_TEMPLATES[key] = TEMPLATES[key];
    }
  }
  return dest;
};
