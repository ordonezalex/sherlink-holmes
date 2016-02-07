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
 * @param array
 * @returns {Array}
 */
function removeDuplicates(array) {
  var results = [];
  var unique = {};

  array.forEach(function(element) {
    if (!unique[element.href]) {
      // Found a unique item

      // Push this to the results
      results.push(element);

      // Store this as a discovered unique value
      unique[element.href] = element;
    }
  });

  return results;
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
    .filter(isNotPageAnchor)
    .filter(isNotSpecialPage);

  links = removeDuplicates(links);

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
