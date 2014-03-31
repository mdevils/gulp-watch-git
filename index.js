var batch = require('gulp-batch');
var gutil = require('gulp-util');
var exec = require('child_process').exec;

/**
 * @typedef {Object} GulpWatchGitOptions
 * @property {Number} [pullTimeout=3600000]
 */

/**
 * @param {GulpWatchGitOptions} opts
 * @param {Function} cb
 */
module.exports = function (opts, cb) {
    if (typeof opts !== 'object') {
        cb = opts;
        opts = {};
    }

    opts.pullTimeout = opts.pullTimeout || 3600000;

    if (cb) {
        if (typeof cb !== 'function') { throw new Error('Provided callback is not a function: ' + cb); }
        cb = batch(opts, cb);
    } else {
        cb = function () {};
    }

    function getLatestRevision(cb) {
        exec('git log -1 --format=%H', cb);
    }

    function pullChanges(cb) {
        exec('git pull', cb);
    }

    getLatestRevision(function (error, latestRevision) {
        if (error) {
            logEvent('error', error.message, opts);
        } else {
            setInterval(function () {
                pullChanges(function (error) {
                    if (error) {
                        logEvent('error', error.message, opts);
                    } else {
                        getLatestRevision(function (error, newRevision) {
                            if (error) {
                                logEvent('error', error.message, opts);
                            } else {
                                if (newRevision !== latestRevision) {
                                    latestRevision = newRevision;
                                    logEvent('git pull', '', opts);
                                    cb();
                                }
                            }
                        });
                    }
                });
            }, opts.pullTimeout);
        }
    });
};

function logEvent(event, message, opts) {
    var msg = [gutil.colors.magenta(event), message];
    if (opts.name) {
        msg.unshift(gutil.colors.cyan(opts.name) + ' saw');
    }
    gutil.log.apply(gutil, msg);
}
