'use strict';

const Hapi = require('hapi');
const Joi = require('joi');
const Urls = require('./models/urls.js');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

const options = {
    ops: {
        interval: 1000
    },
    reporters: {
        myConsoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        }, {
            module: 'good-console'
        }, 'stdout'],
        myFileReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ ops: '*' }]
        }, {
            module: 'good-squeeze',
            name: 'SafeJson'
        }, {
            module: 'good-file',
            args: ['./test/fixtures/awesome_log']
        }],
        myHTTPReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ error: '*' }]
        }]
    }
};

const urlCreateHandle = (request, reply) => {
    Urls.create(request.payload, (err, docs) => {
        let response = {
            total: 0,
            _embedded: {}
        }
        if (docs !== null) {
            response = {
                total: docs.length,
                _embedded: docs
            }
        }
        reply(response).code(201);
    });
}

const urlCreateConfig = {
    handler: urlCreateHandle, 
    validate: { 
        payload: { 
            user: Joi.string().min(1).required(), 
            url: Joi.string().min(1).required(), 
            slug: Joi.string().min(1).required(), 
    } }
};

server.register({
    register: require('good'),
    options: options
}, err => {
    if (err) {
        console.log(err);
    } else {
        server.route({
            method: 'GET',
            path: '/',
            handler: (request, reply) => {
                Urls.findAll(docs => {
                    let response = {
                        total: docs.length,
                        _embedded: docs
                    }
                    reply(response).code(200);
                })
            }
        })

        server.route({
            method: 'GET',
            path: '/{url}',
            handler: (request, reply) => {
                Urls.findSlug(request.params.url, (err, docs) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let response = {
                            total: 0,
                            _embedded: {}
                        }
                        if (docs !== null) {
                            response = {
                                total: docs.length,
                                _embedded: docs
                            }
                        }
                        reply(response).code(200);
                    }
                })
            }
        })

        server.route({
            method: 'POST',
            path: '/create',
            config: urlCreateConfig
        })

        server.start(() => {
            console.log(`Server running at: ${server.info.uri}`);
        })
    }
})