'use strict';

let adbPC = require('./adbPC');
let acceptCommand = require('./acceptCommand');

/**
 * communication between android and pc based on adb.
 *
 * 1. read channel: loop android app's command dir
 *
 * 2. write channel: android app's command file
 */
module.exports = () => {
    return adbPC(acceptCommand);
};
