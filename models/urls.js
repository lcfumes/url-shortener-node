'use strict';

const sh = require("shorthash");

const mongoose = require('mongoose');
mongoose.connect('mongodb://mongodb.dev/fumes');

const urlScheme = {
    user:String,
    url:String,
    hash:String
}

let model = mongoose.model('Urls', urlScheme, 'url');

module.exports.findAll = callback => {
	model.find((err, doc) => {
        if (!err) {
		  callback(doc);
        }
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

module.exports.create = (payload, user, callback) => {
    let hash = sh.unique(payload.url.concat(user));
    
    this.findByHash(hash, (err, doc) => {
        if (doc !== null) {
            callback(err, doc);
            return;
        }
        let url = new model({
            user: user,
            url: payload.url,
            hash: hash
        });

        url.save(err => {
            if (!err) {
                this.findByHash(hash, (err, doc) => {
                    callback(err, doc);
                })
            }
        })
    });
}