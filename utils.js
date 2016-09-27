var fs = require('fs');
var debug = require('debug')('crawler');
var mkdirp = require('mkdirp');

exports.write_chapter = function(book_path, chapter, content){
  content = content.replace('[笔趣库手机版 m.biquku.com]', '');

  fs.writeFile('dist/' + book_path + chapter.num + '.html', content, function (err) {
    if (err) throw err;
    debug('It\'s saved!');
  });
}

exports.write_config = function(book_path, book){
  mkdirp('dist/' + book_path, function (err) {
      if (err) console.error(err);
      else debug('pow!');

      var content =  JSON.stringify(book, null, 4); // Indented 4 spaces

      fs.writeFile('dist/' + book_path + 'book.json', content, function (err) {
        if (err) throw err;
        debug('It\'s saved!');
      });
  });
}
