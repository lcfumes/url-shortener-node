'use strict';

// Load modules
const Fs = require('fs-extra');
const Os = require('os');
const Path = require('path');
const Stream = require('stream');

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hoek = require('hoek');
const SafeJson = require('good-squeeze').SafeJson;
const GoodFile = require('../lib');
const StandIn = require('stand-in');

// Lab shortcuts

const describe = lab.describe;
const it = lab.it;
const after = lab.after;
const before = lab.before;
const expect = Code.expect;

// Declare internals

const internals = {
    tempDir: Path.join(Os.tmpDir(), '__good__')
};

internals.getLog = (path, callback) => {

    Fs.readFile(path, { encoding: 'utf8' }, (error, data) => {

        if (error) {
            return callback(error);
        }

        const results = JSON.parse('[' + data.replace(/\n/g, ',').slice(0, -1) + ']');
        callback(null, results);
    });
};


internals.readStream = (done) => {

    const result = new Stream.Readable({ objectMode: true });
    result._read = () => {};

    return result;
};



describe('GoodFile', () => {

    before((done) => {

        Fs.ensureDir(internals.tempDir, done);
    });

    it('properly sets up the path if the file name is specified', { plan: 2 }, (done) => {

        const file = Hoek.uniqueFilename(internals.tempDir);
        const filestream = new GoodFile(file);
        filestream.on('open', () => {

            expect(filestream.path).to.equal(file);
            expect(filestream.fd).to.be.a.number();
            done();
        });
    });

    it('reuses the same file when passing a file name', { plan: 4 }, (done) => {

        const file = Hoek.uniqueFilename(internals.tempDir);
        const filestream1 = new GoodFile(file);
        const filestream2 = new GoodFile(file);
        const read1 = internals.readStream();
        const read2 = internals.readStream();

        read1.pipe(new SafeJson(null, { separator: '\n' })).pipe(filestream1);
        expect(filestream1.path).to.equal(file);

        for (let i = 0; i < 20; ++i) {
            read1.push({ id: i, text: 'first write' });
        }
        read1.push(null);

        read2.pipe(new SafeJson(null, { separator: '\n' })).pipe(filestream2);
        expect(filestream2.path).to.equal(file);

        for (let i = 0; i < 20; ++i) {
            read2.push({ id: i, text: 'second write' });
        }
        read2.push(null);

        filestream2.on('finish', () => {

            internals.getLog(filestream2.path, (err, data) => {

                expect(err).to.not.exist();
                expect(data).to.have.length(40);
                done();
            });
        });
    });

    it('can handle a large number of events', { plan: 1 }, (done) => {

        const file = Hoek.uniqueFilename(internals.tempDir);
        const filestream = new GoodFile(file);
        const read = internals.readStream();
        read.pipe(new SafeJson()).pipe(filestream);


        filestream.on('finish', () => {

            expect(filestream.bytesWritten).to.equal(717854);
            done();
        });

        for (let i = 0; i <= 10000; ++i) {
            read.push({ id: i, timestamp: Date.now(), value: 'value for iteration ' + i });
        }
        read.push(null);
    });

    it('will log events even after a delay', { plan: 1 }, (done) => {

        const file = Hoek.uniqueFilename(internals.tempDir);
        const filestream = new GoodFile(file);
        const read = internals.readStream();
        read.pipe(new SafeJson()).pipe(filestream);


        filestream.on('finish', () => {

            expect(filestream.bytesWritten).to.equal(13296);
            done();
        });

        for (let i = 0; i <= 100; ++i) {
            read.push({ id: i, timestamp: Date.now(), value: 'value for iteration ' + i });
        }

        setTimeout(() => {

            for (let i = 0; i <= 100; ++i) {
                read.push({ id: i, timestamp: Date.now(), value: 'inner iteration ' + i });
            }

            read.push(null);
        }, 500);
    });

    it('creates path to logs file if it does not exist', { plan: 2 }, (done) => {

        const dir = Path.join(internals.tempDir, 'test');
        const file = Hoek.uniqueFilename(dir);

        Fs.stat(file, (error) => {

            // We expect an error to be thrown, because this directory should
            // not yet exist.
            expect(error).to.exist();

            const filestream = new GoodFile(file);
            const read = internals.readStream();
            read.pipe(new SafeJson()).pipe(filestream);

            filestream.on('finish', () => {

                expect(filestream.bytesWritten).to.equal(24);

                Fs.stat(file, done);
            });
            read.push({ id: 0, tag: 'my test' });
            read.push(null);
        });
    });

    it('will emit "error" event if the file can not be opened', { plan: 4 }, (done) => {

        const file = Hoek.uniqueFilename(internals.tempDir);
        StandIn.replace(Fs, 'ensureFile', (stand, path, callback) => {

            stand.restore();
            expect(path).to.equal(file);
            // Do this to accurately fake Fs.ensureFile
            setImmediate(() => {

                callback(new Error('test error'));
            });
        });
        const filestream = new GoodFile(file);
        filestream.on('error', (err) => {

            expect(err).to.be.an.instanceOf(Error);
            expect(err.message).to.equal('test error');
            expect(filestream.fd).to.be.null();
            done();
        });
    });

    after((done) => {

        Fs.remove(internals.tempDir, done);
    });
});
