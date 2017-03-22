#!/usr/bin/env node

require('isomorphic-fetch')
const cheerio = require('cheerio')
const Url = require('url')

const defaultOptions = {
  // throttle?
}

// Make initial promise from startUrls
// Go to pages and make more promises [cascading]
// After all the promises are done return data.


// Add request
// Process request


//

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
      const promises = options.startUrls.map(function(url) {
        return fetchUrl(url, true)
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


        const newPromises = []
        if (internal) {
          links.each((i, link) => {
            const fullUrl = Url.resolve(url, link.attribs.href).split('#')[0]
            if (!requests[fullUrl]) {
              requests[fullUrl] = true
              const fullUrlInternal = isInternal(url, fullUrl)
              // console.log(fullUrl, fullUrlInternal);
              newPromises.push(fetchUrl(fullUrl, fullUrlInternal))
            }
          })
        }

        // Add object to output.
        obj.linkCount = links.length
        obj.url = url

        const where = internal ? 'internal' : 'external'
        // console.log(where);
        output.pages[where][url] = obj

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
