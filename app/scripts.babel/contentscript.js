'use strict';

/**
 * Add a sidebar to the page
 */
function addSidebar() {
  // Create sidebar
  var sidebar = document.createElement('aside');
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
  // Get the sidebar
  var sidebar = document.getElementById('sherlink');

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

function isTextOnly(element) {
  // Does the link only contain text?

  return element.childElementCount === 0
    && element.firstChild !== null
    && element.firstChild.nodeType === Node.TEXT_NODE;
}

function isNotPageAnchor(element) {
  // Does the link look like an anchor to this page?

  let start = element.href.indexOf('/wiki/') + 6;

  let pageUrl = location.pathname.substr(start);

  let isPageAnchor = pageUrl === element.href.includes(pageUrl)
    || element.href.substr(0, 1) === '#';

  console.log('Checking if %s begins with #: %s', pageUrl, isPageAnchor);

  return !isPageAnchor;
}

/**
 * Get candidate links
 * @returns {Array.<T>}
 */
function findLinks() {
  // Get all links
  var candidates = Array.prototype.slice.call(document.getElementsByTagName('a'));

  var links = [];

  // Deeply clone nodes
  candidates.forEach(function (element) {
    links.push(element.cloneNode(true));
  });

  // Keep only links that are from Wikipedia
  links = links.filter(isWikipedia)
    .filter(isTextOnly)
    .filter(isNotPageAnchor);

  return links;
}

/**
 * Initialization
 */
function init() {
  // Add a new sidebar to the page
  addSidebar();

  // Get all valid links from the page
  var links = findLinks();

  // Add all valid links to the sidebar
  links.forEach(addLinkToSidebar);
}

init();
