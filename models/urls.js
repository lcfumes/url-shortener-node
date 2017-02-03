'use strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://mongodb.dev/fumes');

const urlScheme = {
    user:String,
    url:String,
    slug:String
}

let model = mongoose.model('Urls', urlScheme, 'url');

module.exports.findAll = callback => {
	model.find((err, doc) => {
        if (!err) {
		  callback(doc);
        }
	});
}

module.exports.findSlug = (urlSearch, callback) => {
    model.findOne({'slug': urlSearch}, (err, doc) => {
        callback(err, doc);
    });
}

module.exports.create = (payload, callback) => {
    let url = new model({
        user: payload.user,
        url: payload.url,
        slug: payload.slug
    });

    url.save(err => {
        if (!err) {
            module.exports.findSlug(payload.slug, (err, doc) => {
                callback(err, doc);
            })
        }
    })
}