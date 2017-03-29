# siteweb

![Build Status](https://travis-ci.org/tscanlin/siteweb.svg?branch=master)

siteweb is a tool that can quickly and easily get stats about all the pages on your website. Give it URLs and it will go fetch all of the linked pages and record info about each page. This is useful for testing websites and making sure nothing breaks after deploys for instance. This can also be used to identify the slowest (or fastest) pages on your website.

- easy to use, just start with a URL
- runs quickly using [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) and [cheeriojs](https://github.com/cheeriojs/cheerio)
- runs on the client and the server
- concurrency control
- returns a promise
- cli args parsed with [yargs](https://github.com/yargs/yargs)
- option to add a delay between requests


### Demo

**Note:** This online demo is still limited by the same origin policy so it the online version may not work with many websites, but the node version does not have this limitation. Feel free to try it out against my blog since it responds with the `Access-Control-Allow-Origin:*` header.

Also the Demo has a file input to visualize the json structure it generates.

[Try it online](https://tscanlin.github.io/siteweb/public/)

## Getting Started

```js
npm install -g siteweb
```

```js
npm install --save-dev siteweb
```


## Usage

Use it via the cli

```js
siteweb http://blog.timscanlin.net
```

```js
node ./cli http://blog.timscanlin.net
```

Or use it with the js api

```js
siteweb.run(options, (err, data) => {
  if (err) {
    throw new Error(err)
  }
  process.stdout.write(JSON.stringify(data))
})
```

Currently it only exposes one `run` method.


## Default Options

```js
module.exports = {
  // Urls to start from.
  startUrls: [
    'http://blog.timscanlin.net'
  ],
  // Limit the number of concurrent requests.
  concurrency: 6,
  // Max queue size.
  maxQueue: 500,
  // Whether to include any external URLs in output.
  includeExternal: true,
  // Whether to fetch the external pages (depends on `includeExternal`)
  fetchExternal: false,
  // Limit of pages to fetch.
  maxPages: 500,
  // Delay between requests in ms.
  delay: 0,
  // Pre fetch callback.
  preFetchCallback: () => {},
  // Post fetch callback.
  postFetchCallback: () => {},
}
```


### Warning

Be careful! This tool recursively fetches all the links on a website. By default it has `maxPages` set to `500` and `concurrency` set to `6` but these values are configurable as is the `boolean` `fetchExternal` option which will check external pages as well (not recursively). If you change these options siteweb can consume a lot of resources on your computer or other websites so please use with care.


## TODO

- demo page with visualization (more detail)
- more output options / data?
- make a similar project using nightmare that can run js
