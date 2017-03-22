#!/usr/bin/env node

require('isomorphic-fetch')
const cheerio = require('cheerio')
const Url = require('url')

const defaultOptions = {
  // throttle??
  // limit
  //
  includeExternal: true,
  fetchExternal: false,
}

// Make initial promise from startUrls
// Go to pages and make more promises [cascading]
// After all the promises are done return data.


function buildOutput(opt, callback) {
  const options = Object.assign({}, defaultOptions, opt)
  const output = {
    pages: {
      internal: {},
      external: {},
    }
  }
  const requests = {}

  const p = new Promise(function(resolve, reject) {
    if (options.startUrls && options.startUrls.length) {
      const promises = options.startUrls.map(function(startUrl) {
        requests[startUrl] = {}
        requests[startUrl].startTime = Date.now()
        return fetchUrl(startUrl, true)
      })
      return Promise.all(promises).then(function(d) {
        resolve(output)
      })
    }
  })

  // function fetchMultipleUrls(urls) {
  //   const promises = urls.map(function(url) {
  //     return fetchUrl(url, true)
  //   })
  //   return Promise.all(promises)
  // }

  function fetchUrl(url, internal) {
    url = url.split('#')[0]
    return fetch(url)
      .then(function(r) {
        requests[url].endTime = Date.now()
        requests[url].deltaTime = requests[url].endTime - requests[url].startTime
        // Add request stuff to data object.
        obj.status = r.status
        obj.lastModified = r.headers
          && r.headers._headers
          && r.headers._headers['last-modified']
          && r.headers._headers['last-modified'][0]
        return r.text()
      }).then(function(d) {

        const $ = cheerio.load(d)
        const links = $('a')
        const newPromises = []

        // Build output object.
        const obj = {}
        obj.linkCount = links.length
        obj.url = url
        obj.isInternal = internal
        obj.fetchTime = requests[url].deltaTime
        const where = internal ? 'internal' : 'external'
        // This sets the data key to output.
        output.pages[where][url] = obj

        if (internal) {
          links.each((i, link) => {
            const fullUrl = Url.resolve(url, link.attribs.href).split('#')[0]
            if (!requests[fullUrl]) {
              const fullUrlInternal = isInternal(url, fullUrl)
              if (fullUrlInternal || options.includeExternal) {
                requests[fullUrl] = {}
                if (fullUrlInternal || options.fetchExternal) {
                  requests[fullUrl].startTime = Date.now()
                  // console.log(fullUrl, fullUrlInternal);
                  newPromises.push(fetchUrl(fullUrl, fullUrlInternal))
                } else {
                  output.pages.external[fullUrl] = {}
                }
              }
            }
          })
        }



        if (newPromises.length > 0) {
          return Promise.all(newPromises)
        }

        return output
      }).catch(function(e) {
        console.log(e);
      })
  }

  return p
}

function isInternal(baseUrl, url) {
  const hostname = Url.parse(baseUrl).hostname
  return hostname === Url.parse(url).hostname
}


// function processUrl(url, requests) {
//   // get url and check against cache
//   // get output and determine if internal / external
// }
// Add to map


buildOutput({
  startUrls: [
    'http://blog.timscanlin.net'
  ]
}, function(err, o) {
  console.log(o);
}).then(function(data) {
  // console.log(data);
  process.stdout.write(JSON.stringify(data))
})
