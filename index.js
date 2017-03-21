#!/usr/bin/env node

require('isomorphic-fetch')
const queue = require('d3-queue')
const cheerio = require('cheerio')
const Url = require('url')

const defaultOptions = {
  concurrency: 4
}

function buildOutput(opt, callback) {
  const options = Object.assign({}, defaultOptions, opt)
  const output = {
    pages: {
      internal: {},
      external: {},
    }
  }
  const requests = {}

  const q = queue.queue(options.concurrency)

  if (options.startUrls && options.startUrls.length) {
    options.startUrls.forEach(function(startUrl) {
      q.defer(fetchUrl, startUrl)
      // q.defer(setTimeout, 500)
    })
  }

  function fetchUrl(url, cb) {
    url = url.split('#')[0]
    const obj = {}
    return fetch(url)
      .then(function(r) {
        obj.status = r.status
        obj.lastModified = r.headers
          && r.headers._headers
          && r.headers._headers['last-modified']
          && r.headers._headers['last-modified'][0]
        return r.text()
      }).then(function(d) {
        const $ = cheerio.load(d)
        const links = $('a')
        obj.linkCount = links.length
        obj.url = url
        // console.log(obj);

        // Process the links on the page.
        const hostname = Url.parse(url).hostname
        // console.log(hostname);

        let newLinkCount = 0
        links.each((i, link) => {
          const fullUrl = Url.resolve(url, link.attribs.href).split('#')[0]
          const isInternal = hostname === Url.parse(fullUrl).hostname
          if (!requests[fullUrl]) {
            if (isInternal) {
              // console.log(fullUrl);
              requests[fullUrl] = true
              // console.log('INTERNAL:: ' + fullUrl);
              // newLinkCount++
              // console.log(q);

              
              console.log(requests);
              // q.defer(fetchUrl, fullUrl)




              // if (callback)
              // callback(output)
            }
          }
        })

        // console.log(output);
        cb(null, obj)

        return output
      }).catch(function(e) {
        console.log(e);
      })
  }

  q.awaitAll(function(err, d) {
    console.log(d);
    // callback(err, d)
  })
}

function isInternal(url) {

}

function processLink(url) {
  // get url and check against cache
  // get output and determine if internal / external
}

// Add to map


buildOutput({
  startUrls: [
    'http://blog.timscanlin.net'
  ]
}, function(err, o) {
  console.log(o);
})
