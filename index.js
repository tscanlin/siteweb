#!/usr/bin/env node

require('isomorphic-fetch')
const cheerio = require('cheerio')
const url = require('url');

const output = {
  pages: {
    included: {},
    excluded: {},
  }
}

function getPage(baseUrl) {

}

function getData() {

}

// Add to map
const baseUrl = 'http://blog.timscanlin.net'

fetch(baseUrl)
  .then(function(d) {
    return d.text()
  }).then(function(d) {
    const $ = cheerio.load(d)
    // console.log(d);
    const links = $('a')
    console.log(links.length);
    links.each((i, link) => {
      // console.log(link.children[0]);
      const text = link.children[0].data
      const obj = {
        href: url.resolve(baseUrl, link.attribs.href),
        text: text
      }
      console.log(obj, i);
    })
  })
