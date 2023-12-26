import { R as Renderer, V as Vector2, i as ignoreClone, r as resourceLoader, L as Loader, E as Entity, S as SpriteRenderer, T as TextureWrapMode, a as TextRenderer, F as Font, b as Logger, c as Engine, d as Layer, e as Script, A as AssetType, f as AssetPromise, g as EngineObject, h as Sprite } from "./index.js";
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _create_class(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties(Constructor, staticProps);
  return Constructor;
}
function _set_prototype_of(o, p) {
  _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _set_prototype_of(o, p);
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  if (superClass)
    _set_prototype_of(subClass, superClass);
}
function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 1e-3;
var SUBDIVISION_PRECISION = 1e-7;
var SUBDIVISION_MAX_ITERATIONS = 10;
var kSplineTableSize = 11;
var kSampleStepSize = 1 / (kSplineTableSize - 1);
var float32ArraySupported = typeof Float32Array === "function";
function A(aA1, aA2) {
  return 1 - 3 * aA2 + 3 * aA1;
}
function B(aA1, aA2) {
  return 3 * aA2 - 6 * aA1;
}
function C(aA1) {
  return 3 * aA1;
}
function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}
function getSlope(aT, aA1, aA2) {
  return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1);
}
function binarySubdivide(aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}
function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
  for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
    var currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0) {
      return aGuessT;
    }
    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
}
function LinearEasing(x) {
  return x;
}
var src = function bezier(mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error("bezier x values must be in [0, 1] range");
  }
  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  for (var i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }
  function getTForX(aX) {
    var intervalStart = 0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;
    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;
    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }
  return function BezierEasing(x) {
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};
var defaultCurveSegments = 200;
var beziers = {};
function getBezierEasing(a, b, c, d, nm) {
  var str = nm || ("bez_" + a + "_" + b + "_" + c + "_" + d).replace(/\./g, "p");
  var bezier2 = beziers[str];
  if (bezier2) {
    return bezier2;
  }
  bezier2 = src(a, b, c, d);
  beziers[str] = bezier2;
  return bezier2;
}
var storedData = {};
function buildBezierData(s, e, to, ti, segments) {
  var curveSegments = segments ? Math.min(segments, defaultCurveSegments) : defaultCurveSegments;
  var bezierName = (s[0] + "_" + s[1] + "_" + e[0] + "_" + e[1] + "_" + to[0] + "_" + to[1] + "_" + ti[0] + "_" + ti[1] + "_" + curveSegments).replace(/\./g, "p");
  if (!storedData[bezierName]) {
    var segmentLength = 0;
    var lastPoint;
    var points = [];
    for (var k = 0; k < curveSegments; k++) {
      var len = to.length;
      var point = new Array(len);
      var perc = k / (curveSegments - 1);
      var ptDistance = 0;
      for (var i = 0; i < len; i += 1) {
        var ptCoord = Math.pow(1 - perc, 3) * s[i] + 3 * Math.pow(1 - perc, 2) * perc * (s[i] + to[i]) + 3 * (1 - perc) * Math.pow(perc, 2) * (e[i] + ti[i]) + Math.pow(perc, 3) * e[i];
        point[i] = ptCoord;
        if (lastPoint) {
          ptDistance += Math.pow(point[i] - lastPoint[i], 2);
        }
      }
      ptDistance = Math.sqrt(ptDistance);
      segmentLength += ptDistance;
      points.push({
        partialLength: ptDistance,
        point
      });
      lastPoint = point;
    }
    storedData[bezierName] = {
      segmentLength,
      points
    };
  }
  return storedData[bezierName];
}
var bez = {
  buildBezierData,
  getBezierEasing
};
var Tools = {
  euclideanModulo: function euclideanModulo(n, m) {
    return (n % m + m) % m;
  },
  codomainBounce: function codomainBounce(n, min, max) {
    if (n < min)
      return 2 * min - n;
    if (n > max)
      return 2 * max - n;
    return n;
  },
  clamp: function clamp(x, a, b) {
    return x < a ? a : x > b ? b : x;
  }
};
var EX_REG = /(loopIn|loopOut)\(([^)]+)/;
var STR_REG = /["']\w+["']/;
var Cycle = /* @__PURE__ */ function() {
  function Cycle2(type, begin, end) {
    this.begin = begin;
    this.end = end;
    this.total = this.end - this.begin;
    this.type = type;
  }
  var _proto = Cycle2.prototype;
  _proto.update = function update(progress) {
    if (this.type === "in") {
      if (progress >= this.begin)
        return progress;
      return this.end - Tools.euclideanModulo(this.begin - progress, this.total);
    } else if (this.type === "out") {
      if (progress <= this.end)
        return progress;
      return this.begin + Tools.euclideanModulo(progress - this.end, this.total);
    }
  };
  return Cycle2;
}();
var Pingpong = /* @__PURE__ */ function() {
  function Pingpong2(type, begin, end) {
    this.begin = begin;
    this.end = end;
    this.total = this.end - this.begin;
    this.type = type;
  }
  var _proto = Pingpong2.prototype;
  _proto.update = function update(progress) {
    if (this.type === "in" && progress < this.begin || this.type === "out" && progress > this.end) {
      var space = progress - this.end;
      return this.pingpong(space);
    }
    return progress;
  };
  _proto.pingpong = function pingpong(space) {
    var dir = Math.floor(space / this.total) % 2;
    if (dir) {
      return this.begin + Tools.euclideanModulo(space, this.total);
    } else {
      return this.end - Tools.euclideanModulo(space, this.total);
    }
  };
  return Pingpong2;
}();
var FN_MAPS = {
  loopIn: function loopIn(datak, mode, offset) {
    var begin = datak[0].t;
    var last = datak.length - 1;
    var endIdx = Math.min(last, offset);
    var end = datak[endIdx].t;
    switch (mode) {
      case "cycle":
        return new Cycle("in", begin, end);
      case "pingpong":
        return new Pingpong("in", begin, end);
    }
    return null;
  },
  loopOut: function loopOut(datak, mode, offset) {
    var last = datak.length - 1;
    var beginIdx = Math.max(0, last - offset);
    var begin = datak[beginIdx].t;
    var end = datak[last].t;
    switch (mode) {
      case "cycle":
        return new Cycle("out", begin, end);
      case "pingpong":
        return new Pingpong("out", begin, end);
    }
    return null;
  }
};
function parseParams(pStr) {
  var params = pStr.split(/\s*,\s*/);
  return params.map(function(it) {
    if (STR_REG.test(it))
      return it.replace(/"|'/g, "");
    return parseInt(it);
  });
}
function parseEx(ex) {
  var rs = ex.match(EX_REG);
  var ps = parseParams(rs[2]);
  return {
    name: rs[1],
    mode: ps[0],
    offset: ps[1]
  };
}
function hasSupportExpression(ksp) {
  return ksp.x && EX_REG.test(ksp.x);
}
function getExpression(ksp) {
  var _parseEx = parseEx(ksp.x), name = _parseEx.name, mode = _parseEx.mode, _parseEx_offset = _parseEx.offset, offset = _parseEx_offset === void 0 ? 0 : _parseEx_offset;
  var _offset = offset === 0 ? ksp.k.length - 1 : offset;
  return FN_MAPS[name] && FN_MAPS[name](ksp.k, mode, _offset);
}
var Expression = {
  hasSupportExpression,
  getExpression
};
var BaseProperty = /* @__PURE__ */ function() {
  function BaseProperty2(data, mult) {
    this.mult = mult || 1;
    this.value = data.k;
    this.animated = data.a;
    if (Expression.hasSupportExpression(data)) {
      this.expression = Expression.getExpression(data);
    }
  }
  var _proto = BaseProperty2.prototype;
  _proto.getValue = function getValue(frameNum, i, keyData, nextKeyData) {
    var perc;
    var keyTime = keyData.t;
    var nextKeyTime = nextKeyData.t;
    var startValue = keyData.s[i];
    var endValue = (nextKeyData.s || keyData.e)[i];
    if (keyData.h === 1) {
      return startValue;
    }
    if (frameNum >= nextKeyTime) {
      perc = 1;
    } else if (frameNum < keyTime) {
      perc = 0;
    } else {
      var bezier2 = keyData.beziers[i];
      if (!bezier2) {
        if (typeof keyData.o.x === "number") {
          bezier2 = bez.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y);
        } else {
          bezier2 = bez.getBezierEasing(keyData.o.x[i], keyData.o.y[i], keyData.i.x[i], keyData.i.y[i]);
        }
        keyData.beziers[i] = bezier2;
      }
      perc = bezier2((frameNum - keyTime) / (nextKeyTime - keyTime));
    }
    return startValue + (endValue - startValue) * perc;
  };
  _proto.reset = function reset() {
  };
  return BaseProperty2;
}();
var ValueProperty = /* @__PURE__ */ function(BaseProperty2) {
  _inherits(ValueProperty2, BaseProperty2);
  function ValueProperty2(data, mult) {
    if (mult === void 0)
      mult = 1;
    var _this;
    _this = BaseProperty2.call(this, data, mult) || this;
    _this.v = mult ? _this.value * mult : _this.value;
    return _this;
  }
  var _proto = ValueProperty2.prototype;
  _proto.update = function update() {
    this.v = this.value * this.mult;
  };
  return ValueProperty2;
}(BaseProperty);
var MultiDimensionalProperty = /* @__PURE__ */ function(BaseProperty2) {
  _inherits(MultiDimensionalProperty2, BaseProperty2);
  function MultiDimensionalProperty2(data, mult) {
    if (mult === void 0)
      mult = 1;
    var _this;
    _this = BaseProperty2.call(this, data, mult) || this;
    var len = _this.value.length;
    _this.v = new Float32Array(len);
    _this.newValue = new Float32Array(len);
    for (var i = 0; i < len; i += 1) {
      _this.v[i] = _this.value[i] * _this.mult;
    }
    return _this;
  }
  var _proto = MultiDimensionalProperty2.prototype;
  _proto.update = function update() {
    var finalValue;
    finalValue = this.value;
    for (var i = 0, len = this.v.length; i < len; i++) {
      this.v[i] = finalValue[i] * this.mult;
    }
  };
  return MultiDimensionalProperty2;
}(BaseProperty);
var KeyframedValueProperty = /* @__PURE__ */ function(BaseProperty2) {
  _inherits(KeyframedValueProperty2, BaseProperty2);
  function KeyframedValueProperty2(data, mult) {
    if (mult === void 0)
      mult = 1;
    var _this;
    _this = BaseProperty2.call(this, data, mult) || this;
    _this._value = 0;
    _this.v = 0;
    if (Expression.hasSupportExpression(data)) {
      _this.expression = Expression.getExpression(data);
    }
    return _this;
  }
  var _proto = KeyframedValueProperty2.prototype;
  _proto.reset = function reset() {
    this._value = 0;
  };
  _proto.update = function update(frameNum) {
    if (this.expression) {
      frameNum = this.expression.update(frameNum);
    }
    var value = this.value;
    var keyData;
    var nextKeyData;
    for (var i = 0, l = value.length - 1; i < l; i++) {
      keyData = value[i];
      nextKeyData = value[i + 1];
      if (nextKeyData.t > frameNum) {
        break;
      }
    }
    if (!keyData.beziers) {
      keyData.beziers = [];
    }
    this.v = this.getValue(frameNum, 0, keyData, nextKeyData) * this.mult;
  };
  return KeyframedValueProperty2;
}(BaseProperty);
var KeyframedMultidimensionalProperty = /* @__PURE__ */ function(BaseProperty2) {
  _inherits(KeyframedMultidimensionalProperty2, BaseProperty2);
  function KeyframedMultidimensionalProperty2(data, mult, frames) {
    if (mult === void 0)
      mult = 1;
    var _this;
    _this = BaseProperty2.call(this, data, mult) || this;
    _this._lastPoint = 0;
    _this._addedLength = 0;
    var arrLen = _this.value[0].s.length;
    if (frames) {
      _this._frames = frames >> 0;
    }
    _this.newValue = new Float32Array(arrLen);
    _this.v = new Float32Array(arrLen);
    return _this;
  }
  var _proto = KeyframedMultidimensionalProperty2.prototype;
  _proto.update = function update(frameNum) {
    if (this.expression) {
      frameNum = this.expression.update(frameNum);
    }
    var value = this.value;
    var newValue = this.newValue;
    var keyData;
    var nextKeyData;
    for (var i = 0, l = value.length - 1; i < l; i++) {
      keyData = value[i];
      nextKeyData = value[i + 1];
      if (nextKeyData.t > frameNum) {
        this._lastPoint = 0;
        this._addedLength = 0;
        break;
      }
    }
    if (frameNum > nextKeyData.t) {
      for (var i1 = 0, len = this.v.length; i1 < len; i1++) {
        this.v[i1] = this.getValue(frameNum, i1, keyData, nextKeyData) * this.mult;
      }
      return;
    }
    if (keyData.to) {
      var nextKeyTime = nextKeyData.t;
      var keyTime = keyData.t;
      if (!keyData.bezierData) {
        keyData.bezierData = bez.buildBezierData(keyData.s, nextKeyData.s || keyData.e, keyData.to, keyData.ti, this._frames);
      }
      var _keyData_bezierData = keyData.bezierData, points = _keyData_bezierData.points, segmentLength = _keyData_bezierData.segmentLength;
      var bezier2 = keyData.timeBezier;
      if (!bezier2) {
        bezier2 = bez.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y, keyData.n);
        keyData.timeBezier = bezier2;
      }
      var t = 0;
      if (nextKeyTime >= 0) {
        t = (frameNum - keyTime) / (nextKeyTime - keyTime);
        t = Math.min(Math.max(0, t), 1);
      }
      var percent = bezier2(t);
      var distanceInLine = segmentLength * percent;
      var addedLength = this._addedLength;
      var lastPoint = this._lastPoint;
      for (var i2 = lastPoint, l1 = points.length; i2 < l1; i2++) {
        if (i2 === l1 - 1) {
          lastPoint = 0;
          addedLength = 0;
          break;
        }
        lastPoint = i2;
        var point = points[i2];
        var nextPoint = points[i2 + 1];
        var partialLength = nextPoint.partialLength;
        if (distanceInLine >= addedLength && distanceInLine < addedLength + partialLength) {
          var segmentPercent = (distanceInLine - addedLength) / partialLength;
          for (var k = 0, l2 = point.point.length; k < l2; k += 1) {
            newValue[k] = point.point[k] + (nextPoint.point[k] - point.point[k]) * segmentPercent;
          }
          break;
        }
        addedLength += partialLength;
      }
      this._lastPoint = lastPoint;
      this._addedLength = addedLength;
    } else {
      if (!keyData.beziers) {
        keyData.beziers = [];
      }
      for (var i3 = 0, len1 = keyData.s.length; i3 < len1; i3++) {
        newValue[i3] = this.getValue(frameNum, i3, keyData, nextKeyData);
      }
    }
    for (var i4 = 0, len2 = this.v.length; i4 < len2; i4++) {
      this.v[i4] = newValue[i4] * this.mult;
    }
  };
  return KeyframedMultidimensionalProperty2;
}(BaseProperty);
var TransformFrames = /* @__PURE__ */ function() {
  function TransformFrames2(data) {
    this.properties = [];
    this.autoOrient = false;
    var create = TransformFrames2.create;
    if (data.p.k) {
      this.p = create(data.p, 1);
      this.properties.push(this.p);
    } else {
      if (data.p.x) {
        this.x = create(data.p.x, 1);
        this.properties.push(this.x);
      }
      if (data.p.y) {
        this.y = create(data.p.y, 1);
        this.properties.push(this.y);
      }
      if (data.p.z) {
        this.z = create(data.p.z, 1);
        this.properties.push(this.z);
      }
    }
    this.a = create(data.a, 1);
    this.properties.push(this.a);
    this.s = create(data.s, 1, 0.01);
    this.properties.push(this.s);
    this.o = create(data.o, 0, 0.01);
    this.properties.push(this.o);
    if (data.r) {
      this.r = create(data.r, 0);
      this.properties.push(this.r);
    } else if (data.rx || data.ry || data.rz) {
      if (data.rx) {
        this.rx = create(data.rx, 0);
        this.properties.push(this.rx);
      }
      if (data.ry) {
        this.ry = create(data.ry, 0);
        this.properties.push(this.ry);
      }
      if (data.rz) {
        this.rz = create(data.rz, 0);
        this.properties.push(this.rz);
      }
    } else if (data.or) {
      this.or = create(data.or, 1);
      this.properties.push(this.or);
    }
    if (!this.properties.length) {
      this.update();
    }
  }
  var _proto = TransformFrames2.prototype;
  _proto.reset = function reset() {
    for (var i = 0, len = this.properties.length; i < len; i++) {
      this.properties[i].reset();
    }
  };
  _proto.update = function update(frameNum) {
    if (frameNum === void 0)
      frameNum = 0;
    var len = this.properties.length;
    for (var i = 0; i < len; i++) {
      this.properties[i].update(frameNum);
    }
    if (this.autoOrient)
      ;
  };
  TransformFrames2.create = function create(data, type, mult) {
    if (type === void 0)
      type = 0;
    if (mult === void 0)
      mult = 1;
    if (!data.k.length) {
      return new ValueProperty(data, mult);
    } else if (typeof data.k[0] === "number") {
      return new MultiDimensionalProperty(data, mult);
    } else {
      if (type) {
        return new KeyframedMultidimensionalProperty(data, mult, data.k[data.k.length - 1].t - data.k[0].t);
      } else {
        return new KeyframedValueProperty(data, mult);
      }
    }
  };
  return TransformFrames2;
}();
var BaseLottieElement = /* @__PURE__ */ function() {
  function BaseLottieElement2(layer) {
    this.stretch = 1;
    this.parent = null;
    this.visible = true;
    this.startTime = 0;
    this.treeIndex = [];
    this.childLayers = [];
    this.is3D = !!layer.ddd;
    this.name = layer.nm || "";
    this.index = layer.index;
    this.timeRemapping = layer.tm;
    this.width = layer.w;
    this.height = layer.h;
    this.inPoint = layer.ip;
    this.outPoint = layer.op;
    if (layer.st) {
      this.startTime = layer.st;
    }
    this.stretch = layer.stretch || 1;
    this.offsetTime = layer.offsetTime || 0;
    if (layer.ks) {
      this.transform = new TransformFrames(layer.ks);
    }
  }
  var _proto = BaseLottieElement2.prototype;
  _proto.reset = function reset() {
    if (this.transform) {
      this.transform.reset();
    }
    for (var i = 0; i < this.childLayers.length; i++) {
      this.childLayers[i].reset();
    }
  };
  _proto.update = function update(frameNum, isParentVisible) {
    if (frameNum === void 0)
      frameNum = 0;
    var frame = (frameNum - this.offsetTime) / this.stretch;
    if (isParentVisible === true) {
      this.visible = this.inPoint <= frame && this.outPoint >= frame;
    } else if (isParentVisible === false) {
      this.visible = false;
    }
    if (this.transform && this.visible) {
      this.transform.update(frame);
    }
    for (var i = 0; i < this.childLayers.length; i++) {
      this.childLayers[i].update(frameNum, this.visible);
    }
  };
  _proto.addChild = function addChild(node) {
    node.parent = this;
    node.entity.parent = this.entity;
    this.childLayers.push(node);
  };
  _proto.destroy = function destroy() {
    this.entity.parent = null;
    this.entity.destroy();
    this.entity = null;
    this.transform = null;
    this.parent = null;
  };
  return BaseLottieElement2;
}();
var CompLottieElement = /* @__PURE__ */ function(BaseLottieElement2) {
  _inherits(CompLottieElement2, BaseLottieElement2);
  function CompLottieElement2(layer, engine, entity, name) {
    var _this;
    _this = BaseLottieElement2.call(this, layer) || this;
    _this.layers = layer.layers;
    _this.comps = layer.comps;
    if (entity) {
      _this.entity = entity;
      if (name) {
        _this.entity.name = name;
      }
    } else {
      var compEntity = new Entity(engine, name);
      _this.entity = compEntity;
    }
    return _this;
  }
  var _proto = CompLottieElement2.prototype;
  _proto.destroy = function destroy() {
    BaseLottieElement2.prototype.destroy.call(this);
    this.layers = null;
    this.comps = null;
  };
  return CompLottieElement2;
}(BaseLottieElement);
var SpriteLottieElement = /* @__PURE__ */ function(BaseLottieElement2) {
  _inherits(SpriteLottieElement2, BaseLottieElement2);
  function SpriteLottieElement2(layer, atlas, entity, childEntity) {
    var _this;
    _this = BaseLottieElement2.call(this, layer) || this;
    var spriteRenderer;
    if (layer.refId) {
      if (childEntity) {
        _this.entity = childEntity;
        spriteRenderer = childEntity.getComponent(SpriteRenderer);
        _this.sprite = spriteRenderer.sprite;
      } else {
        _this.sprite = atlas.getSprite(layer.refId);
        var spriteEntity = new Entity(entity.engine, layer.nm);
        spriteRenderer = spriteEntity.addComponent(SpriteRenderer);
        spriteRenderer.sprite = _this.sprite;
        _this.entity = spriteEntity;
      }
      var _this_sprite = _this.sprite, atlasRegion = _this_sprite.atlasRegion, texture = _this_sprite.texture;
      texture.wrapModeU = texture.wrapModeV = TextureWrapMode.Clamp;
      _this.spriteRenderer = spriteRenderer;
      spriteRenderer.priority = (Number.MAX_SAFE_INTEGER - _this.index * 1e6) / Number.MAX_SAFE_INTEGER;
      _this.width = atlasRegion.width * texture.width;
      _this.height = atlasRegion.height * texture.height;
    }
    return _this;
  }
  var _proto = SpriteLottieElement2.prototype;
  _proto.destroy = function destroy() {
    var _this_sprite_texture, _this_sprite;
    BaseLottieElement2.prototype.destroy.call(this);
    (_this_sprite = this.sprite) == null ? void 0 : (_this_sprite_texture = _this_sprite.texture) == null ? void 0 : _this_sprite_texture.destroy();
    this.sprite = null;
    this.spriteRenderer = null;
  };
  return SpriteLottieElement2;
}(BaseLottieElement);
var TextLottieElement = /* @__PURE__ */ function(BaseLottieElement2) {
  _inherits(TextLottieElement2, BaseLottieElement2);
  function TextLottieElement2(layer, engine, entity, name) {
    var _this;
    var _layer_t_d, _layer_t, _layer;
    _this = BaseLottieElement2.call(this, layer) || this;
    if (entity) {
      _this.entity = entity;
      if (name) {
        _this.entity.name = name;
      }
    } else {
      _this.entity = new Entity(engine, layer.nm);
    }
    var textRenderer = _this.entity.addComponent(TextRenderer);
    var keyframes = (_layer = layer) == null ? void 0 : (_layer_t = _layer.t) == null ? void 0 : (_layer_t_d = _layer_t.d) == null ? void 0 : _layer_t_d.k;
    if (keyframes.length === 1) {
      var _keyframes_, _keyframes;
      var firstKeyframeStart = (_keyframes = keyframes) == null ? void 0 : (_keyframes_ = _keyframes[0]) == null ? void 0 : _keyframes_.s;
      if (firstKeyframeStart) {
        var text = firstKeyframeStart.t, font = firstKeyframeStart.f, fontSize = firstKeyframeStart.s, fontColor = firstKeyframeStart.fc, lineHeight = firstKeyframeStart.lh;
        textRenderer.font = Font.createFromOS(engine, font);
        textRenderer.text = text;
        textRenderer.fontSize = fontSize;
        textRenderer.color.set(fontColor[0], fontColor[1], fontColor[2], 1);
        textRenderer.lineSpacing = lineHeight;
      } else {
        Logger.warn("TextLottieElement: " + name + ", No corresponding text data found.");
      }
    } else {
      Logger.warn("TextLottieElement: multi keyframes feature is not supported in this version.");
    }
    textRenderer.priority = (Number.MAX_SAFE_INTEGER - _this.index * 1e6) / Number.MAX_SAFE_INTEGER;
    return _this;
  }
  return TextLottieElement2;
}(BaseLottieElement);
var LottieAnimation = /* @__PURE__ */ function(Script2) {
  _inherits(LottieAnimation2, Script2);
  function LottieAnimation2() {
    var _this;
    _this = Script2.apply(this, arguments) || this;
    _this.repeats = 0;
    _this.isLooping = false;
    _this.isAlternate = false;
    _this.direction = 1;
    _this.speed = 1;
    _this.pixelsPerUnit = Engine._pixelsPerUnit;
    _this._alpha = 1;
    _this._priority = 0;
    _this._priorityDirty = true;
    _this._layer = Layer.Layer0;
    _this._layerDirty = true;
    _this._autoPlay = false;
    _this._clipEndCallbacks = {};
    _this._isPlaying = false;
    _this._curFrame = 0;
    _this._frame = 0;
    _this._root = null;
    return _this;
  }
  var _proto = LottieAnimation2.prototype;
  _proto.play = function play(name) {
    var _this = this;
    if (name) {
      var clip = this.resource.clips[name];
      this._clip = clip;
    } else {
      this._clip = null;
    }
    this._isPlaying = true;
    this._frame = this._curFrame;
    return new Promise(function(resolve) {
      if (name) {
        _this._clipEndCallbacks[name] = resolve;
      } else {
        _this._clipEndCallbacks["ALL"] = resolve;
      }
    });
  };
  _proto.pause = function pause() {
    this._isPlaying = false;
    this._curFrame = this._frame;
  };
  _proto.stop = function stop() {
    this._isPlaying = false;
    this._curFrame = 0;
    this._frame = 0;
  };
  _proto._setLayer = function _setLayer(layer, entity) {
    if (!entity) {
      entity = this.entity;
    }
    entity.layer = layer;
    var children = entity.children;
    for (var i = children.length - 1; i >= 0; i--) {
      var child = children[i];
      child.layer = layer;
      this._setLayer(layer, child);
    }
  };
  _proto._createLayerElements = function _createLayerElements(layers, elements, parent, isCloned) {
    if (!layers)
      return;
    for (var i = 0, l = layers.length; i < l; i++) {
      var layer = layers[i];
      var element = null;
      if (layer.td !== void 0)
        continue;
      var treeIndex = parent.treeIndex.concat(i);
      var childEntity = isCloned && this._findEntityInTree(treeIndex);
      switch (layer.ty) {
        case 0:
          element = new CompLottieElement(layer, this.engine, childEntity, layer.id);
          break;
        case 2:
          element = new SpriteLottieElement(layer, this._resource.atlas, this.entity, childEntity);
          break;
        case 3:
          var _layer_ks_o, _layer_ks, _layer;
          if (((_layer = layer) == null ? void 0 : (_layer_ks = _layer.ks) == null ? void 0 : (_layer_ks_o = _layer_ks.o) == null ? void 0 : _layer_ks_o.k) === 0) {
            layer.ks.o.k = 100;
          }
          element = new CompLottieElement(layer, this.engine, childEntity, layer.id);
          break;
        case 5:
          element = new TextLottieElement(layer, this.engine, childEntity, layer.id);
          break;
      }
      if (element) {
        element.treeIndex = treeIndex;
        elements.push(element);
        parent.addChild(element);
        if (layer.layers) {
          this._createLayerElements(layer.layers, elements, element, isCloned);
        }
      }
    }
  };
  _proto._findEntityInTree = function _findEntityInTree(treeIndex) {
    var childEntity;
    for (var i = 0, l = treeIndex.length; i < l; i++) {
      var index = treeIndex[i];
      if (childEntity) {
        childEntity = childEntity.children[index];
      } else {
        childEntity = this.entity.children[index];
      }
    }
    return childEntity;
  };
  _proto._createElements = function _createElements(value, isCloned) {
    var root = new CompLottieElement(value, this.engine, this.entity);
    this._root = root;
    var layers = root.layers;
    var elements = [];
    this._createLayerElements(layers, elements, root, isCloned);
    this._elements = elements;
  };
  _proto._updateElements = function _updateElements(correctedFrame) {
    this._root.update(correctedFrame);
    var elements = this._elements;
    for (var i = 0, l = elements.length; i < l; i++) {
      var layer = elements[i];
      this._updateElement(layer);
    }
  };
  _proto._updateElement = function _updateElement(layer) {
    var _parent_transform, _parent, _parent_transform1, _parent1;
    var transform = layer.transform, entity = layer.entity, sprite = layer.sprite, spriteRenderer = layer.spriteRenderer, parent = layer.parent, width = layer.width, height = layer.height;
    var entityTransform = entity.transform;
    var a = transform.a.v;
    var s = transform.s.v;
    var o = transform.o.v;
    var pixelsPerUnit = this.pixelsPerUnit;
    var x = 0, y = 0, z = 0;
    if (transform.p) {
      var p = transform.p.v;
      x = p[0];
      y = p[1];
      z = p[2];
    } else {
      if (transform.x) {
        x = transform.x.v;
      }
      if (transform.y) {
        y = transform.y.v;
      }
      if (transform.z) {
        z = transform.z.v;
      }
    }
    var rx = 0;
    var ry = 0;
    var rz = 0;
    if (!layer.visible) {
      entity.isActive = layer.visible;
      return;
    }
    if (transform.r) {
      rz = transform.r.v;
    } else if (transform.rx || transform.ry || transform.rz) {
      rx = transform.rx ? transform.rx.v : 0;
      ry = transform.ry ? transform.ry.v : 0;
      rz = transform.rz ? transform.rz.v : 0;
    } else if (transform.or) {
      var v = transform.or.v;
      rx = v[0];
      ry = v[1];
      rz = v[2];
    }
    if ((_parent = parent) == null ? void 0 : (_parent_transform = _parent.transform) == null ? void 0 : _parent_transform.o) {
      var _parent2;
      o *= (_parent2 = parent) == null ? void 0 : _parent2.transform.o.v;
    }
    if (sprite) {
      var _spriteRenderer_color = spriteRenderer.color, r = _spriteRenderer_color.r, g = _spriteRenderer_color.g, b = _spriteRenderer_color.b;
      spriteRenderer.color.set(r, g, b, o * this._alpha);
      sprite.pixelsPerUnit = pixelsPerUnit;
      sprite.pivot = LottieAnimation2._pivotVector.set(a[0] / width, (height - a[1]) / height);
    }
    entity.isActive = layer.visible;
    entityTransform.setScale(s[0], s[1], s[2]);
    entityTransform.setRotation(rx, ry, -rz);
    if ((_parent1 = parent) == null ? void 0 : (_parent_transform1 = _parent1.transform) == null ? void 0 : _parent_transform1.a) {
      entityTransform.setPosition((x - parent.transform.a.v[0]) / pixelsPerUnit, (-y + parent.transform.a.v[1]) / pixelsPerUnit, z / pixelsPerUnit);
    } else {
      entityTransform.setPosition((x - this._width / 2) / pixelsPerUnit, (-y + this._height / 2) / pixelsPerUnit, z / pixelsPerUnit);
    }
  };
  _proto._resetElements = function _resetElements() {
    var elements = this._elements;
    for (var i = 0, l = elements.length; i < l; i++) {
      elements[i].reset();
    }
  };
  _proto.onUpdate = function onUpdate(deltaTime) {
    if (!this._isPlaying || !this._resource) {
      return null;
    }
    if (this._priorityDirty) {
      this._priorityDirty = false;
      var renderers = LottieAnimation2._tempRenderers;
      renderers.length = 0;
      this.entity.getComponentsIncludeChildren(Renderer, renderers);
      var priorityDiff = 0;
      for (var i = 0, l = renderers.length; i < l; ++i) {
        var renderer = renderers[i];
        if (i === 0) {
          priorityDiff = this._priority - Math.floor(renderer.priority);
        }
        renderer.priority = renderer.priority + priorityDiff;
      }
    }
    if (this._layerDirty) {
      this._layerDirty = false;
      this._setLayer(this.layer, this.entity);
    }
    var time = this.direction * this.speed * deltaTime * 1e3;
    this._frame += time / this._resource.timePerFrame;
    var clip = this._clip;
    if (this._spill()) {
      var duration = this._resource.duration;
      this._resetElements();
      if (this.repeats > 0 || this.isLooping) {
        if (this.repeats > 0) {
          --this.repeats;
        }
        if (this.isAlternate) {
          this.direction *= -1;
          if (clip) {
            this._frame = Tools.codomainBounce(this._frame, 0, clip.end - clip.start);
          } else {
            this._frame = Tools.codomainBounce(this._frame, 0, duration);
          }
        } else {
          this.direction = 1;
          if (clip) {
            this._frame = Tools.euclideanModulo(this._frame, clip.end - clip.start);
          } else {
            this._frame = Tools.euclideanModulo(this._frame, duration);
          }
        }
      } else {
        if (clip) {
          if (this._frame >= clip.end - clip.start) {
            var endCallback = this._clipEndCallbacks[clip.name];
            if (endCallback) {
              endCallback(clip);
            }
          }
          this._frame = Tools.clamp(this._frame, 0, clip.end - clip.start);
        } else {
          if (this._frame >= duration) {
            var endCallback1 = this._clipEndCallbacks["ALL"];
            if (endCallback1) {
              endCallback1();
            }
          }
          this._frame = Tools.clamp(this._frame, 0, duration);
        }
      }
    }
    if (clip) {
      this._updateElements(this._resource.inPoint + this._frame + clip.start);
    } else {
      this._updateElements(this._resource.inPoint + this._frame);
    }
  };
  _proto._spill = function _spill() {
    var duration;
    if (this._clip) {
      var clip = this._clip;
      duration = clip.end - clip.start;
    } else {
      duration = this._resource.duration;
    }
    var bottomSpill = this._frame <= 0 && this.direction === -1;
    var topSpill = this._frame >= duration && this.direction === 1;
    return bottomSpill || topSpill;
  };
  _proto._cloneTo = function _cloneTo(target) {
    target._createElements(this._resource, true);
  };
  _proto._destroy = function _destroy() {
    var elements = this._elements;
    if (elements) {
      for (var i = 0, l = elements.length; i < l; i++) {
        elements[i].destroy();
      }
    }
  };
  _proto.onDestroy = function onDestroy() {
    this._destroy();
  };
  _create_class(LottieAnimation2, [
    {
      key: "resource",
      get: function get() {
        return this._resource;
      },
      set: function set(value) {
        if (this._resource) {
          this.pause();
          this._destroy();
        }
        this._resource = value;
        if (value) {
          this._width = value.width;
          this._height = value.height;
          this._createElements(value);
          this._priorityDirty = true;
          this._layerDirty = true;
        }
        this._curFrame = 0;
        this.play();
        this.onUpdate(0);
        if (!this.autoPlay) {
          this.pause();
        }
      }
    },
    {
      key: "priority",
      get: function get() {
        return this._priority;
      },
      set: function set(value) {
        if (this._priority !== value) {
          this._priority = value;
          this._priorityDirty = true;
        }
      }
    },
    {
      key: "layer",
      get: function get() {
        return this._layer;
      },
      set: function set(value) {
        if (this._layer !== value) {
          this._layer = value;
          this._layerDirty = true;
        }
      }
    },
    {
      key: "alpha",
      get: function get() {
        return this._alpha;
      },
      set: function set(value) {
        if (this._alpha !== value) {
          this._alpha = value;
          if (!this.isPlaying) {
            this.play();
            this.onUpdate(0);
            this.pause();
          }
        }
      }
    },
    {
      key: "autoPlay",
      get: function get() {
        return this._autoPlay;
      },
      set: function set(value) {
        this._autoPlay = value;
        if (value) {
          this.play();
        }
      }
    },
    {
      key: "frame",
      get: function get() {
        return this._frame;
      }
    },
    {
      key: "isPlaying",
      get: function get() {
        return this._isPlaying;
      }
    }
  ]);
  return LottieAnimation2;
}(Script);
(function() {
  LottieAnimation._pivotVector = new Vector2();
})();
(function() {
  LottieAnimation._tempRenderers = [];
})();
__decorate([
  ignoreClone
], LottieAnimation.prototype, "_clipEndCallbacks", void 0);
__decorate([
  ignoreClone
], LottieAnimation.prototype, "_isPlaying", void 0);
__decorate([
  ignoreClone
], LottieAnimation.prototype, "_curFrame", void 0);
__decorate([
  ignoreClone
], LottieAnimation.prototype, "_frame", void 0);
__decorate([
  ignoreClone
], LottieAnimation.prototype, "_root", void 0);
__decorate([
  ignoreClone
], LottieAnimation.prototype, "_elements", void 0);
function _assert_this_initialized(self) {
  if (self === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return self;
}
function _extends() {
  _extends = Object.assign || function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source)
        if (Object.prototype.hasOwnProperty.call(source, key))
          target[key] = source[key];
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _type_of(obj) {
  "@swc/helpers - typeof";
  return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var LottieResource = /* @__PURE__ */ function(EngineObject2) {
  _inherits(LottieResource2, EngineObject2);
  function LottieResource2(engine, res, atlas) {
    var _this;
    _this = EngineObject2.call(this, engine) || this;
    _this.timePerFrame = 1e3 / res.fr;
    _this.duration = Math.floor(res.op - res.ip);
    _this.width = res.w;
    _this.height = res.h;
    _this.inPoint = res.ip;
    _this.outPoint = res.op;
    _this.atlas = atlas;
    _this.layers = res.layers;
    _this.comps = res.assets;
    _this.name = res.nm;
    _this.clips = {};
    var compsMap = {};
    var comps = _assert_this_initialized(_this).comps;
    if (comps) {
      for (var i = 0, l = comps.length; i < l; i++) {
        var comp = comps[i];
        if (comp.id) {
          compsMap[comp.id] = comp;
        }
      }
    }
    _this._buildTree(_this.layers, compsMap);
    if (res.lolitaAnimations) {
      _this._parseAnimations(res.lolitaAnimations);
    }
    return _this;
  }
  var _proto = LottieResource2.prototype;
  _proto.setClips = function setClips(v) {
    this.clips = {};
    this._parseAnimations(v);
  };
  _proto._parseAnimations = function _parseAnimations(clips) {
    var _this = this;
    clips.forEach(function(clip) {
      _this.clips[clip.name] = _extends({}, clip);
    });
  };
  _proto._buildTree = function _buildTree(layers, compsMap, startTime, stretch, indStart, indFactor) {
    if (startTime === void 0)
      startTime = 0;
    if (stretch === void 0)
      stretch = 1;
    if (indStart === void 0)
      indStart = 0;
    if (indFactor === void 0)
      indFactor = 1;
    var layersMap = {};
    for (var i = 0, l = layers.length; i < l; i++) {
      var layer = layers[i];
      layersMap[layer.ind] = layer;
    }
    for (var i1 = layers.length - 1; i1 >= 0; i1--) {
      var layer1 = layers[i1];
      var refId = layer1.refId, parent = layer1.parent;
      layer1.offsetTime = startTime;
      layer1.stretch = stretch;
      layer1.index = layer1.ind * indFactor + indStart;
      if (parent) {
        if (!layersMap[parent].layers) {
          layersMap[parent].layers = [];
        }
        layersMap[parent].layers.push(layer1);
        layers.splice(i1, 1);
      }
      if (refId && compsMap[refId]) {
        var refLayers = [];
        for (var j = 0; j < compsMap[refId].layers.length; j++) {
          refLayers.push(this._deepClone(compsMap[refId].layers[j]));
        }
        var offsetTime = (layer1.offsetTime || 0) + (layer1.st || 0);
        var _$stretch = (layer1.stretch || 1) * (layer1.sr || 1);
        var compIndFactor = indFactor / (refLayers[refLayers.length - 1].ind + 1) * indFactor;
        this._buildTree(refLayers, compsMap, offsetTime, _$stretch, layer1.index, compIndFactor);
        if (layer1.layers) {
          var _layer_layers;
          (_layer_layers = layer1.layers).push.apply(_layer_layers, refLayers);
        } else {
          layer1.layers = [].concat(refLayers);
        }
      }
    }
  };
  _proto._deepClone = function _deepClone(from) {
    var _this = this;
    var out = Array.isArray(from) ? [].concat(from) : _extends({}, from);
    Reflect.ownKeys(out).map(function(key) {
      out[key] = _this._isObject(from[key]) ? _this._deepClone(from[key]) : from[key];
    });
    return out;
  };
  _proto._isObject = function _isObject(obj) {
    return (typeof obj === "object" || typeof obj === "function") && (typeof obj === "undefined" ? "undefined" : _type_of(obj)) !== null;
  };
  _proto.destroy = function destroy() {
    this.layers = null;
    this.clips = null;
    this.comps = null;
    this.atlas = null;
  };
  return LottieResource2;
}(EngineObject);
var Base64Atlas = /* @__PURE__ */ function() {
  function Base64Atlas2(assets, engine) {
    var _this = this;
    this.sprites = {};
    this.assetsPromises = [];
    this.assetsPromises = assets.map(function(asset) {
      return engine.resourceManager.load({
        url: asset.p,
        type: AssetType.Texture2D
      }).then(function(texture) {
        var sprite = new Sprite(engine);
        sprite.texture = texture;
        _this.sprites[asset.id] = sprite;
      });
    });
  }
  var _proto = Base64Atlas2.prototype;
  _proto.request = function request() {
    return Promise.all(this.assetsPromises);
  };
  _proto.getSprite = function getSprite(id) {
    return this.sprites[id];
  };
  return Base64Atlas2;
}();
var LottieLoader = /* @__PURE__ */ function(Loader2) {
  _inherits(LottieLoader2, Loader2);
  function LottieLoader2() {
    return Loader2.apply(this, arguments);
  }
  var _proto = LottieLoader2.prototype;
  _proto.load = function load(item, resourceManager) {
    var urls = item.urls;
    var jsonPromise = this.request(urls[0], {
      type: "json"
    });
    if (urls[1]) {
      var atlasPromise = resourceManager.load({
        url: urls[1],
        type: AssetType.SpriteAtlas
      });
      return AssetPromise.all([
        jsonPromise,
        atlasPromise
      ]).then(function(param) {
        var res = param[0], atlas = param[1];
        var engine = resourceManager.engine;
        var resource = new LottieResource(engine, res, atlas);
        var lottieEntity = new Entity(engine);
        var lottie = lottieEntity.addComponent(LottieAnimation);
        lottie.resource = resource;
        return lottieEntity;
      });
    } else {
      return AssetPromise.all([
        jsonPromise
      ]).then(function(param) {
        var res = param[0];
        var engine = resourceManager.engine;
        var spriteAssets = res.assets.filter(function(asset) {
          return asset.p;
        });
        res.assets = res.assets.filter(function(asset) {
          return !asset.p;
        });
        var atlas = new Base64Atlas(spriteAssets, engine);
        return atlas.request().then(function() {
          var resource = new LottieResource(engine, res, atlas);
          var lottieEntity = new Entity(engine);
          var lottie = lottieEntity.addComponent(LottieAnimation);
          lottie.resource = resource;
          return lottieEntity;
        });
      });
    }
  };
  return LottieLoader2;
}(Loader);
LottieLoader = __decorate([
  resourceLoader("lottie", [
    "json"
  ])
], LottieLoader);
var EditorLottieLoader = /* @__PURE__ */ function(Loader2) {
  _inherits(EditorLottieLoader2, Loader2);
  function EditorLottieLoader2() {
    return Loader2.apply(this, arguments);
  }
  var _proto = EditorLottieLoader2.prototype;
  _proto.load = function load(item, resourceManager) {
    var _this = this;
    return new AssetPromise(function(resolve) {
      _this.request(item.url, {
        type: "json"
      }).then(function(data) {
        var jsonUrl = data.jsonUrl, atlasUrl = data.atlasUrl;
        var jsonPromise = _this.request(jsonUrl, resourceManager);
        var atlasPromise = resourceManager.load({
          url: atlasUrl,
          type: AssetType.SpriteAtlas
        });
        AssetPromise.all([
          jsonPromise,
          atlasPromise
        ]).then(function(param) {
          var res = param[0], atlas = param[1];
          var engine = resourceManager.engine;
          var resource = new LottieResource(engine, res, atlas);
          resolve(resource);
        });
      });
    });
  };
  return EditorLottieLoader2;
}(Loader);
EditorLottieLoader = __decorate([
  resourceLoader("EditorLottie", [
    "json"
  ])
], EditorLottieLoader);
Loader.registerClass("LottieAnimation", LottieAnimation);
export { LottieAnimation as L };
