/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/hyperapp/src/index.js":
/*!********************************************!*\
  !*** ./node_modules/hyperapp/src/index.js ***!
  \********************************************/
/*! exports provided: h, app */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "app", function() { return app; });
function h(name, attributes) {
  var rest = []
  var children = []
  var length = arguments.length

  while (length-- > 2) rest.push(arguments[length])

  while (rest.length) {
    var node = rest.pop()
    if (node && node.pop) {
      for (length = node.length; length--; ) {
        rest.push(node[length])
      }
    } else if (node != null && node !== true && node !== false) {
      children.push(node)
    }
  }

  return typeof name === "function"
    ? name(attributes || {}, children)
    : {
        nodeName: name,
        attributes: attributes || {},
        children: children,
        key: attributes && attributes.key
      }
}

function app(state, actions, view, container) {
  var map = [].map
  var rootElement = (container && container.children[0]) || null
  var oldNode = rootElement && recycleElement(rootElement)
  var lifecycle = []
  var skipRender
  var isRecycling = true
  var globalState = clone(state)
  var wiredActions = wireStateToActions([], globalState, clone(actions))

  scheduleRender()

  return wiredActions

  function recycleElement(element) {
    return {
      nodeName: element.nodeName.toLowerCase(),
      attributes: {},
      children: map.call(element.childNodes, function(element) {
        return element.nodeType === 3 // Node.TEXT_NODE
          ? element.nodeValue
          : recycleElement(element)
      })
    }
  }

  function resolveNode(node) {
    return typeof node === "function"
      ? resolveNode(node(globalState, wiredActions))
      : node != null
        ? node
        : ""
  }

  function render() {
    skipRender = !skipRender

    var node = resolveNode(view)

    if (container && !skipRender) {
      rootElement = patch(container, rootElement, oldNode, (oldNode = node))
    }

    isRecycling = false

    while (lifecycle.length) lifecycle.pop()()
  }

  function scheduleRender() {
    if (!skipRender) {
      skipRender = true
      setTimeout(render)
    }
  }

  function clone(target, source) {
    var out = {}

    for (var i in target) out[i] = target[i]
    for (var i in source) out[i] = source[i]

    return out
  }

  function setPartialState(path, value, source) {
    var target = {}
    if (path.length) {
      target[path[0]] =
        path.length > 1
          ? setPartialState(path.slice(1), value, source[path[0]])
          : value
      return clone(source, target)
    }
    return value
  }

  function getPartialState(path, source) {
    var i = 0
    while (i < path.length) {
      source = source[path[i++]]
    }
    return source
  }

  function wireStateToActions(path, state, actions) {
    for (var key in actions) {
      typeof actions[key] === "function"
        ? (function(key, action) {
            actions[key] = function(data) {
              var result = action(data)

              if (typeof result === "function") {
                result = result(getPartialState(path, globalState), actions)
              }

              if (
                result &&
                result !== (state = getPartialState(path, globalState)) &&
                !result.then // !isPromise
              ) {
                scheduleRender(
                  (globalState = setPartialState(
                    path,
                    clone(state, result),
                    globalState
                  ))
                )
              }

              return result
            }
          })(key, actions[key])
        : wireStateToActions(
            path.concat(key),
            (state[key] = clone(state[key])),
            (actions[key] = clone(actions[key]))
          )
    }

    return actions
  }

  function getKey(node) {
    return node ? node.key : null
  }

  function eventListener(event) {
    return event.currentTarget.events[event.type](event)
  }

  function updateAttribute(element, name, value, oldValue, isSvg) {
    if (name === "key") {
    } else if (name === "style") {
      if (typeof value === "string") {
        element.style.cssText = value
      } else {
        if (typeof oldValue === "string") oldValue = element.style.cssText = ""
        for (var i in clone(oldValue, value)) {
          var style = value == null || value[i] == null ? "" : value[i]
          if (i[0] === "-") {
            element.style.setProperty(i, style)
          } else {
            element.style[i] = style
          }
        }
      }
    } else {
      if (name[0] === "o" && name[1] === "n") {
        name = name.slice(2)

        if (element.events) {
          if (!oldValue) oldValue = element.events[name]
        } else {
          element.events = {}
        }

        element.events[name] = value

        if (value) {
          if (!oldValue) {
            element.addEventListener(name, eventListener)
          }
        } else {
          element.removeEventListener(name, eventListener)
        }
      } else if (
        name in element &&
        name !== "list" &&
        name !== "type" &&
        name !== "draggable" &&
        name !== "spellcheck" &&
        name !== "translate" &&
        !isSvg
      ) {
        element[name] = value == null ? "" : value
      } else if (value != null && value !== false) {
        element.setAttribute(name, value)
      }

      if (value == null || value === false) {
        element.removeAttribute(name)
      }
    }
  }

  function createElement(node, isSvg) {
    var element =
      typeof node === "string" || typeof node === "number"
        ? document.createTextNode(node)
        : (isSvg = isSvg || node.nodeName === "svg")
          ? document.createElementNS(
              "http://www.w3.org/2000/svg",
              node.nodeName
            )
          : document.createElement(node.nodeName)

    var attributes = node.attributes
    if (attributes) {
      if (attributes.oncreate) {
        lifecycle.push(function() {
          attributes.oncreate(element)
        })
      }

      for (var i = 0; i < node.children.length; i++) {
        element.appendChild(
          createElement(
            (node.children[i] = resolveNode(node.children[i])),
            isSvg
          )
        )
      }

      for (var name in attributes) {
        updateAttribute(element, name, attributes[name], null, isSvg)
      }
    }

    return element
  }

  function updateElement(element, oldAttributes, attributes, isSvg) {
    for (var name in clone(oldAttributes, attributes)) {
      if (
        attributes[name] !==
        (name === "value" || name === "checked"
          ? element[name]
          : oldAttributes[name])
      ) {
        updateAttribute(
          element,
          name,
          attributes[name],
          oldAttributes[name],
          isSvg
        )
      }
    }

    var cb = isRecycling ? attributes.oncreate : attributes.onupdate
    if (cb) {
      lifecycle.push(function() {
        cb(element, oldAttributes)
      })
    }
  }

  function removeChildren(element, node) {
    var attributes = node.attributes
    if (attributes) {
      for (var i = 0; i < node.children.length; i++) {
        removeChildren(element.childNodes[i], node.children[i])
      }

      if (attributes.ondestroy) {
        attributes.ondestroy(element)
      }
    }
    return element
  }

  function removeElement(parent, element, node) {
    function done() {
      parent.removeChild(removeChildren(element, node))
    }

    var cb = node.attributes && node.attributes.onremove
    if (cb) {
      cb(element, done)
    } else {
      done()
    }
  }

  function patch(parent, element, oldNode, node, isSvg) {
    if (node === oldNode) {
    } else if (oldNode == null || oldNode.nodeName !== node.nodeName) {
      var newElement = createElement(node, isSvg)
      parent.insertBefore(newElement, element)

      if (oldNode != null) {
        removeElement(parent, element, oldNode)
      }

      element = newElement
    } else if (oldNode.nodeName == null) {
      element.nodeValue = node
    } else {
      updateElement(
        element,
        oldNode.attributes,
        node.attributes,
        (isSvg = isSvg || node.nodeName === "svg")
      )

      var oldKeyed = {}
      var newKeyed = {}
      var oldElements = []
      var oldChildren = oldNode.children
      var children = node.children

      for (var i = 0; i < oldChildren.length; i++) {
        oldElements[i] = element.childNodes[i]

        var oldKey = getKey(oldChildren[i])
        if (oldKey != null) {
          oldKeyed[oldKey] = [oldElements[i], oldChildren[i]]
        }
      }

      var i = 0
      var k = 0

      while (k < children.length) {
        var oldKey = getKey(oldChildren[i])
        var newKey = getKey((children[k] = resolveNode(children[k])))

        if (newKeyed[oldKey]) {
          i++
          continue
        }

        if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
          if (oldKey == null) {
            removeElement(element, oldElements[i], oldChildren[i])
          }
          i++
          continue
        }

        if (newKey == null || isRecycling) {
          if (oldKey == null) {
            patch(element, oldElements[i], oldChildren[i], children[k], isSvg)
            k++
          }
          i++
        } else {
          var keyedNode = oldKeyed[newKey] || []

          if (oldKey === newKey) {
            patch(element, keyedNode[0], keyedNode[1], children[k], isSvg)
            i++
          } else if (keyedNode[0]) {
            patch(
              element,
              element.insertBefore(keyedNode[0], oldElements[i]),
              keyedNode[1],
              children[k],
              isSvg
            )
          } else {
            patch(element, oldElements[i], null, children[k], isSvg)
          }

          newKeyed[newKey] = children[k]
          k++
        }
      }

      while (i < oldChildren.length) {
        if (getKey(oldChildren[i]) == null) {
          removeElement(element, oldElements[i], oldChildren[i])
        }
        i++
      }

      for (var i in oldKeyed) {
        if (!newKeyed[i]) {
          removeElement(element, oldKeyed[i][0], oldKeyed[i][1])
        }
      }
    }
    return element
  }
}


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var hyperapp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hyperapp */ "./node_modules/hyperapp/src/index.js");
/* harmony import */ var _view_chart__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./view/chart */ "./src/view/chart.js");
/* harmony import */ var _view_chart__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_view_chart__WEBPACK_IMPORTED_MODULE_1__);


var state = {
  count: 0
};
var actions = {
  down: function down(value) {
    return function (state) {
      return {
        count: state.count - value
      };
    };
  },
  up: function up(value) {
    return function (state) {
      return {
        count: state.count + value
      };
    };
  }
};

var view = function view(state, actions) {
  return Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["h"])("div", null, Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["h"])("h1", null, state.count), Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["h"])("div", null, "set principle"), Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["h"])("div", null, "...add selectors"), Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["h"])("hr", null), Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["h"])("button", {
    onClick: function onClick() {}
  }, "start simulation"), Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["h"])(_view_chart__WEBPACK_IMPORTED_MODULE_1___default.a, null), Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["h"])("button", {
    onclick: function onclick() {
      return actions.down(1);
    }
  }, "-"), Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["h"])("button", {
    onclick: function onclick() {
      return actions.up(1);
    }
  }, "+"));
};

Object(hyperapp__WEBPACK_IMPORTED_MODULE_0__["app"])(state, actions, view, document.body);

/***/ }),

/***/ "./src/view/chart.js":
/*!***************************!*\
  !*** ./src/view/chart.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

throw new Error("Module build failed (from ./node_modules/babel-loader/lib/index.js):\nSyntaxError: F:\\similation\\plain\\src\\view\\chart.js: Unexpected token (5:2)\n\n\u001b[0m \u001b[90m 3 | \u001b[39m\u001b[36mconst\u001b[39m \u001b[33mMyChart\u001b[39m \u001b[33m=\u001b[39m ({data\u001b[33m=\u001b[39m[\u001b[35m0\u001b[39m\u001b[33m,\u001b[39m\u001b[35m0\u001b[39m\u001b[33m,\u001b[39m\u001b[35m0\u001b[39m\u001b[33m,\u001b[39m\u001b[35m0\u001b[39m\u001b[33m,\u001b[39m\u001b[35m0\u001b[39m\u001b[33m,\u001b[39m\u001b[35m0\u001b[39m]})\u001b[33m=>\u001b[39m{\u001b[0m\n\u001b[0m \u001b[90m 4 | \u001b[39m  \u001b[36mconst\u001b[39m chart\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 5 | \u001b[39m  \u001b[36mconst\u001b[39m onCreate \u001b[33m=\u001b[39m (element)\u001b[33m=>\u001b[39m{\u001b[0m\n\u001b[0m \u001b[90m   | \u001b[39m  \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 6 | \u001b[39m    \u001b[36mconst\u001b[39m context \u001b[33m=\u001b[39m element\u001b[33m.\u001b[39mgetContext(\u001b[32m'2d'\u001b[39m)\u001b[0m\n\u001b[0m \u001b[90m 7 | \u001b[39m    chart \u001b[33m=\u001b[39m \u001b[36mnew\u001b[39m \u001b[33mChart\u001b[39m(context\u001b[33m,\u001b[39m {\u001b[0m\n\u001b[0m \u001b[90m 8 | \u001b[39m      type\u001b[33m:\u001b[39m\u001b[32m'horizontalBar'\u001b[39m\u001b[33m,\u001b[39m\u001b[0m\n    at Object.raise (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:3851:17)\n    at Object.unexpected (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:5167:16)\n    at Object.parseVar (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7947:18)\n    at Object.parseVarStatement (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7762:10)\n    at Object.parseStatementContent (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7358:21)\n    at Object.parseStatement (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7291:17)\n    at Object.parseBlockOrModuleBlockBody (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7868:25)\n    at Object.parseBlockBody (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7855:10)\n    at Object.parseBlock (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7839:10)\n    at Object.parseFunctionBody (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:6909:24)\n    at Object.parseArrowExpression (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:6851:10)\n    at Object.parseParenAndDistinguishExpression (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:6489:12)\n    at Object.parseExprAtom (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:6260:21)\n    at Object.parseExprAtom (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:3570:20)\n    at Object.parseExprSubscripts (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:5914:23)\n    at Object.parseMaybeUnary (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:5894:21)\n    at Object.parseExprOps (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:5781:23)\n    at Object.parseMaybeConditional (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:5754:23)\n    at Object.parseMaybeAssign (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:5701:21)\n    at Object.parseVar (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7943:26)\n    at Object.parseVarStatement (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7762:10)\n    at Object.parseStatementContent (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7358:21)\n    at Object.parseStatement (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7291:17)\n    at Object.parseBlockOrModuleBlockBody (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7868:25)\n    at Object.parseBlockBody (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7855:10)\n    at Object.parseTopLevel (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:7220:10)\n    at Object.parse (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:8863:17)\n    at parse (F:\\similation\\plain\\node_modules\\@babel\\core\\node_modules\\@babel\\parser\\lib\\index.js:11135:38)\n    at parser (F:\\similation\\plain\\node_modules\\@babel\\core\\lib\\transformation\\normalize-file.js:170:34)\n    at normalizeFile (F:\\similation\\plain\\node_modules\\@babel\\core\\lib\\transformation\\normalize-file.js:138:11)\n    at runSync (F:\\similation\\plain\\node_modules\\@babel\\core\\lib\\transformation\\index.js:44:43)\n    at runAsync (F:\\similation\\plain\\node_modules\\@babel\\core\\lib\\transformation\\index.js:35:14)\n    at process.nextTick (F:\\similation\\plain\\node_modules\\@babel\\core\\lib\\transform.js:34:34)\n    at process._tickCallback (internal/process/next_tick.js:61:11)");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2h5cGVyYXBwL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsic3RhdGUiLCJjb3VudCIsImFjdGlvbnMiLCJkb3duIiwidmFsdWUiLCJ1cCIsInZpZXciLCJhcHAiLCJkb2N1bWVudCIsImJvZHkiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRkE7QUFBQTtBQUFBO0FBQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLFVBQVU7QUFDMUM7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBLG9DQUFvQztBQUNwQztBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQSxxQkFBcUIsMEJBQTBCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQiwwQkFBMEI7QUFDL0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHFCQUFxQix3QkFBd0I7QUFDN0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2xaQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFFQSxJQUFNQSxLQUFLLEdBQUc7QUFDWkMsT0FBSyxFQUFFO0FBREssQ0FBZDtBQUlBLElBQU1DLE9BQU8sR0FBRztBQUNkQyxNQUFJLEVBQUUsY0FBQUMsS0FBSztBQUFBLFdBQUksVUFBQUosS0FBSztBQUFBLGFBQUs7QUFBRUMsYUFBSyxFQUFFRCxLQUFLLENBQUNDLEtBQU4sR0FBY0c7QUFBdkIsT0FBTDtBQUFBLEtBQVQ7QUFBQSxHQURHO0FBRWRDLElBQUUsRUFBRSxZQUFBRCxLQUFLO0FBQUEsV0FBSSxVQUFBSixLQUFLO0FBQUEsYUFBSztBQUFFQyxhQUFLLEVBQUVELEtBQUssQ0FBQ0MsS0FBTixHQUFjRztBQUF2QixPQUFMO0FBQUEsS0FBVDtBQUFBO0FBRkssQ0FBaEI7O0FBS0EsSUFBTUUsSUFBSSxHQUFHLFNBQVBBLElBQU8sQ0FBQ04sS0FBRCxFQUFRRSxPQUFSO0FBQUEsU0FDWCxnRUFDRSwrREFBS0YsS0FBSyxDQUFDQyxLQUFYLENBREYsRUFFRSxnRkFGRixFQUdFLG1GQUhGLEVBSUUsOERBSkYsRUFLRTtBQUFRLFdBQU8sRUFBRSxtQkFBSSxDQUFFO0FBQXZCLHdCQUxGLEVBTUUsbURBQUMsa0RBQUQsT0FORixFQU9FO0FBQVEsV0FBTyxFQUFFO0FBQUEsYUFBTUMsT0FBTyxDQUFDQyxJQUFSLENBQWEsQ0FBYixDQUFOO0FBQUE7QUFBakIsU0FQRixFQVFFO0FBQVEsV0FBTyxFQUFFO0FBQUEsYUFBTUQsT0FBTyxDQUFDRyxFQUFSLENBQVcsQ0FBWCxDQUFOO0FBQUE7QUFBakIsU0FSRixDQURXO0FBQUEsQ0FBYjs7QUFhQUUsb0RBQUcsQ0FBQ1AsS0FBRCxFQUFRRSxPQUFSLEVBQWlCSSxJQUFqQixFQUF1QkUsUUFBUSxDQUFDQyxJQUFoQyxDQUFILEMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGgobmFtZSwgYXR0cmlidXRlcykge1xuICB2YXIgcmVzdCA9IFtdXG4gIHZhciBjaGlsZHJlbiA9IFtdXG4gIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXG5cbiAgd2hpbGUgKGxlbmd0aC0tID4gMikgcmVzdC5wdXNoKGFyZ3VtZW50c1tsZW5ndGhdKVxuXG4gIHdoaWxlIChyZXN0Lmxlbmd0aCkge1xuICAgIHZhciBub2RlID0gcmVzdC5wb3AoKVxuICAgIGlmIChub2RlICYmIG5vZGUucG9wKSB7XG4gICAgICBmb3IgKGxlbmd0aCA9IG5vZGUubGVuZ3RoOyBsZW5ndGgtLTsgKSB7XG4gICAgICAgIHJlc3QucHVzaChub2RlW2xlbmd0aF0pXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChub2RlICE9IG51bGwgJiYgbm9kZSAhPT0gdHJ1ZSAmJiBub2RlICE9PSBmYWxzZSkge1xuICAgICAgY2hpbGRyZW4ucHVzaChub2RlKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgPyBuYW1lKGF0dHJpYnV0ZXMgfHwge30sIGNoaWxkcmVuKVxuICAgIDoge1xuICAgICAgICBub2RlTmFtZTogbmFtZSxcbiAgICAgICAgYXR0cmlidXRlczogYXR0cmlidXRlcyB8fCB7fSxcbiAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICBrZXk6IGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5rZXlcbiAgICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcChzdGF0ZSwgYWN0aW9ucywgdmlldywgY29udGFpbmVyKSB7XG4gIHZhciBtYXAgPSBbXS5tYXBcbiAgdmFyIHJvb3RFbGVtZW50ID0gKGNvbnRhaW5lciAmJiBjb250YWluZXIuY2hpbGRyZW5bMF0pIHx8IG51bGxcbiAgdmFyIG9sZE5vZGUgPSByb290RWxlbWVudCAmJiByZWN5Y2xlRWxlbWVudChyb290RWxlbWVudClcbiAgdmFyIGxpZmVjeWNsZSA9IFtdXG4gIHZhciBza2lwUmVuZGVyXG4gIHZhciBpc1JlY3ljbGluZyA9IHRydWVcbiAgdmFyIGdsb2JhbFN0YXRlID0gY2xvbmUoc3RhdGUpXG4gIHZhciB3aXJlZEFjdGlvbnMgPSB3aXJlU3RhdGVUb0FjdGlvbnMoW10sIGdsb2JhbFN0YXRlLCBjbG9uZShhY3Rpb25zKSlcblxuICBzY2hlZHVsZVJlbmRlcigpXG5cbiAgcmV0dXJuIHdpcmVkQWN0aW9uc1xuXG4gIGZ1bmN0aW9uIHJlY3ljbGVFbGVtZW50KGVsZW1lbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbm9kZU5hbWU6IGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgIGF0dHJpYnV0ZXM6IHt9LFxuICAgICAgY2hpbGRyZW46IG1hcC5jYWxsKGVsZW1lbnQuY2hpbGROb2RlcywgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5ub2RlVHlwZSA9PT0gMyAvLyBOb2RlLlRFWFRfTk9ERVxuICAgICAgICAgID8gZWxlbWVudC5ub2RlVmFsdWVcbiAgICAgICAgICA6IHJlY3ljbGVFbGVtZW50KGVsZW1lbnQpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmVOb2RlKG5vZGUpIHtcbiAgICByZXR1cm4gdHlwZW9mIG5vZGUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyByZXNvbHZlTm9kZShub2RlKGdsb2JhbFN0YXRlLCB3aXJlZEFjdGlvbnMpKVxuICAgICAgOiBub2RlICE9IG51bGxcbiAgICAgICAgPyBub2RlXG4gICAgICAgIDogXCJcIlxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHNraXBSZW5kZXIgPSAhc2tpcFJlbmRlclxuXG4gICAgdmFyIG5vZGUgPSByZXNvbHZlTm9kZSh2aWV3KVxuXG4gICAgaWYgKGNvbnRhaW5lciAmJiAhc2tpcFJlbmRlcikge1xuICAgICAgcm9vdEVsZW1lbnQgPSBwYXRjaChjb250YWluZXIsIHJvb3RFbGVtZW50LCBvbGROb2RlLCAob2xkTm9kZSA9IG5vZGUpKVxuICAgIH1cblxuICAgIGlzUmVjeWNsaW5nID0gZmFsc2VcblxuICAgIHdoaWxlIChsaWZlY3ljbGUubGVuZ3RoKSBsaWZlY3ljbGUucG9wKCkoKVxuICB9XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGVSZW5kZXIoKSB7XG4gICAgaWYgKCFza2lwUmVuZGVyKSB7XG4gICAgICBza2lwUmVuZGVyID0gdHJ1ZVxuICAgICAgc2V0VGltZW91dChyZW5kZXIpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvbmUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICB2YXIgb3V0ID0ge31cblxuICAgIGZvciAodmFyIGkgaW4gdGFyZ2V0KSBvdXRbaV0gPSB0YXJnZXRbaV1cbiAgICBmb3IgKHZhciBpIGluIHNvdXJjZSkgb3V0W2ldID0gc291cmNlW2ldXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cblxuICBmdW5jdGlvbiBzZXRQYXJ0aWFsU3RhdGUocGF0aCwgdmFsdWUsIHNvdXJjZSkge1xuICAgIHZhciB0YXJnZXQgPSB7fVxuICAgIGlmIChwYXRoLmxlbmd0aCkge1xuICAgICAgdGFyZ2V0W3BhdGhbMF1dID1cbiAgICAgICAgcGF0aC5sZW5ndGggPiAxXG4gICAgICAgICAgPyBzZXRQYXJ0aWFsU3RhdGUocGF0aC5zbGljZSgxKSwgdmFsdWUsIHNvdXJjZVtwYXRoWzBdXSlcbiAgICAgICAgICA6IHZhbHVlXG4gICAgICByZXR1cm4gY2xvbmUoc291cmNlLCB0YXJnZXQpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGFydGlhbFN0YXRlKHBhdGgsIHNvdXJjZSkge1xuICAgIHZhciBpID0gMFxuICAgIHdoaWxlIChpIDwgcGF0aC5sZW5ndGgpIHtcbiAgICAgIHNvdXJjZSA9IHNvdXJjZVtwYXRoW2krK11dXG4gICAgfVxuICAgIHJldHVybiBzb3VyY2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHdpcmVTdGF0ZVRvQWN0aW9ucyhwYXRoLCBzdGF0ZSwgYWN0aW9ucykge1xuICAgIGZvciAodmFyIGtleSBpbiBhY3Rpb25zKSB7XG4gICAgICB0eXBlb2YgYWN0aW9uc1trZXldID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgPyAoZnVuY3Rpb24oa2V5LCBhY3Rpb24pIHtcbiAgICAgICAgICAgIGFjdGlvbnNba2V5XSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGFjdGlvbihkYXRhKVxuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQoZ2V0UGFydGlhbFN0YXRlKHBhdGgsIGdsb2JhbFN0YXRlKSwgYWN0aW9ucylcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICByZXN1bHQgJiZcbiAgICAgICAgICAgICAgICByZXN1bHQgIT09IChzdGF0ZSA9IGdldFBhcnRpYWxTdGF0ZShwYXRoLCBnbG9iYWxTdGF0ZSkpICYmXG4gICAgICAgICAgICAgICAgIXJlc3VsdC50aGVuIC8vICFpc1Byb21pc2VcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc2NoZWR1bGVSZW5kZXIoXG4gICAgICAgICAgICAgICAgICAoZ2xvYmFsU3RhdGUgPSBzZXRQYXJ0aWFsU3RhdGUoXG4gICAgICAgICAgICAgICAgICAgIHBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGNsb25lKHN0YXRlLCByZXN1bHQpLFxuICAgICAgICAgICAgICAgICAgICBnbG9iYWxTdGF0ZVxuICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkoa2V5LCBhY3Rpb25zW2tleV0pXG4gICAgICAgIDogd2lyZVN0YXRlVG9BY3Rpb25zKFxuICAgICAgICAgICAgcGF0aC5jb25jYXQoa2V5KSxcbiAgICAgICAgICAgIChzdGF0ZVtrZXldID0gY2xvbmUoc3RhdGVba2V5XSkpLFxuICAgICAgICAgICAgKGFjdGlvbnNba2V5XSA9IGNsb25lKGFjdGlvbnNba2V5XSkpXG4gICAgICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb25zXG4gIH1cblxuICBmdW5jdGlvbiBnZXRLZXkobm9kZSkge1xuICAgIHJldHVybiBub2RlID8gbm9kZS5rZXkgOiBudWxsXG4gIH1cblxuICBmdW5jdGlvbiBldmVudExpc3RlbmVyKGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50LmN1cnJlbnRUYXJnZXQuZXZlbnRzW2V2ZW50LnR5cGVdKGV2ZW50KVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQXR0cmlidXRlKGVsZW1lbnQsIG5hbWUsIHZhbHVlLCBvbGRWYWx1ZSwgaXNTdmcpIHtcbiAgICBpZiAobmFtZSA9PT0gXCJrZXlcIikge1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gXCJzdHlsZVwiKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IHZhbHVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIG9sZFZhbHVlID09PSBcInN0cmluZ1wiKSBvbGRWYWx1ZSA9IGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IFwiXCJcbiAgICAgICAgZm9yICh2YXIgaSBpbiBjbG9uZShvbGRWYWx1ZSwgdmFsdWUpKSB7XG4gICAgICAgICAgdmFyIHN0eWxlID0gdmFsdWUgPT0gbnVsbCB8fCB2YWx1ZVtpXSA9PSBudWxsID8gXCJcIiA6IHZhbHVlW2ldXG4gICAgICAgICAgaWYgKGlbMF0gPT09IFwiLVwiKSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KGksIHN0eWxlKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW2ldID0gc3R5bGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG5hbWVbMF0gPT09IFwib1wiICYmIG5hbWVbMV0gPT09IFwiblwiKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDIpXG5cbiAgICAgICAgaWYgKGVsZW1lbnQuZXZlbnRzKSB7XG4gICAgICAgICAgaWYgKCFvbGRWYWx1ZSkgb2xkVmFsdWUgPSBlbGVtZW50LmV2ZW50c1tuYW1lXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQuZXZlbnRzID0ge31cbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQuZXZlbnRzW25hbWVdID0gdmFsdWVcblxuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAoIW9sZFZhbHVlKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRMaXN0ZW5lcilcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGV2ZW50TGlzdGVuZXIpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIG5hbWUgaW4gZWxlbWVudCAmJlxuICAgICAgICBuYW1lICE9PSBcImxpc3RcIiAmJlxuICAgICAgICBuYW1lICE9PSBcInR5cGVcIiAmJlxuICAgICAgICBuYW1lICE9PSBcImRyYWdnYWJsZVwiICYmXG4gICAgICAgIG5hbWUgIT09IFwic3BlbGxjaGVja1wiICYmXG4gICAgICAgIG5hbWUgIT09IFwidHJhbnNsYXRlXCIgJiZcbiAgICAgICAgIWlzU3ZnXG4gICAgICApIHtcbiAgICAgICAgZWxlbWVudFtuYW1lXSA9IHZhbHVlID09IG51bGwgPyBcIlwiIDogdmFsdWVcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpXG4gICAgICB9XG5cbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQobm9kZSwgaXNTdmcpIHtcbiAgICB2YXIgZWxlbWVudCA9XG4gICAgICB0eXBlb2Ygbm9kZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2Ygbm9kZSA9PT0gXCJudW1iZXJcIlxuICAgICAgICA/IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG4gICAgICAgIDogKGlzU3ZnID0gaXNTdmcgfHwgbm9kZS5ub2RlTmFtZSA9PT0gXCJzdmdcIilcbiAgICAgICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcbiAgICAgICAgICAgICAgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICAgICAgICAgICAgICBub2RlLm5vZGVOYW1lXG4gICAgICAgICAgICApXG4gICAgICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGUubm9kZU5hbWUpXG5cbiAgICB2YXIgYXR0cmlidXRlcyA9IG5vZGUuYXR0cmlidXRlc1xuICAgIGlmIChhdHRyaWJ1dGVzKSB7XG4gICAgICBpZiAoYXR0cmlidXRlcy5vbmNyZWF0ZSkge1xuICAgICAgICBsaWZlY3ljbGUucHVzaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBhdHRyaWJ1dGVzLm9uY3JlYXRlKGVsZW1lbnQpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAobm9kZS5jaGlsZHJlbltpXSA9IHJlc29sdmVOb2RlKG5vZGUuY2hpbGRyZW5baV0pKSxcbiAgICAgICAgICAgIGlzU3ZnXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIG5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgICB1cGRhdGVBdHRyaWJ1dGUoZWxlbWVudCwgbmFtZSwgYXR0cmlidXRlc1tuYW1lXSwgbnVsbCwgaXNTdmcpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnQoZWxlbWVudCwgb2xkQXR0cmlidXRlcywgYXR0cmlidXRlcywgaXNTdmcpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIGNsb25lKG9sZEF0dHJpYnV0ZXMsIGF0dHJpYnV0ZXMpKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGF0dHJpYnV0ZXNbbmFtZV0gIT09XG4gICAgICAgIChuYW1lID09PSBcInZhbHVlXCIgfHwgbmFtZSA9PT0gXCJjaGVja2VkXCJcbiAgICAgICAgICA/IGVsZW1lbnRbbmFtZV1cbiAgICAgICAgICA6IG9sZEF0dHJpYnV0ZXNbbmFtZV0pXG4gICAgICApIHtcbiAgICAgICAgdXBkYXRlQXR0cmlidXRlKFxuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICBhdHRyaWJ1dGVzW25hbWVdLFxuICAgICAgICAgIG9sZEF0dHJpYnV0ZXNbbmFtZV0sXG4gICAgICAgICAgaXNTdmdcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjYiA9IGlzUmVjeWNsaW5nID8gYXR0cmlidXRlcy5vbmNyZWF0ZSA6IGF0dHJpYnV0ZXMub251cGRhdGVcbiAgICBpZiAoY2IpIHtcbiAgICAgIGxpZmVjeWNsZS5wdXNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBjYihlbGVtZW50LCBvbGRBdHRyaWJ1dGVzKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbihlbGVtZW50LCBub2RlKSB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBub2RlLmF0dHJpYnV0ZXNcbiAgICBpZiAoYXR0cmlidXRlcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlbW92ZUNoaWxkcmVuKGVsZW1lbnQuY2hpbGROb2Rlc1tpXSwgbm9kZS5jaGlsZHJlbltpXSlcbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHJpYnV0ZXMub25kZXN0cm95KSB7XG4gICAgICAgIGF0dHJpYnV0ZXMub25kZXN0cm95KGVsZW1lbnQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVFbGVtZW50KHBhcmVudCwgZWxlbWVudCwgbm9kZSkge1xuICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQocmVtb3ZlQ2hpbGRyZW4oZWxlbWVudCwgbm9kZSkpXG4gICAgfVxuXG4gICAgdmFyIGNiID0gbm9kZS5hdHRyaWJ1dGVzICYmIG5vZGUuYXR0cmlidXRlcy5vbnJlbW92ZVxuICAgIGlmIChjYikge1xuICAgICAgY2IoZWxlbWVudCwgZG9uZSlcbiAgICB9IGVsc2Uge1xuICAgICAgZG9uZSgpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGF0Y2gocGFyZW50LCBlbGVtZW50LCBvbGROb2RlLCBub2RlLCBpc1N2Zykge1xuICAgIGlmIChub2RlID09PSBvbGROb2RlKSB7XG4gICAgfSBlbHNlIGlmIChvbGROb2RlID09IG51bGwgfHwgb2xkTm9kZS5ub2RlTmFtZSAhPT0gbm9kZS5ub2RlTmFtZSkge1xuICAgICAgdmFyIG5ld0VsZW1lbnQgPSBjcmVhdGVFbGVtZW50KG5vZGUsIGlzU3ZnKVxuICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShuZXdFbGVtZW50LCBlbGVtZW50KVxuXG4gICAgICBpZiAob2xkTm9kZSAhPSBudWxsKSB7XG4gICAgICAgIHJlbW92ZUVsZW1lbnQocGFyZW50LCBlbGVtZW50LCBvbGROb2RlKVxuICAgICAgfVxuXG4gICAgICBlbGVtZW50ID0gbmV3RWxlbWVudFxuICAgIH0gZWxzZSBpZiAob2xkTm9kZS5ub2RlTmFtZSA9PSBudWxsKSB7XG4gICAgICBlbGVtZW50Lm5vZGVWYWx1ZSA9IG5vZGVcbiAgICB9IGVsc2Uge1xuICAgICAgdXBkYXRlRWxlbWVudChcbiAgICAgICAgZWxlbWVudCxcbiAgICAgICAgb2xkTm9kZS5hdHRyaWJ1dGVzLFxuICAgICAgICBub2RlLmF0dHJpYnV0ZXMsXG4gICAgICAgIChpc1N2ZyA9IGlzU3ZnIHx8IG5vZGUubm9kZU5hbWUgPT09IFwic3ZnXCIpXG4gICAgICApXG5cbiAgICAgIHZhciBvbGRLZXllZCA9IHt9XG4gICAgICB2YXIgbmV3S2V5ZWQgPSB7fVxuICAgICAgdmFyIG9sZEVsZW1lbnRzID0gW11cbiAgICAgIHZhciBvbGRDaGlsZHJlbiA9IG9sZE5vZGUuY2hpbGRyZW5cbiAgICAgIHZhciBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW5cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGRDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBvbGRFbGVtZW50c1tpXSA9IGVsZW1lbnQuY2hpbGROb2Rlc1tpXVxuXG4gICAgICAgIHZhciBvbGRLZXkgPSBnZXRLZXkob2xkQ2hpbGRyZW5baV0pXG4gICAgICAgIGlmIChvbGRLZXkgIT0gbnVsbCkge1xuICAgICAgICAgIG9sZEtleWVkW29sZEtleV0gPSBbb2xkRWxlbWVudHNbaV0sIG9sZENoaWxkcmVuW2ldXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBpID0gMFxuICAgICAgdmFyIGsgPSAwXG5cbiAgICAgIHdoaWxlIChrIDwgY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIHZhciBvbGRLZXkgPSBnZXRLZXkob2xkQ2hpbGRyZW5baV0pXG4gICAgICAgIHZhciBuZXdLZXkgPSBnZXRLZXkoKGNoaWxkcmVuW2tdID0gcmVzb2x2ZU5vZGUoY2hpbGRyZW5ba10pKSlcblxuICAgICAgICBpZiAobmV3S2V5ZWRbb2xkS2V5XSkge1xuICAgICAgICAgIGkrK1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3S2V5ICE9IG51bGwgJiYgbmV3S2V5ID09PSBnZXRLZXkob2xkQ2hpbGRyZW5baSArIDFdKSkge1xuICAgICAgICAgIGlmIChvbGRLZXkgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVtb3ZlRWxlbWVudChlbGVtZW50LCBvbGRFbGVtZW50c1tpXSwgb2xkQ2hpbGRyZW5baV0pXG4gICAgICAgICAgfVxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3S2V5ID09IG51bGwgfHwgaXNSZWN5Y2xpbmcpIHtcbiAgICAgICAgICBpZiAob2xkS2V5ID09IG51bGwpIHtcbiAgICAgICAgICAgIHBhdGNoKGVsZW1lbnQsIG9sZEVsZW1lbnRzW2ldLCBvbGRDaGlsZHJlbltpXSwgY2hpbGRyZW5ba10sIGlzU3ZnKVxuICAgICAgICAgICAgaysrXG4gICAgICAgICAgfVxuICAgICAgICAgIGkrK1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBrZXllZE5vZGUgPSBvbGRLZXllZFtuZXdLZXldIHx8IFtdXG5cbiAgICAgICAgICBpZiAob2xkS2V5ID09PSBuZXdLZXkpIHtcbiAgICAgICAgICAgIHBhdGNoKGVsZW1lbnQsIGtleWVkTm9kZVswXSwga2V5ZWROb2RlWzFdLCBjaGlsZHJlbltrXSwgaXNTdmcpXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleWVkTm9kZVswXSkge1xuICAgICAgICAgICAgcGF0Y2goXG4gICAgICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGtleWVkTm9kZVswXSwgb2xkRWxlbWVudHNbaV0pLFxuICAgICAgICAgICAgICBrZXllZE5vZGVbMV0sXG4gICAgICAgICAgICAgIGNoaWxkcmVuW2tdLFxuICAgICAgICAgICAgICBpc1N2Z1xuICAgICAgICAgICAgKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRjaChlbGVtZW50LCBvbGRFbGVtZW50c1tpXSwgbnVsbCwgY2hpbGRyZW5ba10sIGlzU3ZnKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld0tleWVkW25ld0tleV0gPSBjaGlsZHJlbltrXVxuICAgICAgICAgIGsrK1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChpIDwgb2xkQ2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIGlmIChnZXRLZXkob2xkQ2hpbGRyZW5baV0pID09IG51bGwpIHtcbiAgICAgICAgICByZW1vdmVFbGVtZW50KGVsZW1lbnQsIG9sZEVsZW1lbnRzW2ldLCBvbGRDaGlsZHJlbltpXSlcbiAgICAgICAgfVxuICAgICAgICBpKytcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSBpbiBvbGRLZXllZCkge1xuICAgICAgICBpZiAoIW5ld0tleWVkW2ldKSB7XG4gICAgICAgICAgcmVtb3ZlRWxlbWVudChlbGVtZW50LCBvbGRLZXllZFtpXVswXSwgb2xkS2V5ZWRbaV1bMV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxufVxuIiwiaW1wb3J0IHtoLGFwcH0gZnJvbSAnaHlwZXJhcHAnXG5pbXBvcnQgQ2hhcnQgZnJvbSAnLi92aWV3L2NoYXJ0J1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgY291bnQ6IDBcbn1cblxuY29uc3QgYWN0aW9ucyA9IHtcbiAgZG93bjogdmFsdWUgPT4gc3RhdGUgPT4gKHsgY291bnQ6IHN0YXRlLmNvdW50IC0gdmFsdWUgfSksXG4gIHVwOiB2YWx1ZSA9PiBzdGF0ZSA9PiAoeyBjb3VudDogc3RhdGUuY291bnQgKyB2YWx1ZSB9KVxufVxuXG5jb25zdCB2aWV3ID0gKHN0YXRlLCBhY3Rpb25zKSA9PiAoXG4gIDxkaXY+XG4gICAgPGgxPntzdGF0ZS5jb3VudH08L2gxPlxuICAgIDxkaXY+c2V0IHByaW5jaXBsZTwvZGl2PlxuICAgIDxkaXY+Li4uYWRkIHNlbGVjdG9yczwvZGl2PlxuICAgIDxociAvPlxuICAgIDxidXR0b24gb25DbGljaz17KCk9Pnt9fT5zdGFydCBzaW11bGF0aW9uPC9idXR0b24+XG4gICAgPENoYXJ0IC8+XG4gICAgPGJ1dHRvbiBvbmNsaWNrPXsoKSA9PiBhY3Rpb25zLmRvd24oMSl9Pi08L2J1dHRvbj5cbiAgICA8YnV0dG9uIG9uY2xpY2s9eygpID0+IGFjdGlvbnMudXAoMSl9Pis8L2J1dHRvbj5cbiAgPC9kaXY+XG4pXG5cbmFwcChzdGF0ZSwgYWN0aW9ucywgdmlldywgZG9jdW1lbnQuYm9keSkiXSwic291cmNlUm9vdCI6IiJ9