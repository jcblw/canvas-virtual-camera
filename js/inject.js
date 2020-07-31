"use strict";

// create script
const script = document.createElement("script");
script.setAttribute("type", "module");
script.setAttribute("src", chrome.extension.getURL("js/main.js"));

// inject into head
const head =
  document.head ||
  document.getElementsByTagName("head")[0] ||
  document.documentElement;
head.insertBefore(script, head.lastChild);
