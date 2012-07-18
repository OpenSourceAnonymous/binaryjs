/*! binary.js build:0.0.2, development. Copyright(c) 2012 Eric Zhang <eric@ericzhang.com> MIT Licensed */
(function(exports){
/**
 * EventEmitter v3.1.5
 * https://github.com/Wolfy87/EventEmitter
 *
 * Oliver Caldwell (http://oli.me.uk)
 * Creative Commons Attribution 3.0 Unported License (http://creativecommons.org/licenses/by/3.0/)
 */

/**
 * EventEmitter class
 * Creates an object with event registering and firing methods
 */
function EventEmitter() {
  // Initialise required storage variables
  this._events = {};
  this._maxListeners = 10;
}

/**
 * Event class
 * Contains Event methods and property storage
 *
 * @param {String} type Event type name
 * @param {Function} listener Function to be called when the event is fired
 * @param {Object} scope Object that this should be set to when the listener is called
 * @param {Boolean} once If true then the listener will be removed after the first call
 * @param {Object} instance The parent EventEmitter instance
 */
function Event(type, listener, scope, once, instance) {
  // Store arguments
  this.type = type;
  this.listener = listener;
  this.scope = scope;
  this.once = once;
  this.instance = instance;
}

/**
 * Executes the listener
 *
 * @param {Array} args List of arguments to pass to the listener
 * @return {Boolean} If false then it was a once event
 */
Event.prototype.fire = function(args) {
  this.listener.apply(this.scope || this.instance, args);
  
  // Remove the listener if this is a once only listener
  if(this.once) {
    this.instance.removeListener(this.type, this.listener, this.scope);
    return false;
  }
};

/**
 * Passes every listener for a specified event to a function one at a time
 *
 * @param {String} type Event type name
 * @param {Function} callback Function to pass each listener to
 * @return {Object} The current EventEmitter instance to allow chaining
 */
EventEmitter.prototype.eachListener = function(type, callback) {
  // Initialise variables
  var i = null,
    possibleListeners = null,
    result = null;
  
  // Only loop if the type exists
  if(this._events.hasOwnProperty(type)) {
    possibleListeners = this._events[type];
    
    for(i = 0; i < possibleListeners.length; i += 1) {
      result = callback.call(this, possibleListeners[i], i);
      
      if(result === false) {
        i -= 1;
      }
      else if(result === true) {
        break;
      }
    }
  }
  
  // Return the instance to allow chaining
  return this;
};

/**
 * Adds an event listener for the specified event
 *
 * @param {String} type Event type name
 * @param {Function} listener Function to be called when the event is fired
 * @param {Object} scope Object that this should be set to when the listener is called
 * @param {Boolean} once If true then the listener will be removed after the first call
 * @return {Object} The current EventEmitter instance to allow chaining
 */
EventEmitter.prototype.addListener = function(type, listener, scope, once) {
  // Create the listener array if it does not exist yet
  if(!this._events.hasOwnProperty(type)) {
    this._events[type] = [];
  }
  
  // Push the new event to the array
  this._events[type].push(new Event(type, listener, scope, once, this));
  
  // Emit the new listener event
  this.emit('newListener', type, listener, scope, once);
  
  // Check if we have exceeded the maxListener count
  // Ignore this check if the count is 0
  // Also don't check if we have already fired a warning
  if(this._maxListeners && !this._events[type].warned && this._events[type].length > this._maxListeners) {
    // The max listener count has been exceeded!
    // Warn via the console if it exists
    if(typeof console !== 'undefined') {
      console.warn('Possible EventEmitter memory leak detected. ' + this._events[type].length + ' listeners added. Use emitter.setMaxListeners() to increase limit.');
    }
    
    // Set the flag so it doesn't fire again
    this._events[type].warned = true;
  }
  
  // Return the instance to allow chaining
  return this;
};

/**
 * Alias of the addListener method
 *
 * @param {String} type Event type name
 * @param {Function} listener Function to be called when the event is fired
 * @param {Object} scope Object that this should be set to when the listener is called
 * @param {Boolean} once If true then the listener will be removed after the first call
 */
EventEmitter.prototype.on = EventEmitter.prototype.addListener;

/**
 * Alias of the addListener method but will remove the event after the first use
 *
 * @param {String} type Event type name
 * @param {Function} listener Function to be called when the event is fired
 * @param {Object} scope Object that this should be set to when the listener is called
 * @return {Object} The current EventEmitter instance to allow chaining
 */
EventEmitter.prototype.once = function(type, listener, scope) {
  return this.addListener(type, listener, scope, true);
};

/**
 * Removes the a listener for the specified event
 *
 * @param {String} type Event type name the listener must have for the event to be removed
 * @param {Function} listener Listener the event must have to be removed
 * @param {Object} scope The scope the event must have to be removed
 * @return {Object} The current EventEmitter instance to allow chaining
 */
EventEmitter.prototype.removeListener = function(type, listener, scope) {
  this.eachListener(type, function(currentListener, index) {
    // If this is the listener remove it from the array
    // We also compare the scope if it was passed
    if(currentListener.listener === listener && (!scope || currentListener.scope === scope)) {
      this._events[type].splice(index, 1);
    }
  });
  
  // Remove the property if there are no more listeners
  if(this._events[type] && this._events[type].length === 0) {
    delete this._events[type];
  }
  
  // Return the instance to allow chaining
  return this;
};

/**
 * Alias of the removeListener method
 *
 * @param {String} type Event type name the listener must have for the event to be removed
 * @param {Function} listener Listener the event must have to be removed
 * @param {Object} scope The scope the event must have to be removed
 * @return {Object} The current EventEmitter instance to allow chaining
 */
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

/**
 * Removes all listeners for a specified event
 * If no event type is passed it will remove every listener
 *
 * @param {String} type Event type name to remove all listeners from
 * @return {Object} The current EventEmitter instance to allow chaining
 */
EventEmitter.prototype.removeAllListeners = function(type) {
  // Check for a type, if there is none remove all listeners
  // If there is a type however, just remove the listeners for that type
  if(type && this._events.hasOwnProperty(type)) {
    delete this._events[type];
  }
  else if(!type) {
    this._events = {};
  }
  
  // Return the instance to allow chaining
  return this;
};

/**
 * Retrieves the array of listeners for a specified event
 *
 * @param {String} type Event type name to return all listeners from
 * @return {Array} Will return either an array of listeners or an empty array if there are none
 */
EventEmitter.prototype.listeners = function(type) {
  // Return the array of listeners or an empty array if it does not exist
  if(this._events.hasOwnProperty(type)) {
    // It does exist, loop over building the array
    var listeners = [];
    
    this.eachListener(type, function(evt) {
      listeners.push(evt.listener);
    });
    
    return listeners;
  }
  
  return [];
};

/**
 * Emits an event executing all appropriate listeners
 * All values passed after the type will be passed as arguments to the listeners
 *
 * @param {String} type Event type name to run all listeners from
 * @return {Object} The current EventEmitter instance to allow chaining
 */
EventEmitter.prototype.emit = function(type) {
  // Calculate the arguments
  var args = [],
    i = null;
  
  for(i = 1; i < arguments.length; i += 1) {
    args.push(arguments[i]);
  }
  
  this.eachListener(type, function(currentListener) {
    return currentListener.fire(args);
  });
  
  // Return the instance to allow chaining
  return this;
};

/**
 * Sets the max listener count for the EventEmitter
 * When the count of listeners for an event exceeds this limit a warning will be printed
 * Set to 0 for no limit
 *
 * @param {Number} maxListeners The new max listener limit
 * @return {Object} The current EventEmitter instance to allow chaining
 */
EventEmitter.prototype.setMaxListeners = function(maxListeners) {
  this._maxListeners = maxListeners;
  
  // Return the instance to allow chaining
  return this;
};

/**
 * Builds a clone of the prototype object for you to extend with
 *
 * @return {Object} A clone of the EventEmitter prototype object
 */
EventEmitter.extend = function() {
  // First thing we need to do is create our new prototype
  // Then we loop over the current one copying each method out
  // When done, simply return the clone
  var clone = {},
    current = this.prototype,
    key = null;
  
  for(key in current) {
    // Make sure this is actually a property of the object before copying it
    // We don't want any default object methods leaking though
    if(current.hasOwnProperty(key)) {
      clone[key] = current[key];
    }
  }
  
  // All done, return the clone
  return clone;
};

// Export the class
// If AMD is available then use it
if(typeof define === 'function' && define.amd) {
  define(function() {
    return EventEmitter;
  });
}

var util = {
  inherits: function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  },
  extend: function(dest, source) {
    for(var key in source) {
      if(source.hasOwnProperty(key)) {
        dest[key] = source[key];
      }
    }
    return dest;
  },
  info: console.log.bind(console),
  pack: BinaryPack.pack,
  unpack: BinaryPack.unpack,
  setZeroTimeout: (function(global) {
    var timeouts = [];
    var messageName = 'zero-timeout-message';

    // Like setTimeout, but only takes a function argument.	 There's
    // no time argument (always zero) and no arguments (you have to
    // use a closure).
    function setZeroTimeoutPostMessage(fn) {
      timeouts.push(fn);
      global.postMessage(messageName, '*');
    }		

    function handleMessage(event) {
      if (event.source == global && event.data == messageName) {
        if (event.stopPropagation) {
          event.stopPropagation();
        }
        if (timeouts.length) {
          timeouts.shift()();
        }
      }
    }
    if (global.addEventListener) {
      global.addEventListener('message', handleMessage, true);
    } else if (global.attachEvent) {
      global.attachEvent('onmessage', handleMessage);
    }
    return setZeroTimeoutPostMessage;
  }(this))
};



function Stream() {
  EventEmitter.call(this);
}

util.inherits(Stream, EventEmitter);

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (this.listeners('error').length === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('end', cleanup);
    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('end', cleanup);
  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};
function BlobReadStream(source, options){
  Stream.call(this);
  
  options = util.extend({
      readDelay: 0,
      paused: false
  }, options);
  
  this._source = source;
  this._start = 0;
  this._readChunkSize = options.chunkSize || source.size;
  this._readDelay = options.readDelay;
  
  this.readable = true;
  this.paused = options.paused;
  
  this._read();
}

util.inherits(BlobReadStream, Stream);


BlobReadStream.prototype.pause = function(){
  this.paused = true;
};

BlobReadStream.prototype.resume = function(){
  this.paused = false;
  this._read();
};

BlobReadStream.prototype.destroy = function(){
  this.readable = false;
  clearTimeout(this._timeoutId);
};

BlobReadStream.prototype._read = function(){
    
  var self = this;
  
  function emitReadChunk(){
    self._emitReadChunk();
  }
  
  var readDelay = this._readDelay;
  if (readDelay !== 0){
    this._timeoutId = setTimeout(emitReadChunk, readDelay);
  } else {
    util.setZeroTimeout(emitReadChunk);
  }
    
};

BlobReadStream.prototype._emitReadChunk = function(){
    
  if(this.paused || !this.readable) return;
  
  var chunkSize = Math.min(this._source.size - this._start, this._readChunkSize);
  
  if(chunkSize === 0){
      this.readable = false;
      this.emit("end");
      return;
  }
  
  var sourceEnd = this._start + chunkSize;
  
  var chunk = (this._source.slice || this._source.webkitSlice || this._source.mozSlice)(this._start, sourceEnd);
  
  this._start = sourceEnd;
  this._read();
  
  this.emit("data", chunk);
  
};

/*




function BlobWriteStream(options){
    
    stream.Stream.call(this);
    
    options = _.extend({
        onFull: onFull,
        onEnd: function(){},
        minBlockAllocSize: 0,
        drainDelay:0
    }, options);
    
    this._onFull = options.onFull;
    this._onEnd = options.onEnd;
    this._onWrite = options.onWrite;
    
    this._minBlockAllocSize = options.minBlockAllocSize;
    this._maxBlockAllocSize = options.maxBlockAllocSize;
    this._drainDelay = options.drainDelay;
    
    this._buffer = new Buffer(options.minBlockAllocSize);
    this._destination = this._buffer;
    this._destinationPos = 0;
    
    this._writeQueue = [];
    this._pendingOnFull = false;
    this._pendingQueueDrain = false;
    
    this.writable = true;
    this.bytesWritten = 0;
}

util.inherits(BlobWriteStream, stream.Stream);

BlobWriteStream.prototype.getBuffer = function(){
    return this._buffer;
};

BlobWriteStream.prototype.write = function(data, encoding){
    
    if(!this.writable){
        throw new Error("stream is not writable");
    }
    
    if(!Buffer.isBuffer(data)){
        data = new Buffer(data, encoding);
    }
    
    if(data.length){
        this._writeQueue.push(data);
    }
    
    this._commit();
    
    return this._writeQueue.length === 0;
};

BlobWriteStream.prototype._commit = function(){
    
    var self = this;
    
    var destination = this._destination;
    var writeQueue = this._writeQueue;
    
    var startDestinationPos = this._destinationPos;
    
    while(writeQueue.length && destination.length){
        
        var head = writeQueue[0];
        
        var copySize = Math.min(destination.length, head.length);
        
        head.copy(destination, 0, 0, copySize);
        
        head = head.slice(copySize);
        destination = destination.slice(copySize);
        
        this.bytesWritten += copySize;
        this._destinationPos += copySize;
        
        if(head.length === 0){
            writeQueue.shift();
        }
        else{
            writeQueue[0] = head;
        }
    }
    
    this._destination = destination;
    
    bytesCommitted = this._destinationPos - startDestinationPos;
    if(bytesCommitted){
        if(this._onWrite){
            
            if(writeQueue.length){
                this._pendingQueueDrain = true;
            }
            
            // By locking destination the buffer is frozen and the onWrite
            // callback cannot miss any write commits
            this._destination = emptyBuffer;
            
            var consumer = this._onWrite;
            this._onWrite = null;
            
            consumer.call(this, function(nextCallback){
                util.setZeroTimeout(function(){
                    self._destination = destination;
                    self._onWrite = nextCallback;
                    self._commit();
                });
            }, consumer);
            
            return;
        }
    }
    
    if(writeQueue.length){
        
        this._pendingQueueDrain = true;
        this._growBuffer();
    }
    else if(this._pendingQueueDrain){
        
        this._pendingQueueDrain = false;
        
        if(this._drainDelay !== 0){
            setTimeout(function(){
                self.emit("drain");
            }, this._drainDelay);
        }
        else{
            util.setZeroTimeout(function(){
                self.emit("drain");
            });
        }
    }
};

BlobWriteStream.prototype._growBuffer = function(){
    
    var self = this;
    var writeQueue = this._writeQueue;
    
    var requestSize = this._minBlockAllocSize;
    
    var maxBlockAllocSize = this._maxBlockAllocSize;
    var add = (maxBlockAllocSize === undefined ? function(a, b){return a + b;} : function(a, b){return Math.min(a + b, maxBlockAllocSize);});
    
    for(var i = 0, queueLength = writeQueue.length; i < queueLength; i++){
        requestSize = add(requestSize, writeQueue[i].length);
    }
    
    // Prevent concurrent onFull callbacks
    if(this._pendingOnFull){
        return;
    }
    this._pendingOnFull = true;
    
    this._onFull(this._buffer, requestSize, function(buffer, destination){
        util.setZeroTimeout(function(){
            
            self._pendingOnFull = false;
            
            if(!destination){
                if(self.writable){
                    self.emit("error", new Error("buffer is full"));
                }
                self.destroy();
                return;
            }
            
            self._buffer = buffer;
            self._destination = destination;
            
            self._commit();
        });
    });
};

BlobWriteStream.prototype.end = function(data, encoding){
    
    var self = this;
    
    function _end(){
        self.writable = false;
        self._onEnd();
    }
    
    if(data){
        if(this.write(data, encoding)){
            _end();
        }else{
            self.writable = false;
            this.once("drain", _end);
        }
    }
    else{
        _end();
    }
};

BlobWriteStream.prototype.destroy = function(){
    this.writable = false;
    this._pendingQueueDrain = false;
    this._writeQueue = [];
};

BlobWriteStream.prototype.consume = function(consume){
    
    this._buffer = this._buffer.slice(consume);
    this._destinationPos -= consume;
};

BlobWriteStream.prototype.getCommittedSlice = function(){
    return this._buffer.slice(0, this._destinationPos);
};

function onFull(buffer, extraSize, callback){
    var newBuffer = new Buffer(buffer.length + extraSize);
    buffer.copy(newBuffer);
    callback(newBuffer, newBuffer.slice(buffer.length));
}
*/
exports.BlobReadStream = BlobReadStream;

function BinaryStream(socket, id, create, meta) {
  if (!(this instanceof BinaryStream)) return new BinaryStream(options);
  
  var self = this;
  
  Stream.call(this);

  
  this.id = id;
  this._socket = socket;
  this._socket.addEventListener('error', function(error){
    self.readable = false;
    self.writable = false;
    self.emit('error', error);
  });
  this._socket.addEventListener('close', function(code, message){
    self.readable = false;
    self.writable = false;
    self.emit('close', code, message);
  });
  
  
  this.writable = true;
  this.readable = true;
  this.paused = false;
  
  if(create) {
    // This is a stream we are creating
    this._write(1, meta, this.id);
  }
}

util.inherits(BinaryStream, Stream);


BinaryStream.prototype._onClose = function() {
  // Emit close event
  this.readable = false;
  this.writable = false;
  this.emit('close');
};

// Write stream

BinaryStream.prototype._onPause = function() {
  // Emit pause event
  this.emit('pause');
  this.paused = true;
};

BinaryStream.prototype._onResume = function() {
  // Emit resume event
  this.emit('resume');
  this.emit('drain');
  this.paused = false;
};

BinaryStream.prototype._write = function(code, data, bonus, cb) {
  var message = util.pack([code, data, bonus]);
  return this._socket.send(message, {binary: true}, cb) !== false;
};

BinaryStream.prototype.write = function(data, cb) {
  if(this.writable) {
    var out = this._write(2, data, this.id, cb);
    return !this.paused && out;
  } else {
    throw new Error('Stream is not writable');
  }
};

BinaryStream.prototype.end = function() {
  this.readable = false;
  this._write(5, null, this.id);
};

BinaryStream.prototype.destroy = BinaryStream.prototype.destroySoon = function() {
  this.readable = false;
  this.writable = false;
  this._write(6, null, this.id);
};


// Read stream

BinaryStream.prototype._onEnd = function() {
  this.readable = false;
  this.emit('end');
};

BinaryStream.prototype._onData = function(data) {
  // Dispatch 
  if(this.readable) {
    this.emit('data', data);
  }
};

BinaryStream.prototype.pause = function() {
  this._onPause();
  this._write(3, null, this.id);
};

BinaryStream.prototype.resume = function() {
  this._onResume();
  this._write(4, null, this.id);
};


function BinaryClient(socket, options) {
  if (!(this instanceof BinaryClient)) return new BinaryClient(options);
  
  EventEmitter.call(this);
  
  var self = this;
  
  this._options = util.extend({
    chunkSize: 40960
  }, options);
  
  this._streams = {};
  
  // Use even numbered ids for client orignated streams
  this._nextId = 0;
  
  
  if(typeof socket === 'string') {
    this._socket = new WebSocket(socket);
  } else {
    this._socket = socket;
  }
  
  this._socket.binaryType = 'arraybuffer';
  
  this._socket.addEventListener('open', function(){
    self.emit('open');
  });
  this._socket.addEventListener('error', function(error){
    self.emit('error', error);
  });
  this._socket.addEventListener('close', function(code, message){
    self.emit('close', code, message);
  });
  this._socket.addEventListener('message', function(data, flags){
    util.setZeroTimeout(function(){
  
      // Message format
      // [type, payload, bonus ]
      //
      // Reserved
      // [ 0  , X , X ]
      // 
      //
      // New stream
      // [ 1  , Meta , new streamId ]
      // 
      //
      // Data
      // [ 2  , Data , streamId ]
      // 
      //
      // Pause
      // [ 3  , null , streamId ]
      // 
      //
      // Resume
      // [ 4  , null , streamId ]
      // 
      //
      // End
      // [ 5  , null , streamId ]
      // 
      //
      // Close
      // [ 6  , null , streamId ]
      // 
      
      if(data.hasOwnProperty('data')){
        data = data.data;
      }
      
      data = util.unpack(data);
      switch(data[0]) {
        case 0:
          // Reserved
          break;
        case 1:
          var meta = data[1];
          var streamId = data[2];
          var binaryStream = self._receiveStream(streamId);
          self.emit('stream', binaryStream, meta);
          break;
        case 2:
          var payload = data[1];
          var streamId = data[2];
          var binaryStream = self._streams[streamId];
          if(binaryStream) {
            binaryStream._onData(payload);
          } else {
            self.emit('error', 'Received `data` message for unknown stream: ' + streamId);
          }
          break;
        case 3:
          var streamId = data[2];
          var binaryStream = self._streams[streamId];
          if(binaryStream) {
            binaryStream._onPause();
          } else {
            self.emit('error', 'Received `pause` message for unknown stream: ' + streamId);
          }
          break;
        case 4:
          var streamId = data[2];
          var binaryStream = self._streams[streamId];
          if(binaryStream) {
            binaryStream._onResume();
          } else {
            self.emit('error', 'Received `resume` message for unknown stream: ' + streamId);
          }
          break;
        case 5:
          var streamId = data[2];
          var binaryStream = self._streams[streamId];
          if(binaryStream) {
            binaryStream._onEnd();
          } else {
            self.emit('error', 'Received `end` message for unknown stream: ' + streamId);
          }
          break;
        case 6:
          var streamId = data[2];
          var binaryStream = self._streams[streamId];
          if(binaryStream) {
            binaryStream._onClose();
            delete self._streams[streamId];
          } else {
            self.emit('error', 'Received `close` message for unknown stream: ' + streamId);
          }
          break;
        default:
          self.emit('error', 'Unrecognized message type received: ' + data[0]);
      }
    });
    
  });
}

util.inherits(BinaryClient, EventEmitter);

BinaryClient.prototype.send = function(data, meta){
  var stream = this.createStream(meta);
  if(data instanceof Stream) {
    data.pipe(stream);
  } else if (util.isNode === true) {
    if(Buffer.isBuffer(data)) {
      (new BufferReadStream(data, {chunkSize: this._options.chunkSize})).pipe(stream);
    } else {
      stream.write(data);
    } 
  } else if (util.isNode !== true) {
    if(data.constructor == window.Blob) {
      (new BlobReadStream(data, {chunkSize: this._options.chunkSize})).pipe(stream);
    } else if (data.constructor == window.ArrayBuffer) {
      var blob;
      if(binaryFeatures.useArrayBufferView) {
        data = new Uint8Array(data.buffer);
      }
      if(binaryFeatures.useBlobBuilder) {
        var builder = new BlobBuilder();
        builder.append(data);
        blob = builder.getBlob()
      } else {
        blob = new Blob([data]);
      }
      (new BlobReadStream(blob, {chunkSize: this._options.chunkSize})).pipe(stream);
    } else if (typeof data === 'object' && 'BYTES_PER_ELEMENT' in data) {
      var blob;
      if(!binaryFeatures.useArrayBufferView) {
        // Warn
        data = data.buffer;
      }
      if(binaryFeatures.useBlobBuilder) {
        var builder = new BlobBuilder();
        builder.append(data);
        blob = builder.getBlob()
      } else {
        blob = new Blob([data]);
      }
      (new BlobReadStream(blob, {chunkSize: this._options.chunkSize})).pipe(stream);
    } else {
      stream.write(data);
    }
  }
};

BinaryClient.prototype._receiveStream = function(streamId){
  var binaryStream = new BinaryStream(this._socket, streamId, false);
  this._streams[streamId] = binaryStream;
  return binaryStream;
};

BinaryClient.prototype.createStream = function(meta){
  var streamId = this._nextId;
  this._nextId += 2;
  var binaryStream = new BinaryStream(this._socket, streamId, true, meta);
  this._streams[streamId] = binaryStream;
  return binaryStream;
};

BinaryClient.prototype.close = BinaryClient.prototype.destroy = function(code, message) {
  this._socket.close(code, message);
};


exports.BinaryClient = BinaryClient;

})(this);
