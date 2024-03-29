(function() {
  var Bacon, Bus, Dispatcher, End, Error, Event, EventStream, Initial, Next, Observable, Property, PropertyDispatcher, always, assert, assertArray, assertEvent, assertFunction, cloneArray, cloneObject, contains, empty, end, filter, former, head, initial, isEvent, isFieldKey, isFunction, latter, map, next, nop, remove, tail, toCombinator, toEvent, toExtractor, toFieldKey, _ref,
    _this = this,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = this.jQuery || this.Zepto) != null) {
    _ref.fn.asEventStream = function(eventName) {
      var element;
      element = this;
      return new EventStream(function(sink) {
        var handler, unbind;
        handler = function(event) {
          var reply;
          reply = sink(next(event));
          if (reply === Bacon.noMore) return unbind();
        };
        unbind = function() {
          return element.unbind(eventName, handler);
        };
        element.bind(eventName, handler);
        return unbind;
      });
    };
  }

  Bacon = this.Bacon = {
    taste: "delicious"
  };

  Bacon.noMore = "veggies";

  Bacon.more = "moar bacon!";

  Bacon.never = function() {
    return new EventStream(function(sink) {
      return function() {
        return nop;
      };
    });
  };

  Bacon.later = function(delay, value) {
    return Bacon.sequentially(delay, [value]);
  };

  Bacon.sequentially = function(delay, values) {
    return Bacon.repeatedly(delay, values).take(filter((function(e) {
      return e.hasValue();
    }), map(toEvent, values)).length);
  };

  Bacon.repeatedly = function(delay, values) {
    var index, poll;
    index = -1;
    poll = function() {
      index++;
      return toEvent(values[index % values.length]);
    };
    return Bacon.fromPoll(delay, poll);
  };

  Bacon.fromPoll = function(delay, poll) {
    return new EventStream(function(sink) {
      var handler, id, unbind;
      id = void 0;
      handler = function() {
        var reply, value;
        value = poll();
        reply = sink(value);
        if (reply === Bacon.noMore || value.isEnd()) return unbind();
      };
      unbind = function() {
        return clearInterval(id);
      };
      id = setInterval(handler, delay);
      return unbind;
    });
  };

  Bacon.interval = function(delay, value) {
    var poll;
    if (value == null) value = {};
    poll = function() {
      return next(value);
    };
    return Bacon.fromPoll(delay, poll);
  };

  Bacon.constant = function(value) {
    return new Property(function(sink) {
      sink(initial(value));
      sink(end());
      return nop;
    });
  };

  Bacon.combineAll = function(streams, f) {
    var next, stream, _i, _len, _ref2;
    assertArray(streams);
    stream = head(streams);
    _ref2 = tail(streams);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      next = _ref2[_i];
      stream = f(stream, next);
    }
    return stream;
  };

  Bacon.mergeAll = function(streams) {
    return Bacon.combineAll(streams, function(s1, s2) {
      return s1.merge(s2);
    });
  };

  Bacon.combineAsArray = function(streams) {
    var concatArrays, toArray;
    toArray = function(x) {
      if (x != null) {
        if (x instanceof Array) {
          return x;
        } else {
          return [x];
        }
      } else {
        return [];
      }
    };
    concatArrays = function(a1, a2) {
      return toArray(a1).concat(toArray(a2));
    };
    return Bacon.combineAll(streams, function(s1, s2) {
      return s1.toProperty().combine(s2, concatArrays);
    });
  };

  Bacon.combineWith = function(streams, f) {
    return Bacon.combineAll(streams, function(s1, s2) {
      return s1.toProperty().combine(s2, f);
    });
  };

  Bacon.latestValue = function(src) {
    var latest,
      _this = this;
    latest = void 0;
    src.subscribe(function(event) {
      if (event.hasValue()) return latest = event.value;
    });
    return function() {
      return latest;
    };
  };

  Event = (function() {

    function Event() {}

    Event.prototype.isEvent = function() {
      return true;
    };

    Event.prototype.isEnd = function() {
      return false;
    };

    Event.prototype.isInitial = function() {
      return false;
    };

    Event.prototype.isNext = function() {
      return false;
    };

    Event.prototype.isError = function() {
      return false;
    };

    Event.prototype.hasValue = function() {
      return false;
    };

    Event.prototype.filter = function(f) {
      return true;
    };

    Event.prototype.getOriginalEvent = function() {
      if (this.sourceEvent != null) {
        return this.sourceEvent.getOriginalEvent();
      } else {
        return this;
      }
    };

    Event.prototype.onDone = function(listener) {
      return listener();
    };

    return Event;

  })();

  Next = (function(_super) {

    __extends(Next, _super);

    function Next(value, sourceEvent) {
      this.value = value;
    }

    Next.prototype.isNext = function() {
      return true;
    };

    Next.prototype.hasValue = function() {
      return true;
    };

    Next.prototype.fmap = function(f) {
      return this.apply(f(this.value));
    };

    Next.prototype.apply = function(value) {
      return next(value, this.getOriginalEvent());
    };

    Next.prototype.filter = function(f) {
      return f(this.value);
    };

    return Next;

  })(Event);

  Initial = (function(_super) {

    __extends(Initial, _super);

    function Initial() {
      Initial.__super__.constructor.apply(this, arguments);
    }

    Initial.prototype.isInitial = function() {
      return true;
    };

    Initial.prototype.isNext = function() {
      return false;
    };

    Initial.prototype.apply = function(value) {
      return initial(value, this.getOriginalEvent());
    };

    return Initial;

  })(Next);

  End = (function(_super) {

    __extends(End, _super);

    function End() {
      End.__super__.constructor.apply(this, arguments);
    }

    End.prototype.isEnd = function() {
      return true;
    };

    End.prototype.fmap = function() {
      return this;
    };

    End.prototype.apply = function() {
      return this;
    };

    return End;

  })(Event);

  Error = (function(_super) {

    __extends(Error, _super);

    function Error(error) {
      this.error = error;
    }

    Error.prototype.isError = function() {
      return true;
    };

    Error.prototype.fmap = function() {
      return this;
    };

    Error.prototype.apply = function() {
      return this;
    };

    return Error;

  })(Event);

  Observable = (function() {

    function Observable() {
      this.takeUntil = __bind(this.takeUntil, this);
    }

    Observable.prototype.onValue = function(f) {
      return this.subscribe(function(event) {
        if (event.hasValue()) return f(event.value);
      });
    };

    Observable.prototype.onError = function(f) {
      return this.subscribe(function(event) {
        if (event.isError()) return f(event.error);
      });
    };

    Observable.prototype.errors = function() {
      return this.filter(function() {
        return false;
      });
    };

    Observable.prototype.filter = function(f) {
      f = toExtractor(f);
      return this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          return Bacon.more;
        }
      });
    };

    Observable.prototype.takeWhile = function(f) {
      return this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          this.push(end());
          return Bacon.noMore;
        }
      });
    };

    Observable.prototype.endOnError = function() {
      return this.withHandler(function(event) {
        if (event.isError()) {
          this.push(event);
          return this.push(end());
        } else {
          return this.push(event);
        }
      });
    };

    Observable.prototype.take = function(count) {
      assert("take: count must >= 1", count >= 1);
      return this.withHandler(function(event) {
        if (!event.hasValue()) {
          return this.push(event);
        } else if (count === 1) {
          this.push(event);
          this.push(end());
          return Bacon.noMore;
        } else {
          count--;
          return this.push(event);
        }
      });
    };

    Observable.prototype.map = function(f) {
      f = toExtractor(f);
      return this.withHandler(function(event) {
        return this.push(event.fmap(f));
      });
    };

    Observable.prototype.takeUntil = function(stopper) {
      var src;
      src = this;
      return this.withSubscribe(function(sink) {
        var srcSink, stopperSink, unsubBoth, unsubSrc, unsubStopper, unsubscribed;
        unsubscribed = false;
        unsubSrc = nop;
        unsubStopper = nop;
        unsubBoth = function() {
          unsubSrc();
          unsubStopper();
          return unsubscribed = true;
        };
        srcSink = function(event) {
          if (event.isEnd()) {
            unsubStopper();
            sink(event);
            return Bacon.noMore;
          } else {
            event.getOriginalEvent().onDone(function() {
              var reply;
              if (!unsubscribed) {
                reply = sink(event);
                if (reply === Bacon.noMore) return unsubBoth();
              }
            });
            return Bacon.more;
          }
        };
        stopperSink = function(event) {
          if (event.isError()) {
            return Bacon.more;
          } else if (event.isEnd()) {
            return Bacon.noMore;
          } else {
            unsubSrc();
            sink(end());
            return Bacon.noMore;
          }
        };
        unsubSrc = src.subscribe(srcSink);
        if (!unsubscribed) unsubStopper = stopper.subscribe(stopperSink);
        return unsubBoth;
      });
    };

    Observable.prototype.skip = function(count) {
      assert("skip: count must >= 0", count >= 0);
      return this.withHandler(function(event) {
        if (!event.hasValue()) {
          return this.push(event);
        } else if (count > 0) {
          count--;
          return Bacon.more;
        } else {
          return this.push(event);
        }
      });
    };

    Observable.prototype.distinctUntilChanged = function() {
      return this.withStateMachine(void 0, function(prev, event) {
        if (!event.hasValue()) {
          return [prev, [event]];
        } else if (prev !== event.value) {
          return [event.value, [event]];
        } else {
          return [prev, []];
        }
      });
    };

    Observable.prototype.withStateMachine = function(initState, f) {
      var state;
      state = initState;
      return this.withHandler(function(event) {
        var fromF, newState, output, outputs, reply, _i, _len;
        fromF = f(state, event);
        assertArray(fromF);
        newState = fromF[0], outputs = fromF[1];
        assertArray(outputs);
        state = newState;
        reply = Bacon.more;
        for (_i = 0, _len = outputs.length; _i < _len; _i++) {
          output = outputs[_i];
          reply = this.push(output);
          if (reply === Bacon.noMore) return reply;
        }
        return reply;
      });
    };

    return Observable;

  })();

  EventStream = (function(_super) {

    __extends(EventStream, _super);

    function EventStream(subscribe) {
      this["switch"] = __bind(this["switch"], this);
      var dispatcher;
      assertFunction(subscribe);
      dispatcher = new Dispatcher(subscribe);
      this.subscribe = dispatcher.subscribe;
      this.hasSubscribers = dispatcher.hasSubscribers;
    }

    EventStream.prototype.flatMap = function(f) {
      var root;
      root = this;
      return new EventStream(function(sink) {
        var checkEnd, children, rootEnd, spawner, unbind, unsubRoot;
        children = [];
        rootEnd = false;
        unsubRoot = function() {};
        unbind = function() {
          var unsubChild, _i, _len;
          unsubRoot();
          for (_i = 0, _len = children.length; _i < _len; _i++) {
            unsubChild = children[_i];
            unsubChild();
          }
          return children = [];
        };
        checkEnd = function() {
          if (rootEnd && (children.length === 0)) return sink(end());
        };
        spawner = function(event) {
          var child, handler, removeChild, unsubChild;
          if (event.isEnd()) {
            rootEnd = true;
            return checkEnd();
          } else if (event.isError()) {
            return sink(event);
          } else {
            child = f(event.value);
            unsubChild = void 0;
            removeChild = function() {
              if (unsubChild != null) remove(unsubChild, children);
              return checkEnd();
            };
            handler = function(event) {
              var reply;
              if (event.isEnd()) {
                removeChild();
                return Bacon.noMore;
              } else {
                reply = sink(event);
                if (reply === Bacon.noMore) unbind();
                return reply;
              }
            };
            unsubChild = child.subscribe(handler);
            return children.push(unsubChild);
          }
        };
        unsubRoot = root.subscribe(spawner);
        return unbind;
      });
    };

    EventStream.prototype["switch"] = function(f) {
      var _this = this;
      return this.flatMap(function(value) {
        return f(value).takeUntil(_this);
      });
    };

    EventStream.prototype.delay = function(delay) {
      return this.flatMap(function(value) {
        return Bacon.later(delay, value);
      });
    };

    EventStream.prototype.throttle = function(delay) {
      return this["switch"](function(value) {
        return Bacon.later(delay, value);
      });
    };

    EventStream.prototype.bufferWithTime = function(delay) {
      var buffer, flush, storeAndMaybeTrigger, values;
      values = [];
      storeAndMaybeTrigger = function(value) {
        values.push(value);
        return values.length === 1;
      };
      flush = function() {
        var output;
        output = values;
        values = [];
        return output;
      };
      buffer = function() {
        return Bacon.later(delay).map(flush);
      };
      return this.filter(storeAndMaybeTrigger).flatMap(buffer);
    };

    EventStream.prototype.bufferWithCount = function(count) {
      var values;
      values = [];
      return this.withHandler(function(event) {
        var flush,
          _this = this;
        flush = function() {
          _this.push(next(values, event));
          return values = [];
        };
        if (event.isError()) {
          return this.push(event);
        } else if (event.isEnd()) {
          flush();
          return this.push(event);
        } else {
          values.push(event.value);
          if (values.length === count) return flush();
        }
      });
    };

    EventStream.prototype.merge = function(right) {
      var left;
      left = this;
      return new EventStream(function(sink) {
        var ends, smartSink, unsubBoth, unsubLeft, unsubRight, unsubscribed;
        unsubLeft = nop;
        unsubRight = nop;
        unsubscribed = false;
        unsubBoth = function() {
          unsubLeft();
          unsubRight();
          return unsubscribed = true;
        };
        ends = 0;
        smartSink = function(event) {
          var reply;
          if (event.isEnd()) {
            ends++;
            if (ends === 2) {
              return sink(end());
            } else {
              return Bacon.more;
            }
          } else {
            reply = sink(event);
            if (reply === Bacon.noMore) unsubBoth();
            return reply;
          }
        };
        unsubLeft = left.subscribe(smartSink);
        if (!unsubscribed) unsubRight = right.subscribe(smartSink);
        return unsubBoth;
      });
    };

    EventStream.prototype.toProperty = function(initValue) {
      return this.scan(initValue, latter);
    };

    EventStream.prototype.scan = function(seed, f) {
      var acc, d, handleEvent, subscribe;
      f = toCombinator(f);
      acc = seed;
      handleEvent = function(event) {
        if (event.hasValue()) acc = f(acc, event.value);
        return this.push(event.apply(acc));
      };
      d = new Dispatcher(this.subscribe, handleEvent);
      subscribe = function(sink) {
        var reply;
        if (acc != null) reply = sink(initial(acc));
        if (reply !== Bacon.noMore) return d.subscribe(sink);
      };
      return new Property(subscribe);
    };

    EventStream.prototype.decorateWith = function(label, property) {
      return property.sampledBy(this, function(propertyValue, streamValue) {
        var result;
        result = cloneObject(streamValue);
        result[label] = propertyValue;
        return result;
      });
    };

    EventStream.prototype.end = function(value) {
      if (value == null) value = "end";
      return this.withHandler(function(event) {
        if (event.isEnd()) {
          this.push(next(value, event));
          this.push(end());
          return Bacon.noMore;
        } else {
          return Bacon.more;
        }
      });
    };

    EventStream.prototype.withHandler = function(handler) {
      var dispatcher;
      dispatcher = new Dispatcher(this.subscribe, handler);
      return new EventStream(dispatcher.subscribe);
    };

    EventStream.prototype.withSubscribe = function(subscribe) {
      return new EventStream(subscribe);
    };

    return EventStream;

  })(Observable);

  Property = (function(_super) {

    __extends(Property, _super);

    function Property(subscribe) {
      var combine,
        _this = this;
      this.subscribe = subscribe;
      this.toProperty = __bind(this.toProperty, this);
      this.changes = __bind(this.changes, this);
      this.sample = __bind(this.sample, this);
      combine = function(other, leftSink, rightSink) {
        var myVal, otherVal;
        myVal = void 0;
        otherVal = void 0;
        return new Property(function(sink) {
          var checkEnd, combiningSink, initialSent, myEnd, mySink, otherEnd, otherSink, unsubBoth, unsubMe, unsubOther, unsubscribed;
          unsubscribed = false;
          unsubMe = nop;
          unsubOther = nop;
          unsubBoth = function() {
            unsubMe();
            unsubOther();
            return unsubscribed = true;
          };
          myEnd = false;
          otherEnd = false;
          checkEnd = function() {
            var reply;
            if (myEnd && otherEnd) {
              reply = sink(end());
              if (reply === Bacon.noMore) unsubBoth();
              return reply;
            }
          };
          initialSent = false;
          combiningSink = function(markEnd, setValue, thisSink) {
            return function(event) {
              var reply;
              if (event.isEnd()) {
                markEnd();
                checkEnd();
                return Bacon.noMore;
              } else if (event.isError()) {
                reply = sink(event);
                if (reply === Bacon.noMore) unsubBoth;
                return reply;
              } else {
                setValue(event.value);
                if ((myVal != null) && (otherVal != null)) {
                  if (initialSent && event.isInitial()) {
                    return Bacon.more;
                  } else {
                    initialSent = true;
                    reply = thisSink(sink, event, myVal, otherVal);
                    if (reply === Bacon.noMore) unsubBoth;
                    return reply;
                  }
                } else {
                  return Bacon.more;
                }
              }
            };
          };
          mySink = combiningSink((function() {
            return myEnd = true;
          }), (function(value) {
            return myVal = value;
          }), leftSink);
          otherSink = combiningSink((function() {
            return otherEnd = true;
          }), (function(value) {
            return otherVal = value;
          }), rightSink);
          unsubMe = _this.subscribe(mySink);
          if (!unsubscribed) unsubOther = other.subscribe(otherSink);
          return unsubBoth;
        });
      };
      this.combine = function(other, f) {
        var combinator, combineAndPush;
        combinator = toCombinator(f);
        combineAndPush = function(sink, event, myVal, otherVal) {
          return sink(event.apply(combinator(myVal, otherVal)));
        };
        return combine(other, combineAndPush, combineAndPush);
      };
      this.sampledBy = function(sampler, combinator) {
        var pushPropertyValue;
        if (combinator == null) combinator = former;
        pushPropertyValue = function(sink, event, propertyVal, streamVal) {
          return sink(event.apply(combinator(propertyVal, streamVal)));
        };
        return combine(sampler, nop, pushPropertyValue).changes().takeUntil(sampler.end());
      };
    }

    Property.prototype.sample = function(interval) {
      return this.sampledBy(Bacon.interval(interval, {}));
    };

    Property.prototype.changes = function() {
      var _this = this;
      return new EventStream(function(sink) {
        return _this.subscribe(function(event) {
          if (!event.isInitial()) return sink(event);
        });
      });
    };

    Property.prototype.withHandler = function(handler) {
      return new Property(new PropertyDispatcher(this.subscribe, handler).subscribe);
    };

    Property.prototype.withSubscribe = function(subscribe) {
      return new Property(new PropertyDispatcher(subscribe).subscribe);
    };

    Property.prototype.toProperty = function() {
      return this;
    };

    return Property;

  })(Observable);

  Dispatcher = (function() {

    function Dispatcher(subscribe, handleEvent) {
      var removeSink, sinks, unsubscribeFromSource,
        _this = this;
      if (subscribe == null) {
        subscribe = function() {
          return nop;
        };
      }
      sinks = [];
      this.hasSubscribers = function() {
        return sinks.length > 0;
      };
      unsubscribeFromSource = nop;
      removeSink = function(sink) {
        return remove(sink, sinks);
      };
      this.push = function(event) {
        var done, reply, sink, waiters, _i, _len, _ref2;
        waiters = void 0;
        done = function() {
          var w, ws, _i, _len;
          if (waiters != null) {
            ws = waiters;
            waiters = void 0;
            for (_i = 0, _len = ws.length; _i < _len; _i++) {
              w = ws[_i];
              w();
            }
          }
          return event.onDone = Event.prototype.onDone;
        };
        event.onDone = function(listener) {
          if ((waiters != null) && !contains(waiters, listener)) {
            return waiters.push(listener);
          } else {
            return waiters = [listener];
          }
        };
        assertEvent(event);
        _ref2 = cloneArray(sinks);
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          sink = _ref2[_i];
          reply = sink(event);
          if (reply === Bacon.noMore || event.isEnd()) removeSink(sink);
        }
        done();
        if (_this.hasSubscribers()) {
          return Bacon.more;
        } else {
          return Bacon.noMore;
        }
      };
      if (handleEvent == null) {
        handleEvent = function(event) {
          return this.push(event);
        };
      }
      this.handleEvent = function(event) {
        assertEvent(event);
        return handleEvent.apply(_this, [event]);
      };
      this.subscribe = function(sink) {
        assertFunction(sink);
        sinks.push(sink);
        if (sinks.length === 1) {
          unsubscribeFromSource = subscribe(_this.handleEvent);
        }
        assertFunction(unsubscribeFromSource);
        return function() {
          removeSink(sink);
          if (!_this.hasSubscribers()) return unsubscribeFromSource();
        };
      };
    }

    return Dispatcher;

  })();

  PropertyDispatcher = (function(_super) {

    __extends(PropertyDispatcher, _super);

    function PropertyDispatcher(subscribe, handleEvent) {
      var current, push,
        _this = this;
      PropertyDispatcher.__super__.constructor.call(this, subscribe, handleEvent);
      current = void 0;
      push = this.push;
      subscribe = this.subscribe;
      this.push = function(event) {
        if (event.hasValue()) current = event.value;
        return push.apply(_this, [event]);
      };
      this.subscribe = function(sink) {
        var reply;
        if (_this.hasSubscribers() && (current != null)) {
          reply = sink(initial(current));
          if (reply === Bacon.noMore) return nop;
        }
        return subscribe.apply(_this, [sink]);
      };
    }

    return PropertyDispatcher;

  })(Dispatcher);

  Bus = (function(_super) {

    __extends(Bus, _super);

    function Bus() {
      var dispatcher, guardedSink, inputs, sink, subscribeAll, subscribeThis, unsubAll, unsubFuncs,
        _this = this;
      sink = void 0;
      unsubFuncs = [];
      inputs = [];
      guardedSink = function(input) {
        return function(event) {
          if (event.isEnd()) {
            remove(input, inputs);
            return Bacon.noMore;
          } else {
            return sink(event);
          }
        };
      };
      unsubAll = function() {
        var f, _i, _len;
        for (_i = 0, _len = unsubFuncs.length; _i < _len; _i++) {
          f = unsubFuncs[_i];
          f();
        }
        return unsubFuncs = [];
      };
      subscribeAll = function(newSink) {
        var input, _i, _len;
        sink = newSink;
        unsubFuncs = [];
        for (_i = 0, _len = inputs.length; _i < _len; _i++) {
          input = inputs[_i];
          unsubFuncs.push(input.subscribe(guardedSink(input)));
        }
        return unsubAll;
      };
      dispatcher = new Dispatcher(subscribeAll);
      subscribeThis = function(sink) {
        return dispatcher.subscribe(sink);
      };
      Bus.__super__.constructor.call(this, subscribeThis);
      this.plug = function(inputStream) {
        inputs.push(inputStream);
        if ((sink != null)) {
          return unsubFuncs.push(inputStream.subscribe(guardedSink(inputStream)));
        }
      };
      this.push = function(value) {
        if (sink != null) return sink(next(value));
      };
      this.error = function(error) {
        if (sink != null) return sink(new Error(error));
      };
      this.end = function() {
        unsubAll();
        return sink(end());
      };
    }

    return Bus;

  })(EventStream);

  Bacon.EventStream = EventStream;

  Bacon.Property = Property;

  Bacon.Bus = Bus;

  Bacon.Initial = Initial;

  Bacon.Next = Next;

  Bacon.End = End;

  Bacon.Error = Error;

  nop = function() {};

  latter = function(_, x) {
    return x;
  };

  former = function(x, _) {
    return x;
  };

  initial = function(value) {
    return new Initial(value);
  };

  next = function(value) {
    return new Next(value);
  };

  end = function() {
    return new End();
  };

  isEvent = function(x) {
    return (x != null) && (x.isEvent != null) && x.isEvent();
  };

  toEvent = function(x) {
    if (isEvent(x)) {
      return x;
    } else {
      return next(x);
    }
  };

  empty = function(xs) {
    return xs.length === 0;
  };

  head = function(xs) {
    return xs[0];
  };

  tail = function(xs) {
    return xs.slice(1, xs.length);
  };

  filter = function(f, xs) {
    var filtered, x, _i, _len;
    filtered = [];
    for (_i = 0, _len = xs.length; _i < _len; _i++) {
      x = xs[_i];
      if (f(x)) filtered.push(x);
    }
    return filtered;
  };

  map = function(f, xs) {
    var x, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = xs.length; _i < _len; _i++) {
      x = xs[_i];
      _results.push(f(x));
    }
    return _results;
  };

  cloneArray = function(xs) {
    return xs.slice(0);
  };

  cloneObject = function(src) {
    var clone, key, value;
    clone = {};
    for (key in src) {
      value = src[key];
      clone[key] = value;
    }
    return clone;
  };

  remove = function(x, xs) {
    var i;
    i = xs.indexOf(x);
    if (i >= 0) return xs.splice(i, 1);
  };

  contains = function(xs, x) {
    return xs.indexOf(x) >= 0;
  };

  assert = function(message, condition) {
    if (!condition) throw message;
  };

  assertEvent = function(event) {
    assert("not an event : " + event, event.isEvent != null);
    return assert("not event", event.isEvent());
  };

  assertFunction = function(f) {
    return assert("not a function : " + f, isFunction(f));
  };

  isFunction = function(f) {
    return typeof f === "function";
  };

  assertArray = function(xs) {
    return assert("not an array : " + xs, xs instanceof Array);
  };

  always = function(x) {
    return function() {
      return x;
    };
  };

  toExtractor = function(f) {
    var key;
    if (isFunction(f)) {
      return f;
    } else if (isFieldKey(f)) {
      key = toFieldKey(f);
      return function(value) {
        var fieldValue;
        fieldValue = value[key];
        if (isFunction(fieldValue)) {
          return value[key]();
        } else {
          return fieldValue;
        }
      };
    } else {
      return always(f);
    }
  };

  isFieldKey = function(f) {
    return (typeof f === "string") && f.length > 1 && f[0] === ".";
  };

  toFieldKey = function(f) {
    return f.slice(1);
  };

  toCombinator = function(f) {
    var key;
    if (isFunction(f)) {
      return f;
    } else if (isFieldKey(f)) {
      key = toFieldKey(f);
      return function(left, right) {
        return left[key](right);
      };
    } else {
      return assert("not a function or a field key: " + f, false);
    }
  };

}).call(this);
