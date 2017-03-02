'use strict';

const UrlsModel = require('../models/UrlsModel.js');
const Joi = require('joi');
const EntityDocuments = require('../entities/DocumentsEntity.js')

module.exports.urlCreateHandle = (request, reply) => {
    let userIp = request.raw.req.connection.remoteAddress;
    UrlsModel.create(request.payload, userIp, (err, docs, created) => {
        if (docs !== null) {
            EntityDocuments.setDocuments(docs)
        }
        let code = 201;
        if (!created) {
            code = 200;
        }
        reply(EntityDocuments.getDocuments()).code(code);
    });
}

module.exports.urlUpdateHandle = (request, reply) => {
    let userIp = request.raw.req.connection.remoteAddress;
    UrlsModel.update(request, userIp, (err, docs, updated) => {
        if (docs !== null) {
            EntityDocuments.setDocuments(docs)
        }
        let code = 200;
        if (!updated) {
            code = 204;
        }
        reply(EntityDocuments.getDocuments()).code(code);
    });
}

module.exports.findUrl = (request, reply) => {
    UrlsModel.findByHash(request.params.hash, (err, docs) => {
        if (err) {
            console.error(err);
        } else {
            if (docs !== null) {
                EntityDocuments.setDocuments(docs);
                reply(EntityDocuments.getDocuments()).code(200);
            } else {
                reply({}).code(404);
            }            
        }
    })
}

module.exports.getAllUrl = (request, reply) => {
    UrlsModel.findAll(docs => {
        EntityDocuments.setDocuments(docs)
        reply(EntityDocuments.getDocuments()).code(200);
    })
}

module.exports.deleteUrl = (request, reply) => {
    UrlsModel.deleteByHash(request.params.hash, (err, deleted) => {
        if (err) {
            console.error(err);
        } else {
            let code = 204;
            if (!deleted) {
                code = 404;
            }
            reply().code(code);
        }
    })
}

module.exports.urlFindToRedirect = (request, reply) => {
    UrlsModel.findByHash(request.params.hash, (err, docs) => {
        if (!err) {
            if (docs !== null) {
                reply.redirect(docs.url).code(301);
            } else {
                reply().code(404);
            }
        } else {
            reply().code(500);
        }
    })
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

module.exports.urlUpdateConfig = {
    handler: this.urlUpdateHandle, 
    validate: { 
        payload: { 
            url: Joi.string().min(1).required()
        },
        headers: Joi.object().keys({
          'content-type': Joi.string().required().valid(['application/json']).default('application/json')          
        }).unknown()
    }
}

module.exports.urlFindConfig = {
    handler: this.findUrl
};

module.exports.urlFindAllConfig = {
    handler: this.getAllUrl
};

module.exports.urlDeleteConfig = {
    handler: this.deleteUrl
}

module.exports.urlFindToRedirectConfig = {
    handler: this.urlFindToRedirect
}