# siteweb

![Build Status](https://travis-ci.org/tscanlin/siteweb.svg?branch=master)

siteweb is a tool that can quickly and easily get stats about all the pages on your website. Give it URLs and it will go fetch all of the linked pages and record info about each page. This is useful for testing websites and making sure nothing breaks after deploys for instance. This can also be used to identify the slowest (or fastest) pages on your website.

- super fast using node with [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) and [cheeriojs](https://github.com/cheeriojs/cheerio)
- runs on the client and the server
- easy to use, just start with a URL
- concurrency control
- throttle request [todo]


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


## Default Options

```js
module.exports = {
  // Urls to start from.
  startUrls: [
    'http://blog.timscanlin.net'
  ],
  // Whether to include any external URLs in output.
  includeExternal: true,
  // Whether to fetch the external pages (depends on `includeExternal`)
  fetchExternal: false,
  // Limit the number of concurrent requests.
  concurrency: 6,
  // Max queue size.
  maxQueue: 1000,
  // Limit of pages to fetch.
  maxPages: 500,
  // Not yet implemented...
  preFetchCallback: () => {},
  postFetchCallback: () => {},

  // Reporting options?
  // timing the whole thing^
}
```

```js
```


### Warning

Be careful! This tool recursively fetches all the links on a website. By default it has `maxPages` set to `500` and `concurrency` set to `6` but these values are configurable as is the `boolean` `fetchExternal` option which will check external pages as well (not recursively). If you change these options siteweb can consume a lot of resources on your computer or other websites so please use with care.


## TODO

- refactor to use a queue
