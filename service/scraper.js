var scraper = require('scraper');

var service = module.exports = {

  setting : {
    NEW_LINE : "\n"
  },

  scrapeContent : function(url, callback) {
    scraper(url, function(error, $) {
      if (error) { throw error; }
      callback(
        $('#novel_view').text().split(service.setting.NEW_LINE)
      );
    });
  },

  scraperList : function(url, callback) {
    scraper(url, function(error, $) {
      if (error) { throw error; }
      
      var subtitles = [];
      $('.novel_sublist tr .period_subtitle').each(function() {
        subtitles.push($(this).find('a').text());
      });
      callback(subtitles);
    });
  }

};
