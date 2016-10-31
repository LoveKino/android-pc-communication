#!/bin/bash

CUR_DIR=$(cd `dirname $0`;pwd);

cd $CUR_DIR;

# update library
rm -rf ./BridgeContainer/pc
cp -R ../android/pc ./BridgeContainer
