'use strict';

let {
    pc
} = require('general-bridge');
let path = require('path');
let idgener = require('idgener');
let promisify = require('promisify-node');
let fs = promisify('fs');
let spawnp = require('spawnp');
let del = require('del');

let log = console.log; //eslint-disable-line

module.exports = (accept) => {
    let handlers = {};
    let accepts = {};

    let connect = (commandJsonPath, commandDir, sandbox) => {
        accepts[commandDir] = accept(commandDir);
        let sendByChannel = (msg) => send(commandJsonPath, msg);

        return accepts[commandDir].start((outStr) => {
            let {
                channel, data
            } = JSON.parse(outStr);
            let handler = handlers[channel];
            if (handler) {
                handler(data);
            }
        }).then(() => {
            return pc((handler, send) => {
                handlers[commandJsonPath] = (data) => {
                    return handler(data, send);
                };
            }, sendByChannel, sandbox);
        });
    };

    let disConnect = (commandJsonPath, commandDir) => {
        delete handlers[commandJsonPath];
        if (accepts[commandDir]) {
            accepts[commandDir].stop();
            delete accepts[commandDir];
        }
    };

    return {
        connect,
        disConnect
    };
};

let send = (commandJsonPath, data) => {
    let dir = path.join(__dirname, `./tmp/${idgener()}`);
    let commandPath = path.join(dir, path.basename(commandJsonPath));

    return spawnp.pass(`adb shell [ -f ${commandJsonPath} ]`).then((ret) => {
        if (ret) {
            return fs.mkdir(dir).then(() => {
                return fs.writeFile(commandPath, JSON.stringify(data), 'utf-8').then(() => {
                    return spawnp(spawnp.pipeLine([`cat ${commandPath}`, `adb shell tee ${commandJsonPath}`]));
                });
            }).then(() => {
                return del([dir], {
                    force: true
                });
            }).catch(err => {
                log(err);
                return del([dir], {
                    force: true
                });
            });
        }
    });
};
