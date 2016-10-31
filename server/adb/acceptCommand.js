'use strict';

let spawnp = require('spawnp');
let {
    reduce, forEach
} = require('bolzano');

let log = console.log; // eslint-disable-line

/**
 *
 * @param commandDir
 *      monitor android app's command dir to get commands
 *
 * 1. empty commandDir
 * 2. pool file names
 * 3. if exists file, read it as command
 * 4. delete file after get it's content
 */
module.exports = (commandDir) => {
    const timeGap = 50;

    let fileCommandCache = {}; // cache commands, derepeat

    let scanOutputDir = () => {
        return spawnp(`adb shell [ -d ${commandDir} ]`).catch(() => {
            return 'errored';
        }).then((ret) => {
            if (ret !== 'errored') {
                return spawnp(`adb shell ls ${commandDir}`, [], null, {
                    stdout: true
                }).then(({
                    stdouts
                }) => {
                    let str = stdouts.join('');

                    return reduce(str.split('\n'), (prev, item) => {
                        item = item.trim();
                        if (item) {
                            prev.push(commandDir + '/' + item);
                        }
                        return prev;
                    }, []);
                });
            }
        });
    };

    let readCommand = (handler) => {
        return scanOutputDir().then((files) => {
            forEach(files, (file) => {
                if (fileCommandCache[file]) {
                    return;
                }
                fileCommandCache[file] = true;
                //
                spawnp(`adb shell cat ${file}`, [], null, {
                    stdout: true
                }).then(({
                    stdouts
                }) => {
                    return spawnp(`adb shell rm -rf ${file}`).then(() => {
                        return handler(stdouts.join(''));
                    });
                }).catch(err => {
                    log(err);
                });
            });
        }).catch(err => {
            log(err);
        });
    };

    let stopFlag = false;

    return {
        start: (handler) => {
            fileCommandCache = {};
            stopFlag = false;
            // clear command dir
            return spawnp([
                'adb root', // root first
                `adb shell rm -rf ${commandDir}/*`
            ]).then(() => {
                let tick = () => {
                    if (stopFlag) return;
                    readCommand(handler);
                    setTimeout(tick, timeGap);
                };
                // start loop
                tick();
            });
        },

        stop: () => {
            stopFlag = true;
        }
    };
};
