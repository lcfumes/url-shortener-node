'use strict';

const Urls = require('../models/urls.js');
const Joi = require('joi');

module.exports.urlCreateHandle = (request, reply) => {
    let userIp = request.raw.req.connection.remoteAddress;
    Urls.create(request.payload, userIp, (err, docs, created) => {
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
        let code = 201;
        if (!created) {
            code = 200;
        }
        reply(response).code(code);
    });
}

module.exports.urlCreateConfig = {
    handler: this.urlCreateHandle, 
    validate: { 
        payload: { 
            url: Joi.string().min(1).required()
        },
        headers: Joi.object().keys({
          'content-type': Joi.string().required().valid(['application/json']).default('application/json')          
        }).unknown()
    }
};

module.exports.findUrl = (request, reply) => {
    Urls.findByHash(request.params.url, (err, docs) => {
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

module.exports.getAllUrl = (request, reply) => {
    Urls.findAll(docs => {
        let response = {
            total: docs.length,
            _embedded: docs
        }
        reply(response).code(200);
    })
}