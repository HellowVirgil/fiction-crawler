const Crawler = require('crawler');
const jsdom = require('jsdom');
const utils = require('./utils.js');
const siteUrl = require('./config.js').site_url;

function initCrawler() {
  const currentBook = {};

  const c = new Crawler({
    jQuery: jsdom,
    maxConnections: 100,
    forceUTF8: true,
    // incomingEncoding: 'gb2312',
    // This will be called for each crawled page
    callback: (error, res, done) => {
      const { $ } = res;
      const urls = $('#list a');

      currentBook.title = $('#maininfo h1').text();
      currentBook.author = $('#info p').eq(0).text();
      currentBook.updateTime = $('#info p').eq(2).text();
      currentBook.latestChapter = $('#info p').eq(3).html();
      currentBook.intro = $('#intro').html();
      currentBook.chapters = [];

      for (let i = 0; i < urls.length; i++) {
        const $url = $(urls[i]);
        const url = $url.attr('href') + '';
        const num = url.replace('.html', '');
        const title = $url.text();

        currentBook.chapters.push({
          num,
          title,
          url,
        });
      }

      for (let i = 0; i < currentBook.chapters.length; i++) {
        // 根据章节列表中的url获取每章正文
        getOneChapter(
          c,
          currentBook.title,
          currentBook.chapters[i],
          currentBook.chapters[i - 1],
          currentBook.chapters[i + 1],
        );
      }

      // 生成目录
      utils.writeConfig(currentBook.title, currentBook);

      done();
    },
  });

  return c;
}

function getOneChapter(crawler, title, chapter, lastChapter, nextChapter) {
  const timeStamp = new Date();
  // 每章正文
  crawler.queue({
    uri: siteUrl + chapter.num + '.html',
    jQuery: jsdom,
    forceUTF8: true,
    // The global callback won't be called
    callback: (error, res, done) => {
      const $ = res.$;
      const content = utils.formatContent($('#content').html());

      utils.writeChapter(title, chapter, lastChapter, nextChapter, content, timeStamp);
      done();
      // process.exit();
    },
  });
}

function start() {
  const c = initCrawler();

  // 章节列表
  if (typeof siteUrl === 'string') {
    c.queue(siteUrl);
  } else if (Object.prototype.toString.call(siteUrl) === '[object Array]') {
    siteUrl.forEach((item) => {
      c.queue(item);
    });
  } else {
    throw new Error('Invalid site_url type.');
  }
}

start();
