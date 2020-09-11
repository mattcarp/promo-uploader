import { HtmlElements } from './elements.js';
import { DragAndDrop } from "./drag-drop.js";
import { Uploader } from './uploader.js';

const htmlElements = new HtmlElements()
const dragAndDrop = new DragAndDrop();
const uploader = new Uploader();

htmlElements.DOMContentLoaded();

document.addEventListener("DOMContentLoaded", () => {
  dragAndDrop.init();
  uploader.init();
});

window.addEventListener('resize', () => {
  setTimeout(() => htmlElements.updateFileList(), 200);
});