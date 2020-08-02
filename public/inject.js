// create script
const script = document.createElement('script')
script.type = 'module'
script.setAttribute('src', chrome.extension.getURL('camera.js'))

console.log('inject virtual camera', script)

// inject into head
const head =
  document.head ||
  document.getElementsByTagName('head')[0] ||
  document.documentElement
head.insertBefore(script, head.lastChild)
