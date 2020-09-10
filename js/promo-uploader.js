import { HtmlElements } from './elements.js';

const htmlElements = new HtmlElements()


const style = [
  'padding: 0.4rem 0.8rem;',
  'background: linear-gradient(#4560ad, #1139ad);',
  'font: 0.8rem/1 -apple-system, Roboto, Helvetica, Arial;',
  'color: #fff;'
].join('');
// fetch('http://18.213.229.220:3000/promo-uploader/version') // for @Andrew
fetch('/promo-uploader/version')
  .then((response) => response.text())
  .then((version) => {
    console.log('%c%s', style, 'Promo Uploader', 'v.' + version);
  });

htmlElements.DOMContentLoaded();

window.addEventListener('resize', () => {
  setTimeout(() => htmlElements.updateFileList(), 200);
});