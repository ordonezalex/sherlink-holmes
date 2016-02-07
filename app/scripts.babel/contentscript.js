'use strict';

var links = [];
var sidebar;

/**
 * Add a sidebar to the page
 */
function addSidebar() {
  // Create sidebar
  sidebar = document.createElement('aside');
  sidebar.id = 'sherlink';

  // Let Wikipedia style the sidebar
  sidebar.classList.add('infobox');

  // Add sidebar to container
  var container = document.getElementById('mw-content-text');
  var content = container.firstChild;
  container.insertBefore(sidebar, content);
}

/**
 * Add a validated link to the sidebar
 * @param element
 */
function addLinkToSidebar(element) {
  var views = element.views;

  for (var i = 0; i < sidebar.childNodes.length; i++) {
    if (views >= sidebar.childNodes[i].views) {
      // New node has more views and this node

      sidebar.insertBefore(element, sidebar.childNodes[i]);
    }
  }

  // Add this link
  sidebar.appendChild(element);
}

/**
 * Check if link is from Wikipedia
 * @returns {boolean}
 * @param element
 */
function isWikipedia(element) {
  // Does the link point to wikipedia?

  return element.href.includes(window.location.hostname + '/wiki/');
}

/**
 * Check if link is just text
 * @param element
 * @returns {boolean}
 */
function isTextOnly(element) {
  // Does the link only contain text?

  return element.childElementCount === 0
    && element.firstChild !== null
    && element.firstChild.nodeType === Node.TEXT_NODE;
}

/**
 * Check if link points to this article
 * @param element
 * @returns {boolean}
 */
function isNotPageAnchor(element) {
  // Does the link anchor to this page?

  // Find page name by removing '/wiki/' from pathname
  var pageName = window.location.pathname.substr(6);

  return !element.href.includes(pageName);
}

function isNotSpecialPage(element) {
  // Does the link point to a special page?

  return !element.href.includes('Wikipedia:')
    && !element.href.includes('Portal:')
    && !element.href.includes('Category:')
    && !element.href.includes('Help:')
    && !element.href.includes('Special:')
    && !element.href.includes('Talk:')
    && !element.href.includes('Template:')
    && !element.href.includes('Main_Page');
}

/**
 * Remove duplicate links
 * @returns {Array}
 */
function removeDuplicates() {
  var results = [];
  var unique = {};

  links.forEach(function (element) {
    if (!unique[element.href]) {
      // Found a unique item

      // Push this to the results
      results.push(element);

      // Store this as a discovered unique value
      unique[element.href] = element;
    }
  });

  // Set links global
  links = results;
}

function $http(url) {
  // A small example of object
  var core = {

    // Method that performs the ajax request
    ajax: function (method, url, args) {

      // Creating a promise
      return new Promise(function (resolve, reject) {

        // Instantiates the XMLHttpRequest
        var client = new XMLHttpRequest();

        client.open(method, url);
        client.send();

        client.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            // Performs the function "resolve" when this.status is equal to 2xx
            resolve(this.response);
          } else {
            // Performs the function "reject" when this.status is different than 2xx
            reject(this.statusText);
          }
        };
        client.onerror = function () {
          reject(this.statusText);
        };
      });
    }
  };

  // Adapter pattern
  return {
    'get': function (args) {
      return core.ajax('GET', url, args);
    }
  };
}

function ajax(element, start, end) {
  // Find page name by removing '/wiki/' from pathname
  var startIndex = element.href.indexOf('/wiki/') + 6;
  var pageName = element.href.substr(startIndex);

  var callback = {
    success: function (data) {
      var response = JSON.parse(data);

      // Sum the page views
      var views = 0;

      for (var i = 0, len = response.items.length; i < len; i++) {
        views += response.items[i].views;
      }

      element.views = views;

      //console.log('%O', element);

      addLinkToSidebar(element);
    },
    error: function (data) {
      console.log(2, 'error', JSON.parse(data));
    }
  };

  $http('https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/' + pageName + '/daily/' + start + '/' + end)
    .get()
    .then(callback.success)
    .catch(callback.error);
}

/**
 * Sort links
 * @returns {Array}
 */
function sortLinks() {
  var date = new Date();

  // Go back one month
  date.setMonth(date.getMonth() - 1);
  var start = '' + date.getFullYear();

  if (date.getMonth().toString().length < 2) {
    start += '0';
  }

  // Add one, because months are zero-index
  start += date.getMonth() + 1;

  if (date.getDate().toString().length < 2) {
    start += '0';
  }

  start += date.getDate();

  start += '00';

  date = new Date();
  var end = '' + date.getFullYear();

  if (date.getMonth().toString().length < 2) {
    end += '0';
  }

  // Add one, because months are zero-index
  end += date.getMonth() + 1;

  if (date.getDate().toString().length < 2) {
    end += '0';
  }

  end += date.getDate();

  end += '00';

  links.forEach(function (element) {
    ajax(element, start, end);
  });
}

/**
 * Get candidate links
 * @returns {Array.<T>}
 */
function findLinks() {
  // Get all links
  var candidates = Array.prototype.slice.call(document.getElementsByTagName('a'));

  // Deeply clone nodes
  candidates.forEach(function (element) {
    links.push(element.cloneNode(true));
  });

  // Keep only links that are from Wikipedia
  links = links.filter(isWikipedia)
    .filter(isTextOnly)
    .filter(isNotPageAnchor)
    .filter(isNotSpecialPage);

  removeDuplicates();

  sortLinks();
}

/**
 * Initialization
 */
function init() {
  // Add a new sidebar to the page
  addSidebar();

  // Get all valid links from the page
  findLinks();
}

init();
