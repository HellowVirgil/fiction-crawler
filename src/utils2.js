const fs = require('fs');
const debug = require('debug')('crawler');
const mkdirp = require('mkdirp');
const path = require('path');

exports.writeChapter = function (bookTitle, chapter, lastChapter, nextChapter, content, timeStamp) {
  const chapterName = chapter.name;
  const lastChapterName = lastChapter ? lastChapter.name : null;
  const nextChapterName = nextChapter ? nextChapter.name : null;

  content = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="stylesheet" href="/assets/style.css">
        <title>${chapter.title}</title>
      </head>
      <body>
        <h3 class="title">${chapter.title}</h3>
        <div class="content">${content}</div>
        <div class="pagination">
          ${lastChapterName ? `<a href="dist/${lastChapterName}.html">上一个</a>` : ''}
          ${nextChapterName ? `<a href="dist/${nextChapterName}.html">下一个</a>` : ''}
        </div>
      </body>
    </html>`;

  fs.writeFile(`dist/${bookTitle}/${chapterName}.html`, content, (err) => {
    if (err) {
      throw err;
    }

    debug("It's saved!");
    console.log(chapter.title + ' 抓取完成！累计耗时' + (new Date() - timeStamp) + 'ms');
  });
};

exports.writeProject = function (project, res) {
  mkdirp(`dist/${project}`, (err) => {
    if (err) {
      console.error(err);
    } else {
      debug('pow!');
    }

    const content = `<!DOCTYPE html>
    <html lang="zh-CN">
    ${res}
    </html>`;

    fs.writeFile(`dist/${project}/index.html`, content, (e) => {
      if (e) {
        throw e;
      }

      debug("It's saved!");
      console.log('目录生成成功！');
    });
  });
};

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

exports.mkdirsSync = mkdirsSync

exports.formatContent = function (html) {
  const parsedHtml = html.replace(/&nbsp;/g, '');
  let paragraphes = parsedHtml.split('<br>');

  paragraphes = paragraphes.map((paragraph) => {
    if (paragraph) {
      return '<div>' + paragraph + '</div>';
    }

    return '';
  });

  return paragraphes.join('');
};

