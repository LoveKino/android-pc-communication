#!/bin/bash

CUR_DIR=$(cd `dirname $0`;pwd);

cd $CUR_DIR;

# update library
./updateLibrary.sh

../node_modules/.bin/mocha node/**/*.js -t 100000
