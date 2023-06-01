const Crawler = require('crawler');
const jsdom = require('jsdom');
const fs = require('fs');
var request = require('request');
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
      const urls = $('#main .type-post h2 a');
      currentBook.title = ''
      currentBook.chapters = [];

      for (let i = 0; i < urls.length; i++) {
        const $url = $(urls[i]);
        const url = $url.attr('href') + '';
        const urlArr = url.split('/')
        const name = decodeURI(urlArr[urlArr.length-2])
        const title = name

        currentBook.chapters.push({
          name,
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

let downloadNum = 0
function download_img(img_url, file_name){
  console.log(img_url)
  downloadNum++
  request(encodeURI(img_url)).pipe(fs.createWriteStream(file_name)).on('close',function(){
    downloadNum--
    console.log('pic saved!', downloadNum)
  })
}

function getOneChapter(crawler, title, chapter, lastChapter, nextChapter) {
  const timeStamp = new Date();
  // 每章正文
  crawler.queue({
    uri: chapter.url,
    jQuery: jsdom,
    forceUTF8: true,
    // The global callback won't be called
    callback: (error, res, done) => {
      const $ = res.$;
      const srcs = []
      let html = $('#main').html()
      html = html.replace(/https[^\"]*jp(e)?g/g, src => {
        src.split(' ').forEach(s => {
          if (s.match('http')) {
            srcs.push(s)
          }
        })
        return src.replace(/(.*\/)/g, '/dist/')
      })
      html = html.replace(/https[^\"]*mp4/g, src => {
        src.split(' ').forEach(s => {
          if (s.match('http')) {
            srcs.push(s)
          }
        })
        return src.replace(/(.*\/)/g, '/dist/')
      })
      const content = utils.formatContent(html);

      for (let i = 0; i < srcs.length; i++) {
        const src = srcs[i]
        const _src = src.replace(/(.*\/)/g, 'dist/')
        download_img(src, _src)
      }

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
