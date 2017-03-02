'use strict';

let total = 0;
let all = 0;
let documents = [];

module.exports.setDocuments = (documents, all) => {
	if (documents === null) {
		return;
	}
    if (!Array.isArray(documents)) {
        documents = [documents];
    }
	this.total = documents.length;
	this.documents = documents;
	this.all = all;
}

module.exports.getDocuments = () => {
	return {
		total: this.total,
		all: this.all,
		_embedded: this.documents
	}
}