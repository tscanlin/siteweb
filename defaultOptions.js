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
  queueCallback: function(o) {
  },

  // Reporting options?
  // timing the whole thing^
}
