'use strict';
// Load modules

const Stream = require('stream');
const Http = require('http');
const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const GoodHttp = require('..');

// Declare internals

const internals = {
    isSorted(elements) {

        let i = 0;

        while (i < elements.length && elements[i + 1]) {

            if (elements[i].timestamp > elements[i + 1].timestamp) {
                return false;
            }
            ++i;
        }
        return true;
    },
    getUri(server) {

        const address = server.address();
        return `http://${address.address}:${address.port}`;
    },
    readStream() {

        const result = new Stream.Readable({ objectMode: true });
        result._read = () => {};
        return result;
    }
};

// Test shortcuts

const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('GoodHttp', () => {

    it('honors the threshold setting and sends the events in a batch', { plan: 10 }, (done) => {

        const stream = internals.readStream();
        let hitCount = 0;
        const server = Http.createServer((req, res) => {

            let data = '';
            hitCount++;

            req.on('data', (chunk) => {

                data += chunk;
            });
            req.on('end', () => {

                const payload = JSON.parse(data);
                const events = payload.events;

                expect(req.headers['x-api-key']).to.equal('12345');
                expect(payload.schema).to.equal('good-http');
                expect(events.length).to.equal(5);

                if (hitCount === 1) {
                    expect(events[4].id).to.equal(4);
                    expect(events[4].event).to.equal('log');
                    res.end();
                }
                else if (hitCount === 2) {
                    expect(events[4].id).to.equal(9);
                    expect(events[4].event).to.equal('log');

                    res.end();
                    server.close(done);
                }
            });
        });

        server.listen(0, '127.0.0.1', () => {

            const reporter = new GoodHttp(internals.getUri(server), {
                threshold: 5,
                wreck: {
                    headers: {
                        'x-api-key': 12345
                    }
                }
            });

            stream.pipe(reporter);

            for (let i = 0; i < 10; ++i) {
                stream.push({
                    id: i,
                    event: 'log'
                });
            }
        });
    });

    it('sends each event individually if threshold is 0',  { plan: 9 }, (done) => {

        const stream = internals.readStream();
        let hitCount = 0;
        const server = Http.createServer((req, res) => {

            let data = '';
            req.on('data', (chunk) => {

                data += chunk;
            });
            req.on('end', () => {

                hitCount++;
                const payload = JSON.parse(data);
                expect(payload.events).to.exist();
                expect(payload.events).to.have.length(1);
                expect(payload.events[0].id).to.equal(hitCount - 1);

                res.writeHead(200);
                res.end();
                if (hitCount === 3) {
                    server.close(done);
                }
            });
        });

        server.listen(0, '127.0.01', () => {

            const reporter = new GoodHttp(internals.getUri(server), {
                endpoint: internals.getUri(server),
                threshold: 0
            });

            stream.pipe(reporter);

            for (let i = 0; i < 3; ++i) {

                stream.push({ id: i });
            }
        });
    });

    it('handles circular object references safely',  { plan: 4 }, (done) => {

        const stream = internals.readStream();
        let hitCount = 0;
        const server = Http.createServer((req, res) => {

            let data = '';
            hitCount++;

            req.on('data', (chunk) => {

                data += chunk;
            });
            req.on('end', () => {

                let events = JSON.parse(data);
                events = events.events;

                expect(events).to.exist();
                expect(events).to.have.length(5);
                expect(events[0]._data).to.equal('[Circular]');

                expect(hitCount).to.equal(1);

                res.end();

                server.close(done);
            });
        });

        server.listen(0, '127.0.0.1', () => {

            const reporter = new GoodHttp(internals.getUri(server), {
                threshold: 5
            });

            stream.pipe(reporter);

            for (let i = 0; i < 5; ++i) {

                const data = {
                    event: 'log',
                    timestamp: Date.now(),
                    id: i
                };

                data._data = data;

                stream.push(data);
            }
        });
    });

    it('makes a last attempt to send any remaining log entries on "finish"',  { plan: 2 }, (done) => {

        const server = Http.createServer((req, res) => {

            let data = '';

            req.on('data', (chunk) => {

                data += chunk;
            });
            req.on('end', () => {

                const payload = JSON.parse(data);
                expect(payload).to.include({
                    schema: 'good-http'
                });
                expect(payload.events).to.have.length(2);
                res.end();
                done();
            });
        });

        server.listen(0, '127.0.0.1', () => {

            const stream = internals.readStream();
            const reporter = new GoodHttp(internals.getUri(server));

            stream.pipe(reporter);
            stream.push({
                event: 'log',
                timestamp: Date.now(),
                id: 1
            });
            stream.push({
                event: 'log',
                timestamp: Date.now(),
                id: 2
            });
            stream.push(null);
        });
    });

    it('doesn\'t clear data on error until errorThreshold is reached', { plan: 15 }, (done) => {

        let hitCount = 0;
        let errorCallCount = 0;
        const server = Http.createServer((req, res) => {

            let data = '';
            hitCount++;

            req.on('data', (chunk) => {

                data += chunk;
            });
            req.on('end', () => {

                const payload = JSON.parse(data);
                const events = payload.events;

                expect(errorCallCount).to.equal(0);
                expect(events).to.have.length(hitCount);

                for (let i = 0; i < hitCount; ++i) {
                    expect(events[i].id).to.equal(i);
                }

                req.socket.destroy();
            });
        });

        server.listen(0, '127.0.0.1', () => {

            const stream = internals.readStream();
            const reporter = new GoodHttp(internals.getUri(server), {
                threshold: 0,
                errorThreshold: 2
            });

            reporter.on('error', () => {

                errorCallCount++;
                expect(hitCount).to.equal(3);
                expect(reporter._data).to.have.length(0);
                expect(errorCallCount).to.equal(1);
                server.close(done);
            });

            stream.pipe(reporter);

            for (let i = 0; i < 3; ++i) {
                stream.push({ id: i });
            }
        });
    });

    it('it always ignores errors and clears logs if errorThreshold is null', { plan: 5 }, (done) => {

        let hitCount = 0;
        const server = Http.createServer((req, res) => {

            let data = '';
            hitCount++;

            req.on('data', (chunk) => {

                data += chunk;
            });
            req.on('end', () => {

                const payload = JSON.parse(data);
                const events = payload.events;

                expect(events).to.have.length(1);
                expect(events[0].id).to.equal(hitCount - 1);
                req.socket.destroy();
            });
        });

        server.listen(0, '127.0.0.1', () => {

            const stream = internals.readStream();
            const reporter = new GoodHttp(internals.getUri(server), {
                threshold: 0,
                errorThreshold: null
            });

            reporter.on('error', () => {

                Code.fail('Request errors should not be reported');
            });

            reporter.on('finish', () => {

                expect(hitCount).to.equal(2);
                server.close(done);
            });

            stream.pipe(reporter);

            stream.push({ id: 0 });
            stream.push({ id: 1 });
            stream.push(null);
        });
    });

    it('reporters errors by default', { plan: 1 }, (done) => {

        let hitCount = 0;
        const server = Http.createServer((req, res) => {

            hitCount++;
            req.socket.destroy();
        });

        server.listen(0, '127.0.0.1', () => {

            const stream = internals.readStream();
            const reporter = new GoodHttp(internals.getUri(server), {
                threshold: 0
            });

            reporter.on('error', () => {

                expect(hitCount).to.equal(1);
                server.close(done);
            });

            stream.pipe(reporter);
            stream.push({ id: 0 });
            stream.push(null);
        });
    });
});
