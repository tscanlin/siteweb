'use-strict';

require('isomorphic-fetch')
const cheerio = require('cheerio')
const Url = require('url')
const Queue = require('promise-queue')
const defaultOptions = require('./defaultOptions.js')


function run(opt, callback) {
  const options = Object.assign({}, defaultOptions, opt)
  const queue = new Queue(options.concurrency, options.maxQueue)
  // Main data structure.
  const output = {
    pages: {
      internal: {},
      external: {},
    },
    stats: {
      startTime: Date.now(),
      endTime: null,
      totalTime: null,
    }
  }
  const requests = {}
  var pageCount = 0

  return new Promise(function(resolve, reject) {
    // Add start urls to queue.
    if (options.startUrls && options.startUrls.length) {
      options.startUrls.forEach(function(startUrl) {
        queue.add(function() {
          return fetchUrl(startUrl, true)
        }).then(checkQueue).catch(function(e) {
          console.error(e)
        })
      })
    }

    // Fetch a url
    function fetchUrl(url, internal) {
      const obj = {}
      pageCount++
      if (pageCount > options.maxPages) {
        throw new Error('Error: Maximum number of pages reached.')
      }
      url = url.split('#')[0]

      const p = new Promise(function(res, rej) {
        // Skip mailto and ftp links.
        if (url.indexOf('mailto:') === 0 || url.indexOf('ftp:') === 0) {
          res(output)
          return
        }
        setTimeout(function() {
          requests[url] = {}
          if (options.preFetchCallback) {
            options.preFetchCallback({
              output: output,
              promise: p,
              requests: requests,
              url: url,
            })
          }
          requests[url].startTime = Date.now()
          fetch(url, options.fetchOptions)
            .then(function(r) {
              requests[url].endTime = Date.now()
              requests[url].elapsedTime = requests[url].endTime - requests[url].startTime
              // Add request stuff to data object.
              obj.fetchTime = requests[url].elapsedTime
              obj.status = getHeader('last-modified', r)
              obj.contentLength = getHeader('content-length', r)
              return r.text()
            }).then(function(d) {
              const $ = cheerio.load(d)
              const links = $('a')

              // Build `output` object.
              obj.linkCount = links.length
              obj.url = url
              obj.isInternal = internal

              // This sets the data key on `output`.
              const where = internal ? 'internal' : 'external'
              output.pages[where][url] = obj

              if (internal) {
                links.each((i, link) => {
                  processLink(i, link, url)
                })
              }

              if (options.postFetchCallback) {
                options.postFetchCallback({
                  output: output,
                  promise: p,
                  requests: requests,
                  url: url,
                })
              }

              res(output)
            }).catch(function(e) {
              console.error(e)
            })
        }, options.delay)
      })

      return p
    }

    function processLink(i, link, url) {
      const href = link.attribs.href
      if (href) {
        const fullUrl = Url.resolve(url, href).split('#')[0]
        if (!requests[fullUrl]) {
          const fullUrlInternal = isInternal(url, fullUrl)
          if (fullUrlInternal || options.includeExternal) {
            if (fullUrlInternal || options.fetchExternal) {
              queue.add(function() {
                return fetchUrl(fullUrl, fullUrlInternal)
              }).then(checkQueue).catch(function(e) {
                if (callback) {
                  callback(e)
                }
                reject(e)
                console.error(e)
              })
            } else {
              output.pages.external[fullUrl] = {}
            }
          }
        }
      }
    }

    function checkQueue(data) {
      // Final result.
      if (queue.pendingPromises === 0) {
        output.stats.endTime = Date.now()
        output.stats.totalTime = output.stats.endTime - output.stats.startTime

        if (callback) {
          callback(null, output)
        }
        resolve(output)
      }
      return data
    }
  })
}


function getHeader(header, response) {
  return response.headers
    && response.headers._headers
    && response.headers._headers[header]
    && response.headers._headers[header][0]
}


function isInternal(baseUrl, url) {
  const hostname = Url.parse(baseUrl).hostname
  return hostname === Url.parse(url).hostname
}

module.exports = {
  run: run
}
