export class Store {
  fileList = [];
  totalUploaded = 0;
  fileList = [];
  totalSize = 0;
  fileUploaded = 0;
  secondsElapsed = 0;
  totalTime = 0;
  idUploading = 0;
  debugMode = false;

  static instance;

  constructor() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = this;
  }

  setFileList(fileList) {
    this.filesList = fileList;
  }

  getFileList() {
    return this.fileList;
  }

  setIdUploading(id) {
    this.idUploading = id;
  }

  getIdUploading() {
    return this.idUploading;
  }

  setTotalUploaded(count) {
    this.totalUploaded = count;
  }

  getTotalUploaded() {
    return this.totalUploaded;
  }

  setTotalSize(totalSize) {
    this.totalSize = totalSize;
  }

  getTotalSize() {
    return this.totalSize;
  }

  setFileUploaded(fileUploaded) {
    this.fileUploaded = fileUploaded;
  }

  getFileUploaded() {
    return this.fileUploaded;
  }

  setSecondsElapsed(secondsElapsed) {
    this.secondsElapsed = secondsElapsed;
  }

  getSecondsElapsed() {
    return this.secondsElapsed;
  }

  setTotalTime(totalTime) {
    this.totalTime = totalTime;
  }

  getTotalTime() {
    return this.totalTime;
  }

  setDebugMode(debugMode) {
    this.debugMode = debugMode;
  }

  getDebugMode() {
    return this.debugMode;
  }

  sortByField(field) {
    const list = this.sortBy(field, this.fileList);
    this.setFileList(list);
  }

  clear() {
    this.filesList = [];
    this.totalSize = 0;
    this.store.totalUploaded = 0;
  }

  setCurrentStatus(status) {
    this.fileList[this.idUploading].row = status;
  }

  /**
   * Sort by key
   * @param {string} key
   * @param {array} fileList
   * @return {array} filesList
   */
  sortBy(key, filesList) {
    filesList = filesList.sort((a, b) => {
      if (key === "name") {
        if (a.fileInfo.name > b.fileInfo.name) return 1;
        if (b.fileInfo.name > a.fileInfo.name) return -1;
        return 0;
      } else if (key === "size") {
        if (a.fileInfo.size > b.fileInfo.size) return 1;
        if (b.fileInfo.size > a.fileInfo.size) return -1;
        return 0;
      } else if (key === "lastModified") {
        if (a.fileInfo.lastModified > b.fileInfo.lastModified) return 1;
        if (b.fileInfo.lastModified > a.fileInfo.lastModified) return -1;
        return 0;
      }
    });

    let i = 0;
    while (i < filesList.length) {
      this.idUploading = i;
      if (!filesList[i].uploaded) break;
      i++;
    }

    return filesList;
  }
}