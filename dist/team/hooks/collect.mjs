#!/usr/bin/env node
import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS({
  "node_modules/graceful-fs/polyfills.js"(exports, module) {
    var constants = __require("constants");
    var origCwd = process.cwd;
    var cwd = null;
    var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
    process.cwd = function() {
      if (!cwd)
        cwd = origCwd.call(process);
      return cwd;
    };
    try {
      process.cwd();
    } catch (er) {
    }
    if (typeof process.chdir === "function") {
      chdir = process.chdir;
      process.chdir = function(d) {
        cwd = null;
        chdir.call(process, d);
      };
      if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
    }
    var chdir;
    module.exports = patch;
    function patch(fs) {
      if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
        patchLchmod(fs);
      }
      if (!fs.lutimes) {
        patchLutimes(fs);
      }
      fs.chown = chownFix(fs.chown);
      fs.fchown = chownFix(fs.fchown);
      fs.lchown = chownFix(fs.lchown);
      fs.chmod = chmodFix(fs.chmod);
      fs.fchmod = chmodFix(fs.fchmod);
      fs.lchmod = chmodFix(fs.lchmod);
      fs.chownSync = chownFixSync(fs.chownSync);
      fs.fchownSync = chownFixSync(fs.fchownSync);
      fs.lchownSync = chownFixSync(fs.lchownSync);
      fs.chmodSync = chmodFixSync(fs.chmodSync);
      fs.fchmodSync = chmodFixSync(fs.fchmodSync);
      fs.lchmodSync = chmodFixSync(fs.lchmodSync);
      fs.stat = statFix(fs.stat);
      fs.fstat = statFix(fs.fstat);
      fs.lstat = statFix(fs.lstat);
      fs.statSync = statFixSync(fs.statSync);
      fs.fstatSync = statFixSync(fs.fstatSync);
      fs.lstatSync = statFixSync(fs.lstatSync);
      if (fs.chmod && !fs.lchmod) {
        fs.lchmod = function(path, mode, cb) {
          if (cb) process.nextTick(cb);
        };
        fs.lchmodSync = function() {
        };
      }
      if (fs.chown && !fs.lchown) {
        fs.lchown = function(path, uid, gid, cb) {
          if (cb) process.nextTick(cb);
        };
        fs.lchownSync = function() {
        };
      }
      if (platform === "win32") {
        fs.rename = typeof fs.rename !== "function" ? fs.rename : (function(fs$rename) {
          function rename6(from, to, cb) {
            var start = Date.now();
            var backoff = 0;
            fs$rename(from, to, function CB(er) {
              if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
                setTimeout(function() {
                  fs.stat(to, function(stater, st) {
                    if (stater && stater.code === "ENOENT")
                      fs$rename(from, to, CB);
                    else
                      cb(er);
                  });
                }, backoff);
                if (backoff < 100)
                  backoff += 10;
                return;
              }
              if (cb) cb(er);
            });
          }
          if (Object.setPrototypeOf) Object.setPrototypeOf(rename6, fs$rename);
          return rename6;
        })(fs.rename);
      }
      fs.read = typeof fs.read !== "function" ? fs.read : (function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
          var callback;
          if (callback_ && typeof callback_ === "function") {
            var eagCounter = 0;
            callback = function(er, _, __) {
              if (er && er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                return fs$read.call(fs, fd, buffer, offset, length, position, callback);
              }
              callback_.apply(this, arguments);
            };
          }
          return fs$read.call(fs, fd, buffer, offset, length, position, callback);
        }
        if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
        return read;
      })(fs.read);
      fs.readSync = typeof fs.readSync !== "function" ? fs.readSync : /* @__PURE__ */ (function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
          var eagCounter = 0;
          while (true) {
            try {
              return fs$readSync.call(fs, fd, buffer, offset, length, position);
            } catch (er) {
              if (er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                continue;
              }
              throw er;
            }
          }
        };
      })(fs.readSync);
      function patchLchmod(fs2) {
        fs2.lchmod = function(path, mode, callback) {
          fs2.open(
            path,
            constants.O_WRONLY | constants.O_SYMLINK,
            mode,
            function(err, fd) {
              if (err) {
                if (callback) callback(err);
                return;
              }
              fs2.fchmod(fd, mode, function(err2) {
                fs2.close(fd, function(err22) {
                  if (callback) callback(err2 || err22);
                });
              });
            }
          );
        };
        fs2.lchmodSync = function(path, mode) {
          var fd = fs2.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
          var threw = true;
          var ret;
          try {
            ret = fs2.fchmodSync(fd, mode);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs2.closeSync(fd);
              } catch (er) {
              }
            } else {
              fs2.closeSync(fd);
            }
          }
          return ret;
        };
      }
      function patchLutimes(fs2) {
        if (constants.hasOwnProperty("O_SYMLINK") && fs2.futimes) {
          fs2.lutimes = function(path, at, mt, cb) {
            fs2.open(path, constants.O_SYMLINK, function(er, fd) {
              if (er) {
                if (cb) cb(er);
                return;
              }
              fs2.futimes(fd, at, mt, function(er2) {
                fs2.close(fd, function(er22) {
                  if (cb) cb(er2 || er22);
                });
              });
            });
          };
          fs2.lutimesSync = function(path, at, mt) {
            var fd = fs2.openSync(path, constants.O_SYMLINK);
            var ret;
            var threw = true;
            try {
              ret = fs2.futimesSync(fd, at, mt);
              threw = false;
            } finally {
              if (threw) {
                try {
                  fs2.closeSync(fd);
                } catch (er) {
                }
              } else {
                fs2.closeSync(fd);
              }
            }
            return ret;
          };
        } else if (fs2.futimes) {
          fs2.lutimes = function(_a, _b, _c, cb) {
            if (cb) process.nextTick(cb);
          };
          fs2.lutimesSync = function() {
          };
        }
      }
      function chmodFix(orig) {
        if (!orig) return orig;
        return function(target, mode, cb) {
          return orig.call(fs, target, mode, function(er) {
            if (chownErOk(er)) er = null;
            if (cb) cb.apply(this, arguments);
          });
        };
      }
      function chmodFixSync(orig) {
        if (!orig) return orig;
        return function(target, mode) {
          try {
            return orig.call(fs, target, mode);
          } catch (er) {
            if (!chownErOk(er)) throw er;
          }
        };
      }
      function chownFix(orig) {
        if (!orig) return orig;
        return function(target, uid, gid, cb) {
          return orig.call(fs, target, uid, gid, function(er) {
            if (chownErOk(er)) er = null;
            if (cb) cb.apply(this, arguments);
          });
        };
      }
      function chownFixSync(orig) {
        if (!orig) return orig;
        return function(target, uid, gid) {
          try {
            return orig.call(fs, target, uid, gid);
          } catch (er) {
            if (!chownErOk(er)) throw er;
          }
        };
      }
      function statFix(orig) {
        if (!orig) return orig;
        return function(target, options, cb) {
          if (typeof options === "function") {
            cb = options;
            options = null;
          }
          function callback(er, stats) {
            if (stats) {
              if (stats.uid < 0) stats.uid += 4294967296;
              if (stats.gid < 0) stats.gid += 4294967296;
            }
            if (cb) cb.apply(this, arguments);
          }
          return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
        };
      }
      function statFixSync(orig) {
        if (!orig) return orig;
        return function(target, options) {
          var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
          if (stats) {
            if (stats.uid < 0) stats.uid += 4294967296;
            if (stats.gid < 0) stats.gid += 4294967296;
          }
          return stats;
        };
      }
      function chownErOk(er) {
        if (!er)
          return true;
        if (er.code === "ENOSYS")
          return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
          if (er.code === "EINVAL" || er.code === "EPERM")
            return true;
        }
        return false;
      }
    }
  }
});

// node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS({
  "node_modules/graceful-fs/legacy-streams.js"(exports, module) {
    var Stream = __require("stream").Stream;
    module.exports = legacy;
    function legacy(fs) {
      return {
        ReadStream,
        WriteStream
      };
      function ReadStream(path, options) {
        if (!(this instanceof ReadStream)) return new ReadStream(path, options);
        Stream.call(this);
        var self = this;
        this.path = path;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = "r";
        this.mode = 438;
        this.bufferSize = 64 * 1024;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.encoding) this.setEncoding(this.encoding);
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.end === void 0) {
            this.end = Infinity;
          } else if ("number" !== typeof this.end) {
            throw TypeError("end must be a Number");
          }
          if (this.start > this.end) {
            throw new Error("start must be <= end");
          }
          this.pos = this.start;
        }
        if (this.fd !== null) {
          process.nextTick(function() {
            self._read();
          });
          return;
        }
        fs.open(this.path, this.flags, this.mode, function(err, fd) {
          if (err) {
            self.emit("error", err);
            self.readable = false;
            return;
          }
          self.fd = fd;
          self.emit("open", fd);
          self._read();
        });
      }
      function WriteStream(path, options) {
        if (!(this instanceof WriteStream)) return new WriteStream(path, options);
        Stream.call(this);
        this.path = path;
        this.fd = null;
        this.writable = true;
        this.flags = "w";
        this.encoding = "binary";
        this.mode = 438;
        this.bytesWritten = 0;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.start < 0) {
            throw new Error("start must be >= zero");
          }
          this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
          this._open = fs.open;
          this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
          this.flush();
        }
      }
    }
  }
});

// node_modules/graceful-fs/clone.js
var require_clone = __commonJS({
  "node_modules/graceful-fs/clone.js"(exports, module) {
    "use strict";
    module.exports = clone;
    var getPrototypeOf = Object.getPrototypeOf || function(obj) {
      return obj.__proto__;
    };
    function clone(obj) {
      if (obj === null || typeof obj !== "object")
        return obj;
      if (obj instanceof Object)
        var copy = { __proto__: getPrototypeOf(obj) };
      else
        var copy = /* @__PURE__ */ Object.create(null);
      Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
      });
      return copy;
    }
  }
});

// node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS({
  "node_modules/graceful-fs/graceful-fs.js"(exports, module) {
    var fs = __require("fs");
    var polyfills = require_polyfills();
    var legacy = require_legacy_streams();
    var clone = require_clone();
    var util = __require("util");
    var gracefulQueue;
    var previousSymbol;
    if (typeof Symbol === "function" && typeof Symbol.for === "function") {
      gracefulQueue = /* @__PURE__ */ Symbol.for("graceful-fs.queue");
      previousSymbol = /* @__PURE__ */ Symbol.for("graceful-fs.previous");
    } else {
      gracefulQueue = "___graceful-fs.queue";
      previousSymbol = "___graceful-fs.previous";
    }
    function noop() {
    }
    function publishQueue(context, queue2) {
      Object.defineProperty(context, gracefulQueue, {
        get: function() {
          return queue2;
        }
      });
    }
    var debug = noop;
    if (util.debuglog)
      debug = util.debuglog("gfs4");
    else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
      debug = function() {
        var m = util.format.apply(util, arguments);
        m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
        console.error(m);
      };
    if (!fs[gracefulQueue]) {
      queue = global[gracefulQueue] || [];
      publishQueue(fs, queue);
      fs.close = (function(fs$close) {
        function close(fd, cb) {
          return fs$close.call(fs, fd, function(err) {
            if (!err) {
              resetQueue();
            }
            if (typeof cb === "function")
              cb.apply(this, arguments);
          });
        }
        Object.defineProperty(close, previousSymbol, {
          value: fs$close
        });
        return close;
      })(fs.close);
      fs.closeSync = (function(fs$closeSync) {
        function closeSync(fd) {
          fs$closeSync.apply(fs, arguments);
          resetQueue();
        }
        Object.defineProperty(closeSync, previousSymbol, {
          value: fs$closeSync
        });
        return closeSync;
      })(fs.closeSync);
      if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
        process.on("exit", function() {
          debug(fs[gracefulQueue]);
          __require("assert").equal(fs[gracefulQueue].length, 0);
        });
      }
    }
    var queue;
    if (!global[gracefulQueue]) {
      publishQueue(global, fs[gracefulQueue]);
    }
    module.exports = patch(clone(fs));
    if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
      module.exports = patch(fs);
      fs.__patched = true;
    }
    function patch(fs2) {
      polyfills(fs2);
      fs2.gracefulify = patch;
      fs2.createReadStream = createReadStream;
      fs2.createWriteStream = createWriteStream;
      var fs$readFile = fs2.readFile;
      fs2.readFile = readFile7;
      function readFile7(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$readFile(path, options, cb);
        function go$readFile(path2, options2, cb2, startTime) {
          return fs$readFile(path2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$readFile, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$writeFile = fs2.writeFile;
      fs2.writeFile = writeFile8;
      function writeFile8(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$writeFile(path, data, options, cb);
        function go$writeFile(path2, data2, options2, cb2, startTime) {
          return fs$writeFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$writeFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$appendFile = fs2.appendFile;
      if (fs$appendFile)
        fs2.appendFile = appendFile;
      function appendFile(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$appendFile(path, data, options, cb);
        function go$appendFile(path2, data2, options2, cb2, startTime) {
          return fs$appendFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$appendFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$copyFile = fs2.copyFile;
      if (fs$copyFile)
        fs2.copyFile = copyFile;
      function copyFile(src, dest, flags, cb) {
        if (typeof flags === "function") {
          cb = flags;
          flags = 0;
        }
        return go$copyFile(src, dest, flags, cb);
        function go$copyFile(src2, dest2, flags2, cb2, startTime) {
          return fs$copyFile(src2, dest2, flags2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$readdir = fs2.readdir;
      fs2.readdir = readdir;
      var noReaddirOptionVersions = /^v[0-5]\./;
      function readdir(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path2, options2, cb2, startTime) {
          return fs$readdir(path2, fs$readdirCallback(
            path2,
            options2,
            cb2,
            startTime
          ));
        } : function go$readdir2(path2, options2, cb2, startTime) {
          return fs$readdir(path2, options2, fs$readdirCallback(
            path2,
            options2,
            cb2,
            startTime
          ));
        };
        return go$readdir(path, options, cb);
        function fs$readdirCallback(path2, options2, cb2, startTime) {
          return function(err, files) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([
                go$readdir,
                [path2, options2, cb2],
                err,
                startTime || Date.now(),
                Date.now()
              ]);
            else {
              if (files && files.sort)
                files.sort();
              if (typeof cb2 === "function")
                cb2.call(this, err, files);
            }
          };
        }
      }
      if (process.version.substr(0, 4) === "v0.8") {
        var legStreams = legacy(fs2);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
      }
      var fs$ReadStream = fs2.ReadStream;
      if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
      }
      var fs$WriteStream = fs2.WriteStream;
      if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
      }
      Object.defineProperty(fs2, "ReadStream", {
        get: function() {
          return ReadStream;
        },
        set: function(val) {
          ReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(fs2, "WriteStream", {
        get: function() {
          return WriteStream;
        },
        set: function(val) {
          WriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileReadStream = ReadStream;
      Object.defineProperty(fs2, "FileReadStream", {
        get: function() {
          return FileReadStream;
        },
        set: function(val) {
          FileReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileWriteStream = WriteStream;
      Object.defineProperty(fs2, "FileWriteStream", {
        get: function() {
          return FileWriteStream;
        },
        set: function(val) {
          FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      function ReadStream(path, options) {
        if (this instanceof ReadStream)
          return fs$ReadStream.apply(this, arguments), this;
        else
          return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
      }
      function ReadStream$open() {
        var that = this;
        open4(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            if (that.autoClose)
              that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
            that.read();
          }
        });
      }
      function WriteStream(path, options) {
        if (this instanceof WriteStream)
          return fs$WriteStream.apply(this, arguments), this;
        else
          return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
      }
      function WriteStream$open() {
        var that = this;
        open4(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
          }
        });
      }
      function createReadStream(path, options) {
        return new fs2.ReadStream(path, options);
      }
      function createWriteStream(path, options) {
        return new fs2.WriteStream(path, options);
      }
      var fs$open = fs2.open;
      fs2.open = open4;
      function open4(path, flags, mode, cb) {
        if (typeof mode === "function")
          cb = mode, mode = null;
        return go$open(path, flags, mode, cb);
        function go$open(path2, flags2, mode2, cb2, startTime) {
          return fs$open(path2, flags2, mode2, function(err, fd) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$open, [path2, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      return fs2;
    }
    function enqueue(elem) {
      debug("ENQUEUE", elem[0].name, elem[1]);
      fs[gracefulQueue].push(elem);
      retry();
    }
    var retryTimer;
    function resetQueue() {
      var now = Date.now();
      for (var i = 0; i < fs[gracefulQueue].length; ++i) {
        if (fs[gracefulQueue][i].length > 2) {
          fs[gracefulQueue][i][3] = now;
          fs[gracefulQueue][i][4] = now;
        }
      }
      retry();
    }
    function retry() {
      clearTimeout(retryTimer);
      retryTimer = void 0;
      if (fs[gracefulQueue].length === 0)
        return;
      var elem = fs[gracefulQueue].shift();
      var fn = elem[0];
      var args = elem[1];
      var err = elem[2];
      var startTime = elem[3];
      var lastTime = elem[4];
      if (startTime === void 0) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args);
      } else if (Date.now() - startTime >= 6e4) {
        debug("TIMEOUT", fn.name, args);
        var cb = args.pop();
        if (typeof cb === "function")
          cb.call(null, err);
      } else {
        var sinceAttempt = Date.now() - lastTime;
        var sinceStart = Math.max(lastTime - startTime, 1);
        var desiredDelay = Math.min(sinceStart * 1.2, 100);
        if (sinceAttempt >= desiredDelay) {
          debug("RETRY", fn.name, args);
          fn.apply(null, args.concat([startTime]));
        } else {
          fs[gracefulQueue].push(elem);
        }
      }
      if (retryTimer === void 0) {
        retryTimer = setTimeout(retry, 0);
      }
    }
  }
});

// node_modules/retry/lib/retry_operation.js
var require_retry_operation = __commonJS({
  "node_modules/retry/lib/retry_operation.js"(exports, module) {
    function RetryOperation(timeouts, options) {
      if (typeof options === "boolean") {
        options = { forever: options };
      }
      this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
      this._timeouts = timeouts;
      this._options = options || {};
      this._maxRetryTime = options && options.maxRetryTime || Infinity;
      this._fn = null;
      this._errors = [];
      this._attempts = 1;
      this._operationTimeout = null;
      this._operationTimeoutCb = null;
      this._timeout = null;
      this._operationStart = null;
      if (this._options.forever) {
        this._cachedTimeouts = this._timeouts.slice(0);
      }
    }
    module.exports = RetryOperation;
    RetryOperation.prototype.reset = function() {
      this._attempts = 1;
      this._timeouts = this._originalTimeouts;
    };
    RetryOperation.prototype.stop = function() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      this._timeouts = [];
      this._cachedTimeouts = null;
    };
    RetryOperation.prototype.retry = function(err) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (!err) {
        return false;
      }
      var currentTime = (/* @__PURE__ */ new Date()).getTime();
      if (err && currentTime - this._operationStart >= this._maxRetryTime) {
        this._errors.unshift(new Error("RetryOperation timeout occurred"));
        return false;
      }
      this._errors.push(err);
      var timeout = this._timeouts.shift();
      if (timeout === void 0) {
        if (this._cachedTimeouts) {
          this._errors.splice(this._errors.length - 1, this._errors.length);
          this._timeouts = this._cachedTimeouts.slice(0);
          timeout = this._timeouts.shift();
        } else {
          return false;
        }
      }
      var self = this;
      var timer = setTimeout(function() {
        self._attempts++;
        if (self._operationTimeoutCb) {
          self._timeout = setTimeout(function() {
            self._operationTimeoutCb(self._attempts);
          }, self._operationTimeout);
          if (self._options.unref) {
            self._timeout.unref();
          }
        }
        self._fn(self._attempts);
      }, timeout);
      if (this._options.unref) {
        timer.unref();
      }
      return true;
    };
    RetryOperation.prototype.attempt = function(fn, timeoutOps) {
      this._fn = fn;
      if (timeoutOps) {
        if (timeoutOps.timeout) {
          this._operationTimeout = timeoutOps.timeout;
        }
        if (timeoutOps.cb) {
          this._operationTimeoutCb = timeoutOps.cb;
        }
      }
      var self = this;
      if (this._operationTimeoutCb) {
        this._timeout = setTimeout(function() {
          self._operationTimeoutCb();
        }, self._operationTimeout);
      }
      this._operationStart = (/* @__PURE__ */ new Date()).getTime();
      this._fn(this._attempts);
    };
    RetryOperation.prototype.try = function(fn) {
      console.log("Using RetryOperation.try() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = function(fn) {
      console.log("Using RetryOperation.start() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = RetryOperation.prototype.try;
    RetryOperation.prototype.errors = function() {
      return this._errors;
    };
    RetryOperation.prototype.attempts = function() {
      return this._attempts;
    };
    RetryOperation.prototype.mainError = function() {
      if (this._errors.length === 0) {
        return null;
      }
      var counts = {};
      var mainError = null;
      var mainErrorCount = 0;
      for (var i = 0; i < this._errors.length; i++) {
        var error = this._errors[i];
        var message = error.message;
        var count = (counts[message] || 0) + 1;
        counts[message] = count;
        if (count >= mainErrorCount) {
          mainError = error;
          mainErrorCount = count;
        }
      }
      return mainError;
    };
  }
});

// node_modules/retry/lib/retry.js
var require_retry = __commonJS({
  "node_modules/retry/lib/retry.js"(exports) {
    var RetryOperation = require_retry_operation();
    exports.operation = function(options) {
      var timeouts = exports.timeouts(options);
      return new RetryOperation(timeouts, {
        forever: options && options.forever,
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime
      });
    };
    exports.timeouts = function(options) {
      if (options instanceof Array) {
        return [].concat(options);
      }
      var opts = {
        retries: 10,
        factor: 2,
        minTimeout: 1 * 1e3,
        maxTimeout: Infinity,
        randomize: false
      };
      for (var key in options) {
        opts[key] = options[key];
      }
      if (opts.minTimeout > opts.maxTimeout) {
        throw new Error("minTimeout is greater than maxTimeout");
      }
      var timeouts = [];
      for (var i = 0; i < opts.retries; i++) {
        timeouts.push(this.createTimeout(i, opts));
      }
      if (options && options.forever && !timeouts.length) {
        timeouts.push(this.createTimeout(i, opts));
      }
      timeouts.sort(function(a, b) {
        return a - b;
      });
      return timeouts;
    };
    exports.createTimeout = function(attempt, opts) {
      var random = opts.randomize ? Math.random() + 1 : 1;
      var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
      timeout = Math.min(timeout, opts.maxTimeout);
      return timeout;
    };
    exports.wrap = function(obj, options, methods) {
      if (options instanceof Array) {
        methods = options;
        options = null;
      }
      if (!methods) {
        methods = [];
        for (var key in obj) {
          if (typeof obj[key] === "function") {
            methods.push(key);
          }
        }
      }
      for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        var original = obj[method];
        obj[method] = function retryWrapper(original2) {
          var op = exports.operation(options);
          var args = Array.prototype.slice.call(arguments, 1);
          var callback = args.pop();
          args.push(function(err) {
            if (op.retry(err)) {
              return;
            }
            if (err) {
              arguments[0] = op.mainError();
            }
            callback.apply(this, arguments);
          });
          op.attempt(function() {
            original2.apply(obj, args);
          });
        }.bind(obj, original);
        obj[method].options = options;
      }
    };
  }
});

// node_modules/retry/index.js
var require_retry2 = __commonJS({
  "node_modules/retry/index.js"(exports, module) {
    module.exports = require_retry();
  }
});

// node_modules/proper-lockfile/node_modules/signal-exit/signals.js
var require_signals = __commonJS({
  "node_modules/proper-lockfile/node_modules/signal-exit/signals.js"(exports, module) {
    module.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  }
});

// node_modules/proper-lockfile/node_modules/signal-exit/index.js
var require_signal_exit = __commonJS({
  "node_modules/proper-lockfile/node_modules/signal-exit/index.js"(exports, module) {
    var process2 = global.process;
    var processOk = function(process3) {
      return process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
    };
    if (!processOk(process2)) {
      module.exports = function() {
        return function() {
        };
      };
    } else {
      assert = __require("assert");
      signals = require_signals();
      isWin = /^win/i.test(process2.platform);
      EE = __require("events");
      if (typeof EE !== "function") {
        EE = EE.EventEmitter;
      }
      if (process2.__signal_exit_emitter__) {
        emitter = process2.__signal_exit_emitter__;
      } else {
        emitter = process2.__signal_exit_emitter__ = new EE();
        emitter.count = 0;
        emitter.emitted = {};
      }
      if (!emitter.infinite) {
        emitter.setMaxListeners(Infinity);
        emitter.infinite = true;
      }
      module.exports = function(cb, opts) {
        if (!processOk(global.process)) {
          return function() {
          };
        }
        assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
        if (loaded === false) {
          load();
        }
        var ev = "exit";
        if (opts && opts.alwaysLast) {
          ev = "afterexit";
        }
        var remove = function() {
          emitter.removeListener(ev, cb);
          if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
            unload();
          }
        };
        emitter.on(ev, cb);
        return remove;
      };
      unload = function unload2() {
        if (!loaded || !processOk(global.process)) {
          return;
        }
        loaded = false;
        signals.forEach(function(sig) {
          try {
            process2.removeListener(sig, sigListeners[sig]);
          } catch (er) {
          }
        });
        process2.emit = originalProcessEmit;
        process2.reallyExit = originalProcessReallyExit;
        emitter.count -= 1;
      };
      module.exports.unload = unload;
      emit = function emit2(event, code, signal) {
        if (emitter.emitted[event]) {
          return;
        }
        emitter.emitted[event] = true;
        emitter.emit(event, code, signal);
      };
      sigListeners = {};
      signals.forEach(function(sig) {
        sigListeners[sig] = function listener() {
          if (!processOk(global.process)) {
            return;
          }
          var listeners = process2.listeners(sig);
          if (listeners.length === emitter.count) {
            unload();
            emit("exit", null, sig);
            emit("afterexit", null, sig);
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process2.kill(process2.pid, sig);
          }
        };
      });
      module.exports.signals = function() {
        return signals;
      };
      loaded = false;
      load = function load2() {
        if (loaded || !processOk(global.process)) {
          return;
        }
        loaded = true;
        emitter.count += 1;
        signals = signals.filter(function(sig) {
          try {
            process2.on(sig, sigListeners[sig]);
            return true;
          } catch (er) {
            return false;
          }
        });
        process2.emit = processEmit;
        process2.reallyExit = processReallyExit;
      };
      module.exports.load = load;
      originalProcessReallyExit = process2.reallyExit;
      processReallyExit = function processReallyExit2(code) {
        if (!processOk(global.process)) {
          return;
        }
        process2.exitCode = code || /* istanbul ignore next */
        0;
        emit("exit", process2.exitCode, null);
        emit("afterexit", process2.exitCode, null);
        originalProcessReallyExit.call(process2, process2.exitCode);
      };
      originalProcessEmit = process2.emit;
      processEmit = function processEmit2(ev, arg) {
        if (ev === "exit" && processOk(global.process)) {
          if (arg !== void 0) {
            process2.exitCode = arg;
          }
          var ret = originalProcessEmit.apply(this, arguments);
          emit("exit", process2.exitCode, null);
          emit("afterexit", process2.exitCode, null);
          return ret;
        } else {
          return originalProcessEmit.apply(this, arguments);
        }
      };
    }
    var assert;
    var signals;
    var isWin;
    var EE;
    var emitter;
    var unload;
    var emit;
    var sigListeners;
    var loaded;
    var load;
    var originalProcessReallyExit;
    var processReallyExit;
    var originalProcessEmit;
    var processEmit;
  }
});

// node_modules/proper-lockfile/lib/mtime-precision.js
var require_mtime_precision = __commonJS({
  "node_modules/proper-lockfile/lib/mtime-precision.js"(exports, module) {
    "use strict";
    var cacheSymbol = /* @__PURE__ */ Symbol();
    function probe(file, fs, callback) {
      const cachedPrecision = fs[cacheSymbol];
      if (cachedPrecision) {
        return fs.stat(file, (err, stat2) => {
          if (err) {
            return callback(err);
          }
          callback(null, stat2.mtime, cachedPrecision);
        });
      }
      const mtime = new Date(Math.ceil(Date.now() / 1e3) * 1e3 + 5);
      fs.utimes(file, mtime, mtime, (err) => {
        if (err) {
          return callback(err);
        }
        fs.stat(file, (err2, stat2) => {
          if (err2) {
            return callback(err2);
          }
          const precision = stat2.mtime.getTime() % 1e3 === 0 ? "s" : "ms";
          Object.defineProperty(fs, cacheSymbol, { value: precision });
          callback(null, stat2.mtime, precision);
        });
      });
    }
    function getMtime(precision) {
      let now = Date.now();
      if (precision === "s") {
        now = Math.ceil(now / 1e3) * 1e3;
      }
      return new Date(now);
    }
    module.exports.probe = probe;
    module.exports.getMtime = getMtime;
  }
});

// node_modules/proper-lockfile/lib/lockfile.js
var require_lockfile = __commonJS({
  "node_modules/proper-lockfile/lib/lockfile.js"(exports, module) {
    "use strict";
    var path = __require("path");
    var fs = require_graceful_fs();
    var retry = require_retry2();
    var onExit = require_signal_exit();
    var mtimePrecision = require_mtime_precision();
    var locks = {};
    function getLockFile(file, options) {
      return options.lockfilePath || `${file}.lock`;
    }
    function resolveCanonicalPath(file, options, callback) {
      if (!options.realpath) {
        return callback(null, path.resolve(file));
      }
      options.fs.realpath(file, callback);
    }
    function acquireLock(file, options, callback) {
      const lockfilePath = getLockFile(file, options);
      options.fs.mkdir(lockfilePath, (err) => {
        if (!err) {
          return mtimePrecision.probe(lockfilePath, options.fs, (err2, mtime, mtimePrecision2) => {
            if (err2) {
              options.fs.rmdir(lockfilePath, () => {
              });
              return callback(err2);
            }
            callback(null, mtime, mtimePrecision2);
          });
        }
        if (err.code !== "EEXIST") {
          return callback(err);
        }
        if (options.stale <= 0) {
          return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
        }
        options.fs.stat(lockfilePath, (err2, stat2) => {
          if (err2) {
            if (err2.code === "ENOENT") {
              return acquireLock(file, { ...options, stale: 0 }, callback);
            }
            return callback(err2);
          }
          if (!isLockStale(stat2, options)) {
            return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
          }
          removeLock(file, options, (err3) => {
            if (err3) {
              return callback(err3);
            }
            acquireLock(file, { ...options, stale: 0 }, callback);
          });
        });
      });
    }
    function isLockStale(stat2, options) {
      return stat2.mtime.getTime() < Date.now() - options.stale;
    }
    function removeLock(file, options, callback) {
      options.fs.rmdir(getLockFile(file, options), (err) => {
        if (err && err.code !== "ENOENT") {
          return callback(err);
        }
        callback();
      });
    }
    function updateLock(file, options) {
      const lock2 = locks[file];
      if (lock2.updateTimeout) {
        return;
      }
      lock2.updateDelay = lock2.updateDelay || options.update;
      lock2.updateTimeout = setTimeout(() => {
        lock2.updateTimeout = null;
        options.fs.stat(lock2.lockfilePath, (err, stat2) => {
          const isOverThreshold = lock2.lastUpdate + options.stale < Date.now();
          if (err) {
            if (err.code === "ENOENT" || isOverThreshold) {
              return setLockAsCompromised(file, lock2, Object.assign(err, { code: "ECOMPROMISED" }));
            }
            lock2.updateDelay = 1e3;
            return updateLock(file, options);
          }
          const isMtimeOurs = lock2.mtime.getTime() === stat2.mtime.getTime();
          if (!isMtimeOurs) {
            return setLockAsCompromised(
              file,
              lock2,
              Object.assign(
                new Error("Unable to update lock within the stale threshold"),
                { code: "ECOMPROMISED" }
              )
            );
          }
          const mtime = mtimePrecision.getMtime(lock2.mtimePrecision);
          options.fs.utimes(lock2.lockfilePath, mtime, mtime, (err2) => {
            const isOverThreshold2 = lock2.lastUpdate + options.stale < Date.now();
            if (lock2.released) {
              return;
            }
            if (err2) {
              if (err2.code === "ENOENT" || isOverThreshold2) {
                return setLockAsCompromised(file, lock2, Object.assign(err2, { code: "ECOMPROMISED" }));
              }
              lock2.updateDelay = 1e3;
              return updateLock(file, options);
            }
            lock2.mtime = mtime;
            lock2.lastUpdate = Date.now();
            lock2.updateDelay = null;
            updateLock(file, options);
          });
        });
      }, lock2.updateDelay);
      if (lock2.updateTimeout.unref) {
        lock2.updateTimeout.unref();
      }
    }
    function setLockAsCompromised(file, lock2, err) {
      lock2.released = true;
      if (lock2.updateTimeout) {
        clearTimeout(lock2.updateTimeout);
      }
      if (locks[file] === lock2) {
        delete locks[file];
      }
      lock2.options.onCompromised(err);
    }
    function lock(file, options, callback) {
      options = {
        stale: 1e4,
        update: null,
        realpath: true,
        retries: 0,
        fs,
        onCompromised: (err) => {
          throw err;
        },
        ...options
      };
      options.retries = options.retries || 0;
      options.retries = typeof options.retries === "number" ? { retries: options.retries } : options.retries;
      options.stale = Math.max(options.stale || 0, 2e3);
      options.update = options.update == null ? options.stale / 2 : options.update || 0;
      options.update = Math.max(Math.min(options.update, options.stale / 2), 1e3);
      resolveCanonicalPath(file, options, (err, file2) => {
        if (err) {
          return callback(err);
        }
        const operation = retry.operation(options.retries);
        operation.attempt(() => {
          acquireLock(file2, options, (err2, mtime, mtimePrecision2) => {
            if (operation.retry(err2)) {
              return;
            }
            if (err2) {
              return callback(operation.mainError());
            }
            const lock2 = locks[file2] = {
              lockfilePath: getLockFile(file2, options),
              mtime,
              mtimePrecision: mtimePrecision2,
              options,
              lastUpdate: Date.now()
            };
            updateLock(file2, options);
            callback(null, (releasedCallback) => {
              if (lock2.released) {
                return releasedCallback && releasedCallback(Object.assign(new Error("Lock is already released"), { code: "ERELEASED" }));
              }
              unlock(file2, { ...options, realpath: false }, releasedCallback);
            });
          });
        });
      });
    }
    function unlock(file, options, callback) {
      options = {
        fs,
        realpath: true,
        ...options
      };
      resolveCanonicalPath(file, options, (err, file2) => {
        if (err) {
          return callback(err);
        }
        const lock2 = locks[file2];
        if (!lock2) {
          return callback(Object.assign(new Error("Lock is not acquired/owned by you"), { code: "ENOTACQUIRED" }));
        }
        lock2.updateTimeout && clearTimeout(lock2.updateTimeout);
        lock2.released = true;
        delete locks[file2];
        removeLock(file2, options, callback);
      });
    }
    function check(file, options, callback) {
      options = {
        stale: 1e4,
        realpath: true,
        fs,
        ...options
      };
      options.stale = Math.max(options.stale || 0, 2e3);
      resolveCanonicalPath(file, options, (err, file2) => {
        if (err) {
          return callback(err);
        }
        options.fs.stat(getLockFile(file2, options), (err2, stat2) => {
          if (err2) {
            return err2.code === "ENOENT" ? callback(null, false) : callback(err2);
          }
          return callback(null, !isLockStale(stat2, options));
        });
      });
    }
    function getLocks() {
      return locks;
    }
    onExit(() => {
      for (const file in locks) {
        const options = locks[file].options;
        try {
          options.fs.rmdirSync(getLockFile(file, options));
        } catch (e) {
        }
      }
    });
    module.exports.lock = lock;
    module.exports.unlock = unlock;
    module.exports.check = check;
    module.exports.getLocks = getLocks;
  }
});

// node_modules/proper-lockfile/lib/adapter.js
var require_adapter = __commonJS({
  "node_modules/proper-lockfile/lib/adapter.js"(exports, module) {
    "use strict";
    var fs = require_graceful_fs();
    function createSyncFs(fs2) {
      const methods = ["mkdir", "realpath", "stat", "rmdir", "utimes"];
      const newFs = { ...fs2 };
      methods.forEach((method) => {
        newFs[method] = (...args) => {
          const callback = args.pop();
          let ret;
          try {
            ret = fs2[`${method}Sync`](...args);
          } catch (err) {
            return callback(err);
          }
          callback(null, ret);
        };
      });
      return newFs;
    }
    function toPromise(method) {
      return (...args) => new Promise((resolve, reject) => {
        args.push((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
        method(...args);
      });
    }
    function toSync(method) {
      return (...args) => {
        let err;
        let result;
        args.push((_err, _result) => {
          err = _err;
          result = _result;
        });
        method(...args);
        if (err) {
          throw err;
        }
        return result;
      };
    }
    function toSyncOptions(options) {
      options = { ...options };
      options.fs = createSyncFs(options.fs || fs);
      if (typeof options.retries === "number" && options.retries > 0 || options.retries && typeof options.retries.retries === "number" && options.retries.retries > 0) {
        throw Object.assign(new Error("Cannot use retries with the sync api"), { code: "ESYNC" });
      }
      return options;
    }
    module.exports = {
      toPromise,
      toSync,
      toSyncOptions
    };
  }
});

// node_modules/proper-lockfile/index.js
var require_proper_lockfile = __commonJS({
  "node_modules/proper-lockfile/index.js"(exports, module) {
    "use strict";
    var lockfile5 = require_lockfile();
    var { toPromise, toSync, toSyncOptions } = require_adapter();
    async function lock(file, options) {
      const release = await toPromise(lockfile5.lock)(file, options);
      return toPromise(release);
    }
    function lockSync(file, options) {
      const release = toSync(lockfile5.lock)(file, toSyncOptions(options));
      return toSync(release);
    }
    function unlock(file, options) {
      return toPromise(lockfile5.unlock)(file, options);
    }
    function unlockSync(file, options) {
      return toSync(lockfile5.unlock)(file, toSyncOptions(options));
    }
    function check(file, options) {
      return toPromise(lockfile5.check)(file, options);
    }
    function checkSync(file, options) {
      return toSync(lockfile5.check)(file, toSyncOptions(options));
    }
    module.exports = lock;
    module.exports.lock = lock;
    module.exports.unlock = unlock;
    module.exports.lockSync = lockSync;
    module.exports.unlockSync = unlockSync;
    module.exports.check = check;
    module.exports.checkSync = checkSync;
  }
});

// dist/team/hooks/collect.mjs
import { readFileSync } from "node:fs";
import { mkdir as mkdir5, writeFile as writeFile7 } from "node:fs/promises";
import { join as join8 } from "node:path";
import { homedir } from "node:os";

// dist/team/lib/config.mjs
function loadConfig() {
  const apiKey = process.env.FANCYSAUCE_API_KEY;
  const endpoint = process.env.FANCYSAUCE_ENDPOINT;
  if (!apiKey || !endpoint)
    return null;
  if (!endpoint.startsWith("https://")) {
    if (process.env.FANCYSAUCE_ALLOW_INSECURE_ENDPOINT !== "true")
      return null;
  }
  const team = process.env.FANCYSAUCE_TEAM || void 0;
  const disclosure = process.env.FANCYSAUCE_DISCLOSURE_NOTIFICATION === "enabled";
  const shipRepoUrl = process.env.FANCYSAUCE_SHIP_REPO_URL === "true";
  const importHistory = process.env.FANCYSAUCE_IMPORT_HISTORY === "enabled";
  const importSince = process.env.FANCYSAUCE_IMPORT_HISTORY_SINCE || void 0;
  return {
    apiKey,
    endpoint,
    team,
    disclosure,
    shipRepoUrl,
    importHistory,
    importSince
  };
}

// dist/team/lib/stable-stringify.mjs
function stableStringify(value) {
  if (value === null || typeof value !== "object")
    return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }
  const obj = value;
  const keys = Object.keys(obj).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}

// dist/team/lib/event-mapper.mjs
var HOOK_TO_EVENT_TYPE = {
  SessionStart: "session.start",
  SessionEnd: "session.end",
  UserPromptSubmit: "prompt.submit",
  PreToolUse: "tool_call.start",
  PostToolUse: "tool_call.complete",
  PostToolUseFailure: "tool_call.failed",
  SubagentStart: "subagent.start",
  SubagentStop: "subagent.complete",
  Stop: "stop",
  PreCompact: "compaction.before",
  ConfigChange: "config.changed",
  Notification: "notification",
  TaskCompleted: "task.completed",
  PermissionRequest: "permission.request"
};
var TOOL_HOOKS = /* @__PURE__ */ new Set([
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure"
]);
function mapHookToEvent(input, sequence) {
  const eventType = HOOK_TO_EVENT_TYPE[input.hook_event_name];
  if (!eventType) {
    throw new Error(`Unknown hook_event_name: ${String(input.hook_event_name)}`);
  }
  const attributes = {};
  if (TOOL_HOOKS.has(input.hook_event_name)) {
    if (input.tool_name)
      attributes.tool_name = input.tool_name;
    if (input.tool_input !== void 0) {
      attributes.tool_input_raw = stableStringify(input.tool_input);
    }
    if (input.tool_response !== void 0) {
      attributes.tool_response_raw = stableStringify(input.tool_response);
    }
    if (input.tool_use_id)
      attributes.correlation_id = input.tool_use_id;
  } else {
    if (input.cwd)
      attributes.cwd = input.cwd;
    if (input.permission_mode)
      attributes.permission_mode = input.permission_mode;
    if (input.model)
      attributes.model = input.model;
    if (input.agent_id)
      attributes.agent_id = input.agent_id;
    if (input.agent_type)
      attributes.agent_type = input.agent_type;
    if (input.notification_type)
      attributes.notification_type = input.notification_type;
    if (input.task_id)
      attributes.task_id = input.task_id;
    if (input.reason)
      attributes.reason = input.reason;
    if (input.hook_event_name === "UserPromptSubmit") {
      const prompt = typeof input.prompt === "string" ? input.prompt : "";
      attributes.prompt_length = Buffer.byteLength(prompt, "utf8");
    }
  }
  return {
    event_uuid: "",
    // content-filter populates
    event_type: eventType,
    session_id: input.session_id,
    source: `hook.${input.hook_event_name}`,
    sequence,
    timestamp_ns: BigInt(Date.now()) * 1000000n,
    attributes
  };
}

// dist/team/lib/content-filter.mjs
import { createHash, randomUUID } from "node:crypto";
var MAX_SERIALIZED_BYTES = 4096;
var rules = {
  "session.start": keep(["cwd", "model", "permission_mode", "fancysauce.repo_url_hash"]),
  "session.end": keep(["reason", "duration_wall_s"]),
  "prompt.submit": (a) => ({ prompt_length: numericOr(a.prompt_length, 0) }),
  "tool_call.start": toolCallStart,
  "tool_call.complete": toolCallComplete,
  "tool_call.failed": toolCallFailed,
  "subagent.start": keep(["agent_id", "agent_type"]),
  "subagent.complete": keep(["agent_id", "agent_type", "duration_wall_s"]),
  "stop": () => ({}),
  "permission.request": () => ({}),
  "notification": keep(["notification_type"]),
  "task.completed": keep(["task_id"]),
  "compaction.before": () => ({}),
  "compaction.after": () => ({}),
  "config.changed": () => ({}),
  "api.request": keep([
    "cost_usd",
    "tokens_input",
    "tokens_output",
    "tokens_cache_read",
    "tokens_cache_create",
    "tokens_cache_create_5m",
    "tokens_cache_create_1h",
    "model",
    "request_id",
    "transcript_message_uuid"
  ])
};
function keep(names) {
  const set = new Set(names);
  return (attrs) => {
    const out = {};
    for (const [k, v] of Object.entries(attrs)) {
      if (set.has(k))
        out[k] = v;
    }
    return out;
  };
}
function toolCallStart(a) {
  const rawInput = typeof a.tool_input_raw === "string" ? a.tool_input_raw : "";
  return {
    tool_name: asString(a.tool_name),
    tool_input_hash: sha256Hex(rawInput),
    input_size_bytes: Buffer.byteLength(rawInput, "utf8"),
    correlation_id: asString(a.correlation_id)
  };
}
function toolCallComplete(a) {
  const rawInput = typeof a.tool_input_raw === "string" ? a.tool_input_raw : "";
  const rawResponse = typeof a.tool_response_raw === "string" ? a.tool_response_raw : "";
  return {
    tool_name: asString(a.tool_name),
    tool_input_hash: sha256Hex(rawInput),
    input_size_bytes: Buffer.byteLength(rawInput, "utf8"),
    response_size_bytes: Buffer.byteLength(rawResponse, "utf8"),
    duration_ms: numericOr(a.duration_ms, 0),
    success: a.success === true,
    correlation_id: asString(a.correlation_id)
  };
}
function toolCallFailed(a) {
  const rawInput = typeof a.tool_input_raw === "string" ? a.tool_input_raw : "";
  return {
    tool_name: asString(a.tool_name),
    tool_input_hash: sha256Hex(rawInput),
    correlation_id: asString(a.correlation_id)
  };
}
function sha256Hex(input) {
  return createHash("sha256").update(input, "utf8").digest("hex");
}
function asString(v) {
  return typeof v === "string" ? v : "";
}
function numericOr(v, fallback) {
  return typeof v === "number" ? v : fallback;
}
function filterEvent(raw) {
  const rule = rules[raw.event_type];
  if (!rule) {
    throw new Error(`No content-filter rule for event_type: ${raw.event_type}`);
  }
  const filteredAttrs = rule(raw.attributes);
  const out = {
    ...raw,
    event_uuid: randomUUID(),
    attributes: filteredAttrs
  };
  const serialized = JSON.stringify({
    uuid: out.event_uuid,
    type: out.event_type,
    sid: out.session_id,
    ts: out.timestamp_ns.toString(),
    attrs: out.attributes
  });
  if (Buffer.byteLength(serialized, "utf8") > MAX_SERIALIZED_BYTES) {
    return null;
  }
  return out;
}

// dist/team/lib/transcript-tail.mjs
var import_proper_lockfile = __toESM(require_proper_lockfile(), 1);
import { open, mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID as randomUUID2 } from "node:crypto";
var DEFAULT_MAX_READ_BYTES = 4 * 1024 * 1024;
var TranscriptTail = class {
  stateDir;
  maxReadBytes;
  constructor(stateDir, options = {}) {
    this.stateDir = stateDir;
    this.maxReadBytes = options.maxReadBytes ?? DEFAULT_MAX_READ_BYTES;
  }
  async tail(sessionId, transcriptPath, sequenceBase) {
    const cursorDir = this.cursorDir(sessionId);
    await mkdir(cursorDir, { recursive: true });
    const cursorPath = join(cursorDir, "transcript_cursor.json");
    let release;
    try {
      release = await import_proper_lockfile.default.lock(cursorPath, {
        retries: 0,
        realpath: false
      });
    } catch {
      return { events: [], skipped: true, newCursor: 0 };
    }
    try {
      const startOffset = await this.readCursor(cursorPath);
      const { events, endOffset } = await this.readSince(sessionId, transcriptPath, startOffset, sequenceBase, this.maxReadBytes);
      if (endOffset > startOffset) {
        await this.writeCursor(cursorPath, endOffset);
      }
      return { events, skipped: false, newCursor: endOffset };
    } finally {
      await release();
    }
  }
  async acquireCursorLock(sessionId) {
    const cursorDir = this.cursorDir(sessionId);
    await mkdir(cursorDir, { recursive: true });
    const cursorPath = join(cursorDir, "transcript_cursor.json");
    try {
      await readFile(cursorPath);
    } catch {
      await writeFile(cursorPath, "{}", "utf8");
    }
    const release = await import_proper_lockfile.default.lock(cursorPath, { retries: 0, realpath: false });
    return { release: async () => {
      await release();
    } };
  }
  cursorDir(sessionId) {
    return join(this.stateDir, "sessions", sessionId);
  }
  async readCursor(cursorPath) {
    try {
      const buf = await readFile(cursorPath, "utf8");
      const parsed = JSON.parse(buf);
      return parsed.byte_offset ?? 0;
    } catch {
      return 0;
    }
  }
  async writeCursor(cursorPath, offset) {
    const body = { byte_offset: offset };
    const tmp = `${cursorPath}.tmp`;
    await writeFile(tmp, JSON.stringify(body), "utf8");
    await rename(tmp, cursorPath);
  }
  async readSince(sessionId, path, startOffset, sequenceBase, maxReadBytes) {
    let fh = null;
    try {
      fh = await open(path, "r");
      const stat2 = await fh.stat();
      if (stat2.size <= startOffset)
        return { events: [], endOffset: startOffset };
      const toRead = Math.min(stat2.size - startOffset, maxReadBytes);
      const buf = Buffer.alloc(toRead);
      await fh.read(buf, 0, toRead, startOffset);
      const lastNewline = buf.lastIndexOf("\n".charCodeAt(0));
      if (lastNewline < 0)
        return { events: [], endOffset: startOffset };
      const usable = buf.slice(0, lastNewline + 1).toString("utf8");
      const endOffset = startOffset + lastNewline + 1;
      const events = [];
      let seq = sequenceBase;
      for (const line of usable.split("\n")) {
        if (!line)
          continue;
        let rec;
        try {
          rec = JSON.parse(line);
        } catch {
          continue;
        }
        if (!isAssistantRecord(rec))
          continue;
        events.push(toApiRequestEvent(rec, sessionId, seq));
        seq++;
      }
      return { events, endOffset };
    } finally {
      if (fh)
        await fh.close();
    }
  }
};
function isAssistantRecord(r) {
  if (typeof r !== "object" || r === null)
    return false;
  const rec = r;
  if (rec.type !== "assistant")
    return false;
  if (typeof rec.uuid !== "string")
    return false;
  if (typeof rec.timestamp !== "string")
    return false;
  if (!Number.isFinite(Date.parse(rec.timestamp)))
    return false;
  if (typeof rec.message !== "object" || rec.message === null)
    return false;
  const msg = rec.message;
  if (msg.role !== "assistant")
    return false;
  if (typeof msg.id !== "string")
    return false;
  if (typeof msg.model !== "string")
    return false;
  return true;
}
function toApiRequestEvent(r, sessionId, sequence) {
  const usage = r.message.usage ?? {};
  const cacheCreation = usage.cache_creation;
  const attrs = {
    cost_usd: r.costUSD ?? 0,
    tokens_input: usage.input_tokens ?? 0,
    tokens_output: usage.output_tokens ?? 0,
    tokens_cache_read: usage.cache_read_input_tokens ?? 0,
    tokens_cache_create: usage.cache_creation_input_tokens ?? 0,
    tokens_cache_create_5m: cacheCreation?.ephemeral_5m_input_tokens ?? 0,
    tokens_cache_create_1h: cacheCreation?.ephemeral_1h_input_tokens ?? 0,
    model: r.message.model,
    // Anthropic API request ID. Falls back to message.id for older
    // transcripts (and existing test fixtures) that lack requestId.
    request_id: r.requestId ?? r.message.id,
    transcript_message_uuid: r.uuid
  };
  return {
    event_uuid: randomUUID2(),
    event_type: "api.request",
    session_id: sessionId,
    source: "transcript.tail",
    sequence,
    timestamp_ns: BigInt(Date.parse(r.timestamp)) * 1000000n,
    attributes: attrs
  };
}

// dist/team/lib/identity-resolver.mjs
import { createHash as createHash2, randomUUID as randomUUID3 } from "node:crypto";
import { exec } from "node:child_process";
import { readFile as readFile2, writeFile as writeFile2 } from "node:fs/promises";
import { join as join2 } from "node:path";

// dist/team/lib/locking.mjs
var import_proper_lockfile2 = __toESM(require_proper_lockfile(), 1);
import { mkdir as mkdir2 } from "node:fs/promises";
var LOCK_OPTIONS = {
  realpath: false,
  retries: { retries: 100, minTimeout: 5, maxTimeout: 100, factor: 1.5 },
  stale: 1e4
};
async function withDirLock(dir, fn) {
  await mkdir2(dir, { recursive: true });
  const release = await import_proper_lockfile2.default.lock(dir, LOCK_OPTIONS);
  try {
    return await fn();
  } finally {
    await release();
  }
}

// dist/team/lib/identity-resolver.mjs
var GIT_TIMEOUT_MS = 200;
var IdentityResolver = class {
  dir;
  installPath;
  git;
  constructor(dir, git = defaultGitAccess()) {
    this.dir = dir;
    this.installPath = join2(dir, "install.json");
    this.git = git;
  }
  async resolve(cwd) {
    const install_id = await this.loadOrCreateInstallId();
    const globalEmail = await this.git.gitGlobalEmail();
    if (globalEmail) {
      const repo2 = await this.resolveRepoHash(cwd);
      return { install_id, subject: globalEmail, subject_source: "git-global", ...repo2 };
    }
    const localEmail = await this.git.gitLocalEmail(cwd);
    if (localEmail) {
      const repo2 = await this.resolveRepoHash(cwd);
      return { install_id, subject: localEmail, subject_source: "git-local", ...repo2 };
    }
    const repo = await this.resolveRepoHash(cwd);
    return { install_id, subject: "unidentified", subject_source: "unidentified", ...repo };
  }
  async resolveRepoHash(cwd) {
    const url = await this.git.gitRemoteUrl(cwd);
    if (!url)
      return {};
    return { repo_url_hash: createHash2("sha256").update(url, "utf8").digest("hex") };
  }
  async loadOrCreateInstallId() {
    return withDirLock(this.dir, async () => {
      try {
        const buf = await readFile2(this.installPath, "utf8");
        const parsed = JSON.parse(buf);
        if (parsed.install_id)
          return parsed.install_id;
      } catch (err) {
        if (err.code !== "ENOENT")
          throw err;
      }
      const install_id = randomUUID3();
      const body = { install_id, created_at: (/* @__PURE__ */ new Date()).toISOString() };
      await writeFile2(this.installPath, JSON.stringify(body), "utf8");
      return install_id;
    });
  }
};
function toResourceAttributes(id, opts) {
  return {
    "service.name": "fancysauce",
    "service.version": opts.pluginVersion,
    "fancysauce.schema_version": opts.schemaVersion,
    "fancysauce.install_id": id.install_id,
    "fancysauce.subject": id.subject,
    "fancysauce.subject_source": id.subject_source,
    ...opts.team ? { "fancysauce.team": opts.team } : {}
  };
}
function defaultGitAccess() {
  return {
    gitGlobalEmail: () => gitRead("git config --global user.email"),
    gitLocalEmail: (cwd) => gitRead(`git -C ${shellEscape(cwd)} config user.email`),
    gitRemoteUrl: (cwd) => gitRead(`git -C ${shellEscape(cwd)} remote get-url origin`)
  };
}
function gitRead(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: GIT_TIMEOUT_MS }, (err, stdout) => {
      if (err)
        return resolve(null);
      const trimmed = stdout.toString().trim();
      resolve(trimmed.length ? trimmed : null);
    });
  });
}
function shellEscape(s) {
  return `'${s.replace(/'/g, `'"'"'`)}'`;
}

// dist/team/lib/queue.mjs
import { open as open2, stat } from "node:fs/promises";
import { join as join3 } from "node:path";
var Queue = class {
  dir;
  path;
  capBytes;
  constructor(dir, capBytes) {
    this.dir = dir;
    this.path = join3(dir, "queue.ndjson");
    this.capBytes = capBytes;
  }
  async size() {
    try {
      const s = await stat(this.path);
      return s.size;
    } catch (err) {
      if (err.code === "ENOENT")
        return 0;
      throw err;
    }
  }
  async append(lines) {
    if (lines.length === 0) {
      return { written: 0, dropped: 0, sizeAfter: await this.size() };
    }
    return withDirLock(this.dir, async () => {
      const fh = await open2(this.path, "a");
      let written = 0;
      let dropped = 0;
      let currentSize = (await fh.stat()).size;
      try {
        for (const line of lines) {
          const bytes = Buffer.byteLength(line, "utf8") + 1;
          if (currentSize + bytes > this.capBytes) {
            dropped++;
            continue;
          }
          await fh.write(line + "\n", null, "utf8");
          written++;
          currentSize += bytes;
        }
      } finally {
        await fh.close();
      }
      return { written, dropped, sizeAfter: currentSize };
    });
  }
};

// dist/team/lib/health.mjs
var import_proper_lockfile3 = __toESM(require_proper_lockfile(), 1);
import { mkdir as mkdir3, readFile as readFile3, rename as rename2, writeFile as writeFile3 } from "node:fs/promises";
import { join as join4 } from "node:path";
var DEFAULT = { dropped_event_count: 0 };
var LOCK_RETRIES = {
  retries: 100,
  factor: 1.5,
  minTimeout: 5,
  maxTimeout: 50
};
var HealthState = class {
  dir;
  path;
  tmp;
  constructor(dir) {
    this.dir = dir;
    this.path = join4(dir, "health.json");
    this.tmp = `${this.path}.tmp`;
  }
  async read() {
    try {
      return { ...DEFAULT, ...JSON.parse(await readFile3(this.path, "utf8")) };
    } catch {
      return { ...DEFAULT };
    }
  }
  async recordDrop(n) {
    await this.update((h) => {
      h.dropped_event_count += n;
    });
  }
  async touch() {
    await this.update((h) => {
      h.last_hook_at = Date.now();
    });
  }
  async recordFlush(result) {
    await this.update((h) => {
      h.last_flush_at = Date.now();
      h.last_flush_result = result;
    });
  }
  async update(mutate) {
    await mkdir3(this.dir, { recursive: true });
    try {
      await readFile3(this.path);
    } catch {
      await writeFile3(this.path, "{}", "utf8");
    }
    const release = await import_proper_lockfile3.default.lock(this.path, {
      retries: LOCK_RETRIES,
      realpath: false
    });
    try {
      const h = await this.read();
      mutate(h);
      await writeFile3(this.tmp, JSON.stringify(h), "utf8");
      await rename2(this.tmp, this.path);
    } finally {
      await release();
    }
  }
};

// dist/team/lib/flusher.mjs
var import_proper_lockfile4 = __toESM(require_proper_lockfile(), 1);
import { open as open3, readFile as readFile6, rename as rename5, writeFile as writeFile6 } from "node:fs/promises";
import { join as join7 } from "node:path";

// dist/team/lib/flush-cursor.mjs
import { readFile as readFile4, rename as rename3, writeFile as writeFile4 } from "node:fs/promises";
import { join as join5 } from "node:path";
var FlushCursor = class {
  dir;
  path;
  tmpPath;
  constructor(dir) {
    this.dir = dir;
    this.path = join5(dir, "flush_cursor.json");
    this.tmpPath = `${this.path}.tmp`;
  }
  async read() {
    try {
      const buf = await readFile4(this.path, "utf8");
      const parsed = JSON.parse(buf);
      return parsed.last_flushed_offset_bytes ?? 0;
    } catch (err) {
      if (err.code === "ENOENT")
        return 0;
      throw err;
    }
  }
  async advance(offset) {
    await withDirLock(this.dir, async () => {
      const current = await this.read();
      if (offset < current) {
        throw new Error(`FlushCursor.advance monotonic violation: ${offset} < ${current}`);
      }
      await this.write(offset);
    });
  }
  // Used by queue compaction: rewrites queue.ndjson to drop already-flushed
  // bytes, after which the cursor must restart at 0. Caller is expected to
  // hold the dir-lock for the rewrite + reset sequence.
  async resetUnlocked() {
    await this.write(0);
  }
  async write(offset) {
    const body = { last_flushed_offset_bytes: offset };
    await writeFile4(this.tmpPath, JSON.stringify(body), "utf8");
    await rename3(this.tmpPath, this.path);
  }
};

// dist/team/lib/backoff-state.mjs
import { mkdir as mkdir4, readFile as readFile5, rename as rename4, writeFile as writeFile5 } from "node:fs/promises";
import { join as join6 } from "node:path";
var DEFAULT2 = {
  consecutiveAuthFailures: 0,
  transientAttempts: 0
};
var MAX_BACKOFF_MS = 5 * 60 * 1e3;
var BASE_BACKOFF_MS = 1e3;
var BackoffState = class {
  dir;
  path;
  tmpPath;
  constructor(dir) {
    this.dir = dir;
    this.path = join6(dir, "backoff.json");
    this.tmpPath = `${this.path}.tmp`;
  }
  async read() {
    const f = await this.loadFile();
    return {
      nextRetryAt: f.nextRetryAt,
      consecutiveAuthFailures: f.consecutiveAuthFailures
    };
  }
  async setRetryAfter(retryAfterMs) {
    const bounded = Math.min(Math.max(0, retryAfterMs), MAX_BACKOFF_MS);
    await withDirLock(this.dir, async () => {
      const f = await this.loadFile();
      f.nextRetryAt = Date.now() + bounded;
      await this.save(f);
    });
  }
  async recordTransient() {
    return withDirLock(this.dir, async () => {
      const f = await this.loadFile();
      f.transientAttempts++;
      const base = BASE_BACKOFF_MS * 2 ** Math.min(f.transientAttempts, 10);
      const jitter = Math.random() * base * 0.3;
      const delayMs = Math.min(base + jitter, MAX_BACKOFF_MS);
      f.nextRetryAt = Date.now() + delayMs;
      await this.save(f);
      return f.nextRetryAt;
    });
  }
  async recordAuthFailure() {
    return withDirLock(this.dir, async () => {
      const f = await this.loadFile();
      f.consecutiveAuthFailures++;
      const base = BASE_BACKOFF_MS * 2 ** Math.min(f.consecutiveAuthFailures, 10);
      const jitter = Math.random() * base * 0.3;
      const delayMs = Math.min(base + jitter, MAX_BACKOFF_MS);
      f.nextRetryAt = Date.now() + delayMs;
      await this.save(f);
      return f.nextRetryAt;
    });
  }
  async resetAuthFailures() {
    await withDirLock(this.dir, async () => {
      const f = await this.loadFile();
      f.consecutiveAuthFailures = 0;
      await this.save(f);
    });
  }
  async clear() {
    await withDirLock(this.dir, async () => {
      const f = await this.loadFile();
      f.nextRetryAt = void 0;
      f.transientAttempts = 0;
      await this.save(f);
    });
  }
  async loadFile() {
    try {
      const buf = await readFile5(this.path, "utf8");
      return { ...DEFAULT2, ...JSON.parse(buf) };
    } catch (err) {
      if (err.code === "ENOENT") {
        return { ...DEFAULT2 };
      }
      throw err;
    }
  }
  async save(f) {
    await mkdir4(this.dir, { recursive: true });
    await writeFile5(this.tmpPath, JSON.stringify(f), "utf8");
    await rename4(this.tmpPath, this.path);
  }
};

// dist/team/lib/forwarder.mjs
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { gzip } from "node:zlib";
import { promisify } from "node:util";
var gzipAsync = promisify(gzip);
var DEFAULT_TIMEOUT_MS = 1e3;
var MAX_RESPONSE_BYTES = 64 * 1024;
async function postBatch(input) {
  let body = input.bodyBytes;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${input.apiKey}`
  };
  if (input.gzip) {
    body = await gzipAsync(body);
    headers["Content-Encoding"] = "gzip";
  }
  headers["Content-Length"] = String(body.length);
  const base = input.endpoint.endsWith("/") ? input.endpoint : `${input.endpoint}/`;
  const url = new URL("v1/logs", base);
  const fn = url.protocol === "https:" ? httpsRequest : httpRequest;
  return await new Promise((resolve) => {
    let settled = false;
    const settle = (r) => {
      if (settled)
        return;
      settled = true;
      resolve(r);
    };
    const req = fn(url, { method: "POST", headers, timeout: input.timeoutMs ?? DEFAULT_TIMEOUT_MS }, (res) => {
      const chunks = [];
      let received = 0;
      let truncated = false;
      const finalize = () => {
        const status = res.statusCode ?? 0;
        settle(classify(status, res.headers["retry-after"], Buffer.concat(chunks).toString("utf8")));
      };
      res.on("data", (c) => {
        if (truncated)
          return;
        const remaining = MAX_RESPONSE_BYTES - received;
        if (c.length <= remaining) {
          chunks.push(c);
          received += c.length;
          return;
        }
        if (remaining > 0) {
          chunks.push(c.subarray(0, remaining));
          received += remaining;
        }
        truncated = true;
        req.destroy();
        finalize();
      });
      res.on("end", finalize);
    });
    req.on("timeout", () => {
      req.destroy(new Error("request timeout"));
    });
    req.on("error", (err) => settle({ kind: "transient", status: 0, error: err.message }));
    req.write(body);
    req.end();
  });
}
function classify(status, retryAfter, bodyRaw) {
  if (status === 200 || status === 202)
    return { kind: "ok", status };
  if (status === 400) {
    let reason = "";
    try {
      reason = String(JSON.parse(bodyRaw).error ?? "");
    } catch {
    }
    return { kind: "drop", status: 400, reason };
  }
  if (status === 401 || status === 403)
    return { kind: "auth-failed", status };
  if (status === 413) {
    let maxBytes;
    try {
      maxBytes = JSON.parse(bodyRaw).max_bytes;
    } catch {
    }
    return { kind: "too-large", status: 413, maxBytes };
  }
  if (status === 429) {
    const retryAfterMs = parseRetryAfter(retryAfter) ?? 6e4;
    return { kind: "rate-limited", status: 429, retryAfterMs };
  }
  return { kind: "transient", status, error: `HTTP ${status}` };
}
function parseRetryAfter(h) {
  if (!h)
    return null;
  const value = Array.isArray(h) ? h[0] : h;
  const secs = Number(value);
  if (Number.isFinite(secs))
    return Math.max(0, secs) * 1e3;
  const ms = Date.parse(value);
  if (Number.isFinite(ms))
    return Math.max(0, ms - Date.now());
  return null;
}

// dist/team/lib/otlp-encoder.mjs
var ATTR_TYPE = {
  // core attrs (every event)
  "fancysauce.event_uuid": "string",
  "fancysauce.event_type": "string",
  "fancysauce.session_id": "string",
  "fancysauce.source": "string",
  "fancysauce.sequence": "int",
  // session.start
  cwd: "string",
  model: "string",
  permission_mode: "string",
  "fancysauce.repo_url_hash": "string",
  // session.end
  reason: "string",
  duration_wall_s: "int",
  // prompt.submit
  prompt_length: "int",
  // tool_call.{start,complete,failed}
  tool_name: "string",
  tool_input_hash: "string",
  input_size_bytes: "int",
  response_size_bytes: "int",
  duration_ms: "int",
  success: "bool",
  correlation_id: "string",
  // subagent.{start,complete}
  agent_id: "string",
  agent_type: "string",
  // api.request
  cost_usd: "double",
  tokens_input: "int",
  tokens_output: "int",
  tokens_cache_read: "int",
  tokens_cache_create: "int",
  tokens_cache_create_5m: "int",
  tokens_cache_create_1h: "int",
  request_id: "string",
  transcript_message_uuid: "string",
  // notification
  notification_type: "string",
  // task.completed
  task_id: "string"
};
function encodeOtlp(events, resource, observedTimeUnixNano) {
  const observed = observedTimeUnixNano ?? BigInt(Date.now()) * 1000000n;
  return {
    resourceLogs: [
      {
        resource: { attributes: encodeResourceAttributes(resource) },
        scopeLogs: [
          {
            scope: { name: "fancysauce.plugin", version: resource["service.version"] },
            logRecords: events.map((e) => encodeLogRecord(e, observed))
          }
        ]
      }
    ]
  };
}
function encodeResourceAttributes(r) {
  const out = [];
  const order = [
    "service.name",
    "service.version",
    "fancysauce.schema_version",
    "fancysauce.install_id",
    "fancysauce.subject",
    "fancysauce.subject_source",
    "fancysauce.team"
  ];
  for (const key of order) {
    const v = r[key];
    if (v === void 0)
      continue;
    out.push({ key, value: { stringValue: String(v) } });
  }
  return out;
}
function encodeLogRecord(event, observedTimeUnixNano) {
  const attrs = [
    { key: "fancysauce.event_uuid", value: encodeAnyValue("fancysauce.event_uuid", event.event_uuid) },
    { key: "fancysauce.event_type", value: encodeAnyValue("fancysauce.event_type", event.event_type) },
    { key: "fancysauce.session_id", value: encodeAnyValue("fancysauce.session_id", event.session_id) },
    { key: "fancysauce.source", value: encodeAnyValue("fancysauce.source", event.source) },
    { key: "fancysauce.sequence", value: encodeAnyValue("fancysauce.sequence", event.sequence) }
  ];
  for (const [key, val] of Object.entries(event.attributes)) {
    attrs.push({ key, value: encodeAnyValue(key, val) });
  }
  return {
    timeUnixNano: event.timestamp_ns.toString(),
    observedTimeUnixNano: observedTimeUnixNano.toString(),
    severityNumber: 9,
    attributes: attrs
  };
}
function encodeAnyValue(key, v) {
  const type = ATTR_TYPE[key];
  if (!type) {
    throw new Error(`Unknown attribute key: ${key} (add to ATTR_TYPE)`);
  }
  switch (type) {
    case "string":
      return { stringValue: String(v) };
    case "bool":
      return { boolValue: Boolean(v) };
    case "int":
      if (typeof v === "bigint")
        return { intValue: v.toString() };
      if (typeof v === "number" && Number.isFinite(v))
        return { intValue: String(Math.trunc(v)) };
      throw new Error(`Attribute ${key} typed int requires number|bigint, got ${typeof v}`);
    case "double":
      if (typeof v === "number" && Number.isFinite(v))
        return { doubleValue: v };
      if (typeof v === "bigint")
        return { doubleValue: Number(v) };
      throw new Error(`Attribute ${key} typed double requires number|bigint, got ${typeof v}`);
  }
}

// dist/team/lib/flusher.mjs
var DEFAULT_MAX_EVENTS = 100;
var DEFAULT_MAX_BYTES = 1e6;
var MIN_POST_TIMEOUT_MS = 100;
var COMPACT_THRESHOLD_BYTES = 1e6;
async function tryFlush(input) {
  const start = Date.now();
  const deadline = start + input.budgetMs;
  const queuePath = join7(input.dataDir, "queue.ndjson");
  const flushLockPath = join7(input.dataDir, ".flush.lock");
  const backoff = new BackoffState(input.dataDir);
  const cursor = new FlushCursor(input.dataDir);
  const health = new HealthState(input.stateDir);
  const b = await backoff.read();
  if (b.nextRetryAt && b.nextRetryAt > Date.now()) {
    return { skipped: true, reason: "backoff deadline in future" };
  }
  try {
    await readFile6(flushLockPath);
  } catch {
    const fh = await open3(flushLockPath, "a");
    await fh.close();
  }
  let release;
  try {
    release = await import_proper_lockfile4.default.lock(flushLockPath, { retries: 0, realpath: false });
  } catch {
    return { skipped: true, reason: "flush lock held by another hook" };
  }
  try {
    const startOffset = await cursor.read();
    const { events, endOffset } = await readBatch(queuePath, startOffset, input.batchMaxEvents ?? DEFAULT_MAX_EVENTS, input.batchMaxBytes ?? DEFAULT_MAX_BYTES);
    if (events.length === 0) {
      return { skipped: false, eventsFlushed: 0, bytesAdvanced: 0 };
    }
    if (Date.now() + 500 > deadline) {
      return { skipped: true, reason: "budget exhausted before post" };
    }
    const envelope = encodeOtlp(events, input.resource);
    const bodyBytes = Buffer.from(JSON.stringify(envelope), "utf8");
    const remainingMs = deadline - Date.now();
    if (remainingMs < MIN_POST_TIMEOUT_MS) {
      return { skipped: true, reason: "budget exhausted after encode" };
    }
    const result = await postBatch({
      endpoint: input.endpoint,
      apiKey: input.apiKey,
      bodyBytes,
      gzip: bodyBytes.length > 8192,
      timeoutMs: Math.min(1e3, remainingMs)
    });
    await health.recordFlush(result.kind);
    switch (result.kind) {
      case "ok":
        await cursor.advance(endOffset);
        await backoff.clear();
        await backoff.resetAuthFailures();
        await maybeCompact(input.dataDir, cursor, queuePath);
        return { skipped: false, outcome: "ok", eventsFlushed: events.length, bytesAdvanced: endOffset - startOffset };
      case "drop":
        await cursor.advance(endOffset);
        await maybeCompact(input.dataDir, cursor, queuePath);
        return { skipped: false, outcome: "drop", eventsFlushed: events.length, bytesAdvanced: endOffset - startOffset };
      case "auth-failed":
        await backoff.recordAuthFailure();
        return { skipped: false, outcome: "auth-failed" };
      case "too-large":
        return { skipped: false, outcome: "too-large" };
      case "rate-limited":
        await backoff.setRetryAfter(result.retryAfterMs);
        return { skipped: false, outcome: "rate-limited" };
      case "transient":
        await backoff.recordTransient();
        return { skipped: false, outcome: "transient" };
      default: {
        const _exhaustive = result;
        throw new Error(`unhandled PostResult kind: ${JSON.stringify(_exhaustive)}`);
      }
    }
  } finally {
    await release();
  }
}
async function readBatch(queuePath, startOffset, maxEvents, maxBytes) {
  let fh = null;
  try {
    try {
      fh = await open3(queuePath, "r");
    } catch {
      return { events: [], endOffset: startOffset };
    }
    const stat2 = await fh.stat();
    if (stat2.size <= startOffset)
      return { events: [], endOffset: startOffset };
    const toRead = Math.min(stat2.size - startOffset, maxBytes);
    const buf = Buffer.alloc(toRead);
    await fh.read(buf, 0, toRead, startOffset);
    const lastNl = buf.lastIndexOf("\n".charCodeAt(0));
    if (lastNl < 0)
      return { events: [], endOffset: startOffset };
    const usable = buf.slice(0, lastNl + 1).toString("utf8");
    const events = [];
    let consumedBytes = 0;
    let cursorBytes = 0;
    for (const line of usable.split("\n")) {
      if (line.length === 0) {
        continue;
      }
      const lineBytes = Buffer.byteLength(line, "utf8") + 1;
      consumedBytes += lineBytes;
      if (events.length >= maxEvents)
        break;
      let parsed;
      try {
        parsed = JSON.parse(line);
      } catch {
        cursorBytes = consumedBytes;
        continue;
      }
      const ev = revive(parsed);
      if (ev)
        events.push(ev);
      cursorBytes = consumedBytes;
    }
    return { events, endOffset: startOffset + cursorBytes };
  } finally {
    if (fh)
      await fh.close();
  }
}
async function maybeCompact(dataDir2, cursor, queuePath) {
  const flushedOffset = await cursor.read();
  if (flushedOffset < COMPACT_THRESHOLD_BYTES)
    return;
  await withDirLock(dataDir2, async () => {
    let fh = null;
    try {
      try {
        fh = await open3(queuePath, "r");
      } catch {
        return;
      }
      const stat2 = await fh.stat();
      if (flushedOffset >= stat2.size) {
        await fh.close();
        fh = null;
        await writeFile6(queuePath, "");
        await cursor.resetUnlocked();
        return;
      }
      const tailLen = stat2.size - flushedOffset;
      const buf = Buffer.alloc(tailLen);
      await fh.read(buf, 0, tailLen, flushedOffset);
      await fh.close();
      fh = null;
      const tmpPath = `${queuePath}.compact.tmp`;
      await writeFile6(tmpPath, buf);
      await rename5(tmpPath, queuePath);
      await cursor.resetUnlocked();
    } finally {
      if (fh)
        await fh.close();
    }
  });
}
function revive(v) {
  if (typeof v !== "object" || v === null)
    return null;
  const o = v;
  if (typeof o.event_uuid !== "string")
    return null;
  if (typeof o.event_type !== "string")
    return null;
  if (typeof o.session_id !== "string")
    return null;
  if (typeof o.source !== "string")
    return null;
  if (typeof o.sequence !== "number")
    return null;
  if (typeof o.timestamp_ns !== "string" && typeof o.timestamp_ns !== "bigint")
    return null;
  if (typeof o.attributes !== "object" || o.attributes === null)
    return null;
  return {
    event_uuid: o.event_uuid,
    event_type: o.event_type,
    session_id: o.session_id,
    source: o.source,
    sequence: o.sequence,
    timestamp_ns: typeof o.timestamp_ns === "bigint" ? o.timestamp_ns : BigInt(o.timestamp_ns),
    attributes: o.attributes
  };
}

// dist/team/lib/hook-budget.mjs
function remainingFlushBudgetMs(hookBudgetMs, elapsedMs, marginMs) {
  const remaining = hookBudgetMs - elapsedMs - marginMs;
  return remaining > 0 ? remaining : 0;
}

// dist/team/hooks/collect.mjs
var HOOK_BUDGET_MS = 1800;
var FLUSH_MARGIN_MS = 200;
var QUEUE_CAP_BYTES = 100 * 1024 * 1024;
var SCHEMA_VERSION = "1.0.0";
function pluginVersion() {
  try {
    const candidatePaths = [
      join8(import.meta.dirname, "../../../package.json"),
      join8(process.cwd(), "package.json")
    ];
    for (const p of candidatePaths) {
      try {
        const pkg = JSON.parse(readFileSync(p, "utf8"));
        if (pkg.version)
          return pkg.version;
      } catch {
      }
    }
  } catch {
  }
  return "0.0.0";
}
function dataDir() {
  return process.env.CLAUDE_PLUGIN_DATA || join8(homedir(), ".claude-plugin-data");
}
async function main() {
  const start = Date.now();
  const killer = setTimeout(() => process.exit(0), HOOK_BUDGET_MS);
  killer.unref?.();
  try {
    const config = loadConfig();
    if (!config)
      return;
    const hookPayload = readStdin();
    if (!hookPayload)
      return;
    const root = dataDir();
    await mkdir5(root, { recursive: true });
    const rawEvent = mapHookToEvent(hookPayload, 0);
    const primary = filterEvent(rawEvent);
    const tail = new TranscriptTail(join8(root, "state"));
    const tailResult = await tail.tail(hookPayload.session_id, hookPayload.transcript_path, 1);
    const events = primary ? [primary, ...tailResult.events] : [...tailResult.events];
    const primaryDropped = primary ? 0 : 1;
    const identity = await new IdentityResolver(root).resolve(hookPayload.cwd);
    const resource = toResourceAttributes(identity, {
      pluginVersion: pluginVersion(),
      schemaVersion: SCHEMA_VERSION,
      team: config.team
    });
    const outboundDir = join8(root, "outbound");
    await mkdir5(outboundDir, { recursive: true });
    const queue = new Queue(outboundDir, QUEUE_CAP_BYTES);
    const serialized = events.map(serializeForQueue);
    const result = await queue.append(serialized);
    const health = new HealthState(join8(root, "state"));
    await health.touch();
    const dropped = result.dropped + primaryDropped;
    if (dropped > 0)
      await health.recordDrop(dropped);
    const remaining = remainingFlushBudgetMs(HOOK_BUDGET_MS, Date.now() - start, FLUSH_MARGIN_MS);
    if (remaining > 300) {
      await tryFlush({
        dataDir: outboundDir,
        stateDir: join8(root, "state"),
        apiKey: config.apiKey,
        endpoint: config.endpoint,
        resource,
        budgetMs: remaining
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? `${err.message}
${err.stack ?? ""}` : String(err);
    try {
      const logPath = join8(dataDir(), "collect-error.log");
      await writeFile7(logPath, `${(/* @__PURE__ */ new Date()).toISOString()} ${msg}
`, { flag: "a" });
    } catch {
    }
  } finally {
    clearTimeout(killer);
  }
}
function readStdin() {
  try {
    const buf = readFileSync(0, "utf8");
    return JSON.parse(buf);
  } catch {
    return null;
  }
}
function serializeForQueue(event) {
  return JSON.stringify({
    event_uuid: event.event_uuid,
    event_type: event.event_type,
    session_id: event.session_id,
    source: event.source,
    sequence: event.sequence,
    timestamp_ns: event.timestamp_ns.toString(),
    attributes: event.attributes
  });
}
void main();
