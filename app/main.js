(async () => {
	const http = require("http");
	const url = require("url");
	const querystring = require("querystring");
	let fsPromise = require("fs").promises;
	const __ = require("./js/utils");

	/* config */
	const PORT = +process.env.PORT || 3020;
	const COUNTER = +process.env.COUNTER || 0;
	const DEBUG = process.env.DEBUG || false;

	const track = "";
	if (process.env.TRACKER_CONFIG_FILE)
		[err, track] = await __.to(fsPromise.readFile(process.env.TRACKER_CONFIG_FILE));
	if (!track && process.env.TRACKER_SECRET_FILE)
		[err, track] = await __.to(fsPromise.readFile("/run/secrets/" + process.env.TRACKER_SECRET_FILE));

	let embed = "";
	if (process.env.EMBED_FILE) [err, embed] = await __.to(fsPromise.readFile(process.env.EMBED_FILE));

	const TRACKER = track || "";
	const EMBED = embed || "";

	console.log("APP_CONFIG", {
		PORT,
		COUNTER,
		DEBUG,
		TRACKER: !!TRACKER,
		EMBED: !!EMBED
	});

	/* prepare content */
	let tsStart = new Date().getTime();

	//css
	let css = await fsPromise.readFile("./app/public/css/style.css");
	css = __.minimizeCSS(css.toString());

	//js
	let indexJs = (await fsPromise.readFile("./app/js/index.js")).toString();
	let redirectJs = (await fsPromise.readFile("./app/js/redirect.js")).toString();
	let backgroundJs = (await fsPromise.readFile("./app/js/background.js")).toString();

	//images
	let favicon = await fsPromise.readFile("./app/public/favicon.ico");
	let telegram_png = await fsPromise.readFile("./app/public/img/website_icon.svg");

	//html
	let htmlPages = {
		indexPage: await fsPromise.readFile("./app/html/index.html"),
		redirectPage: await fsPromise.readFile("./app/html/redirect.html")
	};
	let globalVars = {
		COUNTER,
		TRACKER,
		EMBED,
		CSS: css,
		BACKGROUND_JS: backgroundJs,
		REDIRECT_JS: redirectJs,
		INDEX_JS: indexJs,
	};

	//translation
	let translatedHTML = {
		indexPage: {},
		redirectPage: {}
	};

	let LANG_DICT = await require('./locales/language.js');

	Object.keys(LANG_DICT).forEach(lang => {
		Object.keys(translatedHTML).forEach(page => {
			translatedHTML[page][lang] = __.passVariables(
				htmlPages[page].toString(),
				Object.assign(LANG_DICT[lang], globalVars, { language: lang })
			);
			//translatedHTML[page][lang] = __.minimizeHTML(translatedHTML[page][lang]);
		});
	});

	//utility
	let robots = await fsPromise.readFile("./app/public/robots.txt");
	let sitemap_ar = await fsPromise.readFile("./app/public/sitemap_ar.xml");
	let sitemap_en = await fsPromise.readFile("./app/public/sitemap_en.xml");

	//garbage
	delete htmlPages;
	delete globalVars;
	delete css;
	delete fsPromise;
	delete LANG_DICT;

	if (DEBUG) console.log("content prepared", "+" + ((new Date().getTime() - tsStart) / 1000).toFixed(2) + " sec");

	/* serve requests */
	const server = http.createServer(async (request, response) => {
		let { pathname, query } = url.parse(request.url);
		query = querystring.parse(query);
		let queryLang = query.lang && (query.lang === "ar" || query.lang === "en") ? query.lang : false;

		let language = queryLang ? queryLang : __.detectLanguage(request);
		if (DEBUG) console.log("req", language, request.headers.host, pathname);

		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		response.setHeader("Content-Language", language);
		response.setHeader("status", 200);

		if (pathname === "/") {
			response.setHeader("Content-Type", "text/html; charset=utf-8");
			response.end(translatedHTML.indexPage[language]);
		} else if (pathname === "/favicon.ico") {
			response.setHeader("Content-Type", "image/x-icon");
			response.end(favicon);
		} else if (pathname === "/img/telegram.png") {
			response.setHeader("Content-Type", "image/png");
			response.end(telegram_png);
		} else if (pathname === "/robots.txt") {
			response.setHeader("Content-Type", "text/plain");
			response.end(robots);
		} else if (pathname === "/sitemap_ar.xml") {
			response.setHeader("Content-Type", "application/xml");
			response.end(sitemap_ar);
		} else if (pathname === "/sitemap_en.xml") {
			response.setHeader("Content-Type", "application/xml");
			response.end(sitemap_en);
		} else {
			response.setHeader("Content-Type", "text/html; charset=utf-8");
			response.end(translatedHTML.redirectPage[language]);
		}
	});

	/* start server */
	server.listen(PORT, err => {
		if (err) return console.log("something bad happened", err.message);
		console.log(`server is listening on ${PORT}`);
	});
})();
