'use strict';

let total = 0;
let documents = [];

module.exports.setDocuments = documents => {
	if (documents != null) {
		this.total = documents.length;
		this.documents = documents;
	}
}

module.exports.getDocuments = () => {
	return {
		total: this.total,
		_embedded: this.documents
	}
}