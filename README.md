# fiction-crawler
基于 nodejs 实现的笔趣阁网络小说爬虫工具

## 使用方法
1. 修改 config.js 中的 site_url 变量，值为笔趣库小说网站任意小说的目录页url，如 http://www.biquku.com/0/330/
    ```
    module.exports = {
        site_url: 'https://www.biquku.com/0/330/'
    };
    ```
2. 执行 `npm i`，安装依赖
3. 执行 `npm run build`，即会在 dist 目录下生成抓取的小说，入口为 index.html 文件
