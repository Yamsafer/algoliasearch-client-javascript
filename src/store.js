var debug = require('debug')('algoliasearch:src/hostIndexState.js');
var localStorageNamespace = 'algoliasearch-client-js';

var store;
var moduleStore = {
  state: {},
  set: function(key, data) {
    this.state[key] = data;
    return this.state[key];
  },
  get: function(key) {
    return this.state[key] || null;
  }
};

var localStorageStore = {
  set: function(key, data) {
    try {
      var namespace = JSON.parse(global.localStorage[localStorageNamespace]);
      namespace[key] = data;
      global.localStorage[localStorageNamespace] = JSON.stringify(namespace);
      return namespace[key];
    } catch (e) {
      debug('localStorage set failed with', e);
      cleanup();
      store = moduleStore;
      return store.set(key, data);
    }
  },
  get: function(key) {
    return JSON.parse(global.localStorage[localStorageNamespace])[key] || null;
  }
};

store = supportsLocalStorage() ? localStorageStore : moduleStore;

module.exports = {
  get: getOrSet,
  set: getOrSet
};

function getOrSet(key, data) {
  if (arguments.length === 1) {
    return store.get(key);
  }

  return store.set(key, data);
}

function supportsLocalStorage() {
  try {
    if ('localStorage' in global &&
      global.localStorage !== null &&
      !global.localStorage[localStorageNamespace]) {
      // actual creation of the namespace
      global.localStorage.setItem(localStorageNamespace, JSON.stringify({}));
      return true;
    }

    return false;
  } catch (_) {
    return false;
  }
}

// In case of any error on localStorage, we clean our own namespace, this should handle
// quota errors when a lot of keys + data are used
function cleanup() {
  try {
    global.localStorage.removeItem(localStorageNamespace);
  } catch (_) {
    // nothing to do
  }
}
