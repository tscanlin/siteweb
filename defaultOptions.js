module.exports = {
  // Urls to start from.
  startUrls: [],
  // Whether to include any external URLs in output.
  includeExternal: true,
  // Whether to fetch the external pages (depends on `includeExternal`)
  fetchExternal: false,
  // Limit of pages to fetch.
  maxPages: 500,
  // Not yet implemented...
  preFetchCallback: () => {},
  postFetchCallback: () => {},
  finalPromise: function(data) {
    process.stdout.write(JSON.stringify(data))
    // return true
  },

  // Reporting options?
  // timing the whole thing^
}
