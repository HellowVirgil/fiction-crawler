var Crawler = require("crawler");
var jsdom = require('jsdom');
var utils = require('./utils.js')

var current_book = {};
var site_url = 'http://www.biquku.com/0/330/';
var book_path = site_url.split('http://www.biquku.com/')[1];

var c = new Crawler({
    jQuery: jsdom,
    maxConnections : 100,
    forceUTF8:true,
    // incomingEncoding: 'gb2312',
    // This will be called for each crawled page
    callback : function (error, result, $) {
      var urls = $('#list a');
      
      current_book.title = $('#maininfo h1').text();
      current_book.author = $('#info p').eq(0).text();
      current_book.update_time = $('#info p').eq(2).text();
      current_book.latest_chapter = $('#info p').eq(3).html();
      current_book.intro = $('#intro').html()
      current_book.chapters = [];

      for(var i = 0; i< urls.length; i++){
        var url = urls[i]

        var _url = $(url).attr('href') + "";
        var num = _url.replace('.html','');
        var title = $(url).text();

        current_book.chapters.push({
          num: num,
          title: title,
          url: _url
        });

        // 根据章节列表中的url获取每章正文
        getOneChapter(current_book.chapters[i]);
      }

      // 生成 book.json
      utils.write_config(book_path, current_book);
    }
});

function getOneChapter(chapter){
  // 每章正文
  c.queue([{
    uri: site_url + chapter.num + '.html',
    jQuery: jsdom,
    forceUTF8:true,
    // The global callback won't be called
    callback: function (error, result, $) {
      var content = $('#content').html();
      utils.write_chapter(book_path, chapter, content);
      
      //process.exit();
    }
  }]);
}

function start(){
  // 章节列表
  c.queue(site_url);
}

start();
