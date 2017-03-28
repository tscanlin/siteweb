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
  // Not yet implemented...
  preFetchCallback: () => {},
  postFetchCallback: () => {},
}
