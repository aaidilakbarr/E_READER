const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM('<!DOCTYPE html><div id="area"></div>', {
  url: 'http://localhost/',
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.location = dom.window.location;
global.Blob = dom.window.Blob;

const ePub = require('epubjs').default;

const buf = fs.readFileSync('public/sample.epub');
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

console.log('Testing ePub loading in jsdom environment...');
const book = ePub(ab);

book.opened
  .then(() => console.log('Book opened successfully!'))
  .catch((err) => console.error('Book open error:', err));

book.ready
  .then(() => console.log('Book ready successfully!'))
  .catch((err) => console.error('Book ready error:', err));

for (const [key, promise] of Object.entries(book.loaded)) {
  promise
    .then(() => console.log(` - loaded.${key} resolved`))
    .catch((err) => console.error(` - loaded.${key} rejected:`, err));
}
