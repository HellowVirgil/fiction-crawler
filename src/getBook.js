const Crawler = require('crawler');
const jsdom = require('jsdom');
const utils = require('./utils.js');
const siteUrl = require('./config.js').site_url;

let currentBook = {};
let timeStamp = new Date();

let c = new Crawler({
    jQuery: jsdom,
    maxConnections: 100,
    forceUTF8: true,
    // incomingEncoding: 'gb2312',
    // This will be called for each crawled page
    callback: function (error, res, done) {
        let $ = res.$;
        let urls = $('#list a');

        currentBook.title = $('#maininfo h1').text();
        currentBook.author = $('#info p').eq(0).text();
        currentBook.updateTime = $('#info p').eq(2).text();
        currentBook.latestChapter = $('#info p').eq(3).html();
        currentBook.intro = $('#intro').html();
        currentBook.chapters = [];

        for (let i = 0; i < urls.length; i++) {
            let $url = $(urls[i]);
            let url = $url.attr('href') + '';
            let num = url.replace('.html', '');
            let title = $url.text();

            currentBook.chapters.push({
                num: num,
                title: title,
                url: url
            });
        }

        for (let i = 0; i < currentBook.chapters.length; i++) {
            // 根据章节列表中的url获取每章正文
            getOneChapter(currentBook.chapters[i], currentBook.chapters[i - 1], currentBook.chapters[i + 1]);
        }

        // 生成目录
        utils.writeConfig(currentBook.title, currentBook);

        done();
    }
});

function getOneChapter(chapter, lastChapter, nextChapter) {
    // 每章正文
    c.queue({
        uri: siteUrl + chapter.num + '.html',
        jQuery: jsdom,
        forceUTF8: true,
        // The global callback won't be called
        callback: function (error, res, done) {
            let $ = res.$;
            let content = utils.formatContent($('#content').html());

            utils.writeChapter(currentBook.title, chapter, lastChapter, nextChapter, content, timeStamp);
            done();
            // process.exit();
        }
    });
}

function start() {
    // 章节列表
    c.queue(siteUrl);
}

start();
