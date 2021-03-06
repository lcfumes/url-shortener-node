'use strict';

const sh = require("shorthash");

const urlSchema = require("../config/url.scheme.js");

const urlScheme = urlSchema.urlSchema;

let model = database.model('Urls', urlScheme, 'url');

module.exports.totalDocs = callback => {
    model.count({}, (err, count) => {
        callback(err, count)
    })
}

module.exports.findAll = (page, limit, callback) => {
    page = (page > 0) ? page - 1 : page;
    model.find({})
    .skip((parseInt(page) * parseInt(limit)))
    .limit(parseInt(limit))
    .sort({'created_at': 'desc'})
    .exec(function(err, doc) {
        callback(doc);
    });
}

module.exports.findByUrl = (url, callback) => {
    this.findByHash(sh.unique(url), callback)
}

module.exports.findByHash = (hash, callback) => {
    model.findOne({'hash': hash}, (err, doc) => {
        callback(err, doc);
    });
}

module.exports.findByFields = (object, callback) => {
    model.findOne(object, (err, doc) => {
        callback(err, doc);
    })
}

module.exports.create = (payload, ip, callback) => {
    let hash = sh.unique(payload.url.concat(ip));
    
    this.findByHash(hash, (err, doc) => {
        if (doc !== null) {
            callback(err, doc, false);
            return;
        }
        let url = new model({
            ip: ip,
            url: payload.url,
            hash: hash,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime()
        });

        url.save(err => {
            if (!err) {
                this.findByHash(hash, (err, doc) => {
                    callback(err, doc, true);
                })
            }
        })
    });
}

module.exports.update = (request, ip, callback) => {
    let hash = sh.unique(request.payload.url.concat(ip.concat(new Date())));
    let query = {'hash': request.params.hash};
    let update = {
            $set: {
                ip: ip,
                url: request.payload.url,
                hash: hash,
                updated_at: new Date().getTime()
            }
    };
    this.findByHash(request.params.hash, (err, doc) => {
        if (doc !== null) {
            model.update(query, update, {multi: false}, (err, doc) => {
                if (!err) {
                    this.findByHash(hash, (err, doc) => {
                        callback(err, doc, true);
                    })
                } else {
                    console.log(err);
                }
            });
        } else {
            callback(null, [], false);
        }
    });
}

module.exports.deleteByHash = (hash, callback) => {
    this.findByHash(hash, (err, doc) => {
        if (doc === null) {
            callback(err, false);
            return;
        }
        model.remove({'hash': hash}, (err) => {
            callback(err, true);
        })
    });
}
