const fs = require('fs');
const debug = require('debug')('crawler');
const mkdirp = require('mkdirp');

exports.writeChapter = function (bookTitle, chapter, lastChapter, nextChapter, content, timeStamp) {
    let chapterNum = parseInt(chapter.num, 10);
    let lastChapterNum = lastChapter ? parseInt(lastChapter.num, 10) : null;
    let nextChapterNum = nextChapter ? parseInt(nextChapter.num, 10) : null;

    content = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <link rel="stylesheet" href="../../src/style.css">
            <title>${chapter.title}</title>
        </head>
        <body>
            <h3 class="title">${chapter.title}</h3>
            <div class="content">${content}</div>
            <div class="pagination">
                ${lastChapterNum ? `<a href="${lastChapterNum}.html">上一章</a>` : ''}
                ${nextChapterNum ? `<a href="${nextChapterNum}.html">下一章</a>` : ''}
            </div>
        </body>
    </html>`;
    content = content.replace('[笔趣库手机版 m.biquku.com]', '');

    fs.writeFile('dist/' + bookTitle + '/' + chapterNum + '.html', content, function (err) {
        if (err) {
            throw err;
        }

        debug('It\'s saved!');
        console.log(chapter.title + ' 抓取完成！累计耗时' + (new Date() - timeStamp) + 'ms');
    });
};

exports.writeConfig = function (bookTitle, book) {
    mkdirp('dist/' + bookTitle, function (err) {
        if (err) {
            console.error(err);
        }
        else {
            debug('pow!');
        }

        var content = JSON.stringify(book, null, 4); // Indented 4 spaces

        fs.writeFile('dist/' + bookTitle + '/' + 'book.json', content, function (err) {
            if (err) {
                throw err;
            }

            debug('It\'s saved!');
            console.log('book.json 生成成功！');
        });
    });
};
