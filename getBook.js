const Crawler = require('crawler');
const jsdom = require('jsdom');
const utils = require('./utils.js');
const site_url = require('./config.js').site_url;

let current_book = {};
let timeStamp = new Date();

let c = new Crawler({
    jQuery: jsdom,
    maxConnections: 100,
    forceUTF8: true,
    // incomingEncoding: 'gb2312',
    // This will be called for each crawled page
    callback: function (error, result, $) {
        let urls = $('#list a');

        current_book.title = $('#maininfo h1').text();
        current_book.author = $('#info p').eq(0).text();
        current_book.update_time = $('#info p').eq(2).text();
        current_book.latest_chapter = $('#info p').eq(3).html();
        current_book.intro = $('#intro').html();
        current_book.chapters = [];

        for (let i = 0; i < urls.length; i++) {
            let $url = $(urls[i]);
            let _url = $url.attr('href') + '';
            let num = _url.replace('.html', '');
            let title = $url.text();

            current_book.chapters.push({
                num: num,
                title: title,
                url: _url
            });
        }

        for (let i = 0; i < current_book.chapters.length; i++) {
            // 根据章节列表中的url获取每章正文
            getOneChapter(current_book.chapters[i], current_book.chapters[i - 1], current_book.chapters[i + 1]);
        }

        // 生成 book.json
        utils.write_config(current_book.title, current_book);
    }
});

function getOneChapter(chapter, lastChapter, nextChapter) {
    // 每章正文
    c.queue([{
        uri: site_url + chapter.num + '.html',
        jQuery: jsdom,
        forceUTF8: true,
        // The global callback won't be called
        callback: function (error, result, $) {
            var content = $('#content').html();
            utils.write_chapter(current_book.title, chapter, lastChapter, nextChapter, content, timeStamp);

            // process.exit();
        }
    }]);
}

function start() {
    // 章节列表
    c.queue(site_url);
}

start();
