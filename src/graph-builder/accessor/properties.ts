export function init(universal = function () {}) {
  Object.defineProperty(universal, 'length', {
    configurable: false,
    get() {
      return '';
    },
  });

  Object.defineProperty(universal, 'x', {
    configurable: false,
    get() {
      return '';
    },
  });

  Object.defineProperty(universal, 'y', {
    configurable: false,
    get() {
      return '';
    },
  });
}
