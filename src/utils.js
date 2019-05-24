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

        let catalog = book.chapters.map(element => `<li class="catalog-item"><a href="${element.url}">${element.title}</a></li>`).join('');
        let content = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <link rel="stylesheet" href="../../src/style.css">
                <title>${book.title}</title>
            </head>
            <body>
                <h3 class="title">${book.title}</h3>
                <p class="author">作者：${book.author}</p>
                <p class="update-time">更新时间：${book.updateTime}</p>
                <div class="latest-chapter">最新章节：${book.latestChapter}</div>
                <div class="intro">简介：${book.intro}</div>
                <ul class="catalog">
                    <p>目录：</p>
                    ${catalog}
                </ul>
            </body>
        </html>`;

        fs.writeFile('dist/' + bookTitle + '/' + 'index.html', content, function (err) {
            if (err) {
                throw err;
            }

            debug('It\'s saved!');
            console.log('目录生成成功！');
        });
    });
};

exports.formatContent = function (html) {
    html = html.replace(/&nbsp;/g, '');
    let paragraphes = html.split('<br>');

    paragraphes = paragraphes.map(paragraph => {
        if (paragraph) {
            return '<p>' + paragraph + '</p>';
        }

        return '';
    });

    return paragraphes.join('');
}
