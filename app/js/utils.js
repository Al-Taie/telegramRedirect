const { readFile } = require("fs").promises;
exports.minimizeCSS = function(_content) {
	if (!_content) return _content;
	let content = _content;

	content = content.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '');
	content = content.replace(/ {2,}/g, ' ');
	content = content.replace(/ ([{:}]) /g, '$1');
	content = content.replace(/([;,]) /g, '$1');
	content = content.replace(/ !/g, '!');
	return content;
};
exports.minimizeHTML = function(_content) {
	if (!_content) return _content;
	let content = _content;

	content = content.replace(/^\s+|\r\n|\n|\r|(>)\s+(<)|\s+$/gm, '$1$2');

	return content;
};
exports.detectLanguage = function(request) {
	let arPos = 100,
		enPos = 100;

	try {
		let lheader = request.headers['accept-language'];
		lheader = lheader.match(/[a-zA-Z\-]{2,10}/g).map(lang => lang.toLocaleLowerCase());

		lheader.forEach((lang, i) => {
			let posAr = lang.indexOf('ar');
			let posEn = lang.indexOf('en');

			if (posAr !== -1 && arPos > i) arPos = i;
			if (posEn !== -1 && enPos > i) enPos = i;
		});
	} catch (err) {
		console.error(
			'detectLanguage.e',
			err.message,
			request && request.headers ? request.headers['accept-language'] : '',
		);
	}

	return arPos <= enPos ? 'ar' : 'en';
};
exports.passVariables = function(html, variables) {
	for (let [key, value] of Object.entries(variables)) {
		const re = new RegExp(`%${key}%`, "g");
		html = html.replace(re, value);
	}
	return html;
};

exports.minimizeJavaScript = function(input) {
	if (!input) return input;

	const cleaned = input
		.replace(/\/\/[^\n]*\n/g, '')       // Remove single-line comments
		.replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
		.replace(/\n/g, ' ')               // Replace newlines with spaces
		.replace(/\s+/g, ' ');             // Remove extra spaces

	return cleaned.trim();
};

/* promise */
exports.to = function(promise) {
	return promise
		.then(data => {
			return [null, data];
		})
		.catch(err => [err]);
};

exports.readJSONFileAndConvertToDict = async function (filePath) {
		const data = await readFile(filePath, 'utf8');
		return JSON.parse(data);
}