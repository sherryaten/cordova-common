/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const fs = require('fs-extra');
const path = require('node:path');
const CordovaCheck = require('../src/CordovaCheck');

const cwd = process.cwd();
const home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const origPWD = process.env.PWD;
const testDirName = 'cordova-common-test-somedir';

function touchFile (filepath) {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, '');
}

describe('findProjectRoot method', function () {
    afterEach(function () {
        process.env.PWD = origPWD;
        process.chdir(cwd);

        const somedir = path.join(home, testDirName);
        fs.rmSync(somedir, { recursive: true, force: true });
    });

    it('Test 001 : should return false if it hits the home directory', function () {
        const somedir = path.join(home, testDirName);
        fs.mkdirSync(somedir, { recursive: true });
        expect(CordovaCheck.findProjectRoot(somedir)).toEqual(false);
    });
    it('Test 002 : should return false if it cannot find a .cordova directory up the directory tree', function () {
        const somedir = path.join(home, '..');
        expect(CordovaCheck.findProjectRoot(somedir)).toEqual(false);
    });
    it('Test 003 : should return the first directory it finds with a .cordova folder in it', function () {
        const somedir = path.join(home, testDirName);
        const anotherdir = path.join(somedir, 'anotherdir');
        fs.mkdirSync(anotherdir, { recursive: true });
        touchFile(path.join(somedir, 'www', 'config.xml'));
        expect(CordovaCheck.findProjectRoot(somedir)).toEqual(somedir);
    });
    it('Test 004 : should ignore PWD when its undefined', function () {
        delete process.env.PWD;
        const somedir = path.join(home, testDirName);
        const anotherdir = path.join(somedir, 'anotherdir');
        fs.mkdirSync(anotherdir, { recursive: true });
        fs.mkdirSync(path.join(somedir, 'www'), { recursive: true });
        touchFile(path.join(somedir, 'config.xml'));
        process.chdir(anotherdir);
        expect(CordovaCheck.findProjectRoot()).toEqual(somedir);
    });
    it('Test 005 : should use PWD when available', function () {
        const somedir = path.join(home, testDirName);
        const anotherdir = path.join(somedir, 'anotherdir');
        fs.mkdirSync(anotherdir, { recursive: true });
        touchFile(path.join(somedir, 'www', 'config.xml'));
        process.env.PWD = anotherdir;
        process.chdir(path.sep);
        expect(CordovaCheck.findProjectRoot()).toEqual(somedir);
    });
    it('Test 006 : should use cwd as a fallback when PWD is not a cordova dir', function () {
        const somedir = path.join(home, testDirName);
        const anotherdir = path.join(somedir, 'anotherdir');
        fs.mkdirSync(anotherdir, { recursive: true });
        touchFile(path.join(somedir, 'www', 'config.xml'));
        process.env.PWD = path.sep;
        process.chdir(anotherdir);
        expect(CordovaCheck.findProjectRoot()).toEqual(somedir);
    });
    it('Test 007 : should ignore platform www/config.xml', function () {
        const somedir = path.join(home, testDirName);
        const anotherdir = path.join(somedir, 'anotherdir');
        touchFile(path.join(anotherdir, 'www', 'config.xml'));
        fs.mkdirSync(path.join(somedir, 'www'), { recursive: true });
        touchFile(path.join(somedir, 'config.xml'));
        expect(CordovaCheck.findProjectRoot(anotherdir)).toEqual(somedir);
    });
});
