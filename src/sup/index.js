const fs = require('fs');
const Crawler = require('crawler');
const jsdom = require('jsdom');
const path = require('path');
const request = require('request');
const mkdirp = require('mkdirp');
const debug = require('debug')('crawler');

var log4js = require('log4js');

log4js.configure({
	"appenders":{
        pageStart: {
            "type": "file",
            "filename": path.resolve(__dirname, '../../logs/pageStart.log'),
            "category": "pageStart" 
        },
        pageEnd: {
            "type": "file",
            "filename": path.resolve(__dirname, '../../logs/pageEnd.log'),
            "category": "pageEnd" 
        },
        assetsStart: {
            "type": "file",
            "filename": path.resolve(__dirname, '../../logs/assetsStart.log'),
            "category": "assetsStart" 
        },
        assetsEnd: {
            "type": "file",
            "filename": path.resolve(__dirname, '../../logs/assetsEnd.log'),
            "category": "assetsEnd" 
        },
		console: { type: 'console' }
	},
    categories: {
        cheese: { appenders: ['pageEnd'], level: 'error' },
        another: { appenders: ['console'], level: 'trace' },
        default: { appenders: ['console', 'pageStart'], level: 'trace' },
        pageEnd: { appenders: ['console', 'pageEnd'], level: 'trace' },
        pageStart: { appenders: ['console', 'pageStart'], level: 'trace' },
        assetsStart: { appenders: ['console', 'assetsStart'], level: 'trace' },
        assetsEnd: { appenders: ['console', 'assetsEnd'], level: 'trace' },
    }
})
var pageStart = log4js.getLogger('pageStart')
var pageEnd = log4js.getLogger('pageEnd')
var assetsStart = log4js.getLogger('assetsStart')
var assetsEnd = log4js.getLogger('assetsEnd')


class Core {
    constructor(siteUrl) {
        this.c = null
        this.project = siteUrl
        this.startUrl = ''
        this.projectDir = this.formatDir(siteUrl)
        this.projectDirFull = `/dist/${this.projectDir}/`
        this.pageSum = 0
        this.currentPage = {
            title: '',
            chapters: []
        }
        this.downloadNum = 0
    }
    start(url = '') {
        this.startUrl = url || this.project
        this.initCrawler();

        // 章节列表
        if (typeof this.startUrl === 'string') {
            this.c.queue(this.startUrl);
        } else if (Object.prototype.toString.call(this.startUrl) === '[object Array]') {
            this.startUrl.forEach((item) => {
                this.c.queue(item);
            });
        } else {
            throw new Error('Invalid site_url type.');
        }
    }
    initCrawler() {
      
        this.c = new Crawler({
            jQuery: jsdom,
            // maxConnections: 10,
            rateLimit: 2e3,
            forceUTF8: true,
            timeout: 1e5,
            // incomingEncoding: 'gb2312',
            // This will be called for each crawled page
            callback: (error, res, done) => {
                if (error) {
                    pageEnd.error(error)
                } else {
                    const { $ } = res;

                    // 获取详情页------------------------- start
                    const urls = $('a');

                    this.getUrls($, urls)
                    // 获取详情页------------------------- end
                    
                    // 生成首页内容-------------------- start
                    let html = $('html').html()
                    
                    const content = this.formatContent(html);
            
                    const dirName = `dist/${this.projectDir}/` + decodeURI(this.startUrl.replace(this.project, ''))
                    this.writePage(dirName, content);
                    // 生成首页内容-------------------- end
                }
                done();
            },
        });
      
    }
    
    getUrls($, urls) {
        for (let i = 0; i < urls.length; i++) {
            const $url = $(urls[i]);
            const url = $url.attr('href') + '';
            const urlArr = url.split('/')
            const dirArr = url.split(this.project)
            const dirName = decodeURI(dirArr[dirArr.length-1])
            const name = decodeURI(urlArr[urlArr.length-2])
            const title = name
            const isLoaded = false
            if (!this.currentPage.chapters.find(el => el.url === url)) {
                this.currentPage.chapters.push({name, title, url, dirName, isLoaded});
            }
        }
        for (let i = 0; i < this.currentPage.chapters.length; i++) {
            const item = this.currentPage.chapters[i]
            const href = decodeURI(item.url)
            const isProject = !!item.url.match(this.project) && !!href.match(/[\u4E00-\u9FA5]/g)
            if (isProject && !item.isLoaded) {
                this.pageSum ++
                item.isLoaded = true
                // url获取正文
                // setTimeout(() => {
                    this.getOneChapter(item);
                // }, 5e3 * i);
            }
        }
        console.log('>>>pageSum ', this.pageSum)
    }
    downloadImg(imgUrl, fileName) {
        if(fs.existsSync(fileName)) {
            return false
        }
        const dirName = fileName.match(/(.*)\//)[1]
        
        if(!fs.existsSync(dirName)) {
            this.mkdirsSync(dirName)
        }
        // this.downloadNum++
        assetsStart.info(decodeURI(imgUrl))
        request(encodeURI(imgUrl)).pipe(fs.createWriteStream(fileName)).on('close', () => {
            // this.downloadNum--
            // console.log('pic saved!', this.downloadNum)
            assetsEnd.info(decodeURI(imgUrl))
        }).on('error', e => {
            assetsEnd.error(e)
        })
    }
    mkdirsSync(dirName) {
        if(fs.existsSync(dirName)) {
            return true;
        } else {
            if(this.mkdirsSync(path.dirname(dirName))) {
                fs.mkdirSync(dirName);
                return true;
            }
        }
    }
    formatContent(html) {
        const srcs = []

        // 读取资源文件，更换资源文件地址
        const replaceList = [/http(s)?[^\"]*jp(e)?g/g, /http(s)?[^\"]*mp4/g, /http(s)?[^\"]*css/g, /http(s)?[^\"]*png/g, /http(s)?[^\"]*svg/g]
        replaceList.forEach(rex => {
            html = html.replace(rex, src => {
                src.split(' ').forEach(s => {
                    if (s.match('http')) {
                        srcs.push(s.replace(/\\/g, ''))
                    }
                })
                return src.replace(/http[^"]*(com|org)\//g, this.projectDirFull)
            })
        })

        // 删除脚本文件，屏蔽脚本内容
        html = html.replace(/\<script.*script\>/g, '')
        html = html.replace(/script/g, 'noscript')
        html = html.replace(/http(s)?:\/\/[^"\s]*/g, s => {
            if (s.match(this.project)) {
                return s
            } else {
                return ''
            }
        })
        
        // 删除srcset
        html = html.replace(/srcset/g, '_srcset')

        // 下载资源
        for (let i = 0; i < srcs.length; i++) {
            const src = srcs[i]
            const fileName = src.replace(/(.*\/)/g, '')
            const _src = src.replace(/http[^"]*(com|org)/g, path.resolve(__dirname, '../..' + this.projectDirFull))
            if (fileName.match(/\./)) {
                this.downloadImg(src, _src)
            }
        }

        // 更换超链接地址
        html = html.replace(/&nbsp;/g, '');
        html = html.replace(/(")(http(s)?:\/\/[^"]*)(")/g, s => {
            const href = decodeURI(s)
            if (href.match(/[\u4E00-\u9FA5]/g)) {
                return href.replace(this.project, this.projectDirFull)
            } else {
                return '""'
            }
        })
        
        return html
    }
    formatDir(filepath) {
        return filepath.replace(/[\.:]/g, '_').replace(/\//g, '')
    }
    writePage(filepath, res) {
        mkdirp(filepath, (err) => {
            if (err) {
                console.error(err);
            } else {
                debug('pow!');
            }
        
            const content = `<!DOCTYPE html>
            <html lang="zh-CN">
            ${res}
            </html>`;
        
            fs.writeFile(`${filepath}index.html`, content, (e) => {
                if (e) {
                    throw e;
                }
            
                debug("It's saved!");
                console.log('页面生成成功！');
            });
        });
    }
    getOneChapter(chapter) {
        pageStart.info(decodeURI(chapter.url))
        // 分页
        this.c.queue({
            uri: chapter.url,
            jQuery: jsdom,
            forceUTF8: true,
            // The global callback won't be called
            callback: (error, res, done) => {
                pageEnd.info(decodeURI(chapter.url))
                if (error) {
                    pageEnd.error(error)
                }
                else {
                    const { $ } = res;
                    let html = $('html').html()
                    
                    // 获取详情页------------------------- start
                    const urls = $('a');

                    this.getUrls($, urls)
                    // 获取详情页------------------------- end

                    const content = this.formatContent(html);
                    const dirName = `dist/${this.projectDir}/${chapter.dirName}`

                    this.writePage(dirName, content);
                }
                done();
            },
        });
    }
}

const core = new Core('https://lxsw2020.com/')
// 'https://lxsw2020.com/category/%E6%A8%A1%E7%89%B9%E5%B1%95%E7%A4%BA/page/14/'
core.start()