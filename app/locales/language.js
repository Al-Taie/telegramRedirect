const utils = require("../js/utils");

async function getLanguageDictionary() {
  let ar = await utils.readJSONFileAndConvertToDict("./app/locales/ar.json");
  let en = await utils.readJSONFileAndConvertToDict("./app/locales/en.json");

  return {
    en: en,
    ar: ar
  };
}

module.exports = getLanguageDictionary();