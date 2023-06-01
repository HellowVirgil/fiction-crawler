const fs = require('fs');
const debug = require('debug')('crawler');
const mkdirp = require('mkdirp');

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

exports.writeConfig = function (bookTitle, book) {
  mkdirp(`dist/${bookTitle}`, (err) => {
    if (err) {
      console.error(err);
    } else {
      debug('pow!');
    }

    const catalog = book.chapters
      .map(
        (element) => `<li class="catalog-item"><a href="dist/${element.title}.html">${element.title}</a></li>`,
      )
      .join('');
    const content = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <link rel="stylesheet" href="/assets/style.css">
          <title>${book.title}</title>
        </head>
        <body>
          <h3 class="title">${book.title}</h3>
          <ul class="catalog">
            <p>目录：</p>
            ${catalog}
          </ul>
        </body>
      </html>`;

    fs.writeFile(`dist/${bookTitle}/index.html`, content, (e) => {
      if (e) {
        throw e;
      }

      debug("It's saved!");
      console.log('目录生成成功！');
    });
  });
};

exports.formatContent = function (html) {
  const parsedHtml = html.replace(/&nbsp;/g, '');
  let paragraphes = parsedHtml.split('<br>');

  paragraphes = paragraphes.map((paragraph) => {
    if (paragraph) {
      return '<p>' + paragraph + '</p>';
    }

    return '';
  });

  return paragraphes.join('');
};
