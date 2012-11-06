var scraper = require('novel-bot/service/scraper');

var parser = module.exports = {

  parse : function(novelId) {
    scraper.scrapeContent(novelId);
  }

};
