export class Store {
  fileList = [];
  startedAt;

  static instance;

  constructor() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = this;
  }

  setFileList(fileList) {
    this.fileList = fileList;
  }

  getFileList() {
    return this.fileList;
  }

  addFileToFileList(file) {
    return this.fileList.push({ ...file, id: this.getID() });
  }

  updateFileStatus(fileId, status, uloaded = false) {
    this.fileList = this.fileList.map((file) => {
      if (file.id === fileId) {
        file.uploaded = uloaded;
        file.row = status;
      }

      return file;
    });
  }

  getStartedAt() {
    return this.startedAt;
  }

  setStartedAt() {
    return (this.startedAt = new Date());
  }

  getTotalUploaded(currentBytes = 0) {
    const totalUploaded =  this.fileList
      .filter((file) => file.uploaded)
      .reduce((accumulator, currentFile) => {
        return accumulator + currentFile.fileInfo.size;
      }, currentBytes);
    console.log(totalUploaded);
    return totalUploaded;
  }

  setTotalSize(totalSize) {
    this.totalSize = totalSize;
  }

  getCurrentIndex(){
    return this.fileList.findIndex((file)=> file.row === 'loading');
  }

  getTotalSize() {
    const totalSize = this.fileList.reduce((accumulator, currentFile) => {
      return accumulator + currentFile.fileInfo.size;
    }, 0);

    return totalSize;
  }

  addToTotalSize(bytes) {
    this.totalSize = this.totalSize + bytes;
  }

  getFileUploaded() {
    return {};
  }

  getIsUploading() {
    return this.fileList.find((file) => file.row === "loading") || false;
  }

  sortByField(field) {
    const list = this.sortBy(field, this.fileList);
    this.setFileList(list);
  }

  clear() {
    this.fileList = [];
    this.totalSize = 0;
  }

  setCurrentStatus(status) {
    this.fileList[this.idUploading].row = status;
  }

  getFileToUpload() {
    return this.fileList.find((file) => file && file.row === "new");
  }

  /**
   * Sort by key
   * @param {string} key
   * @param {array} fileList
   * @return {array} fileList
   */
  sortBy(key, fileList) {
    fileList = fileList.sort((a, b) => {
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
    while (i < fileList.length) {
      this.idUploading = i;
      if (!fileList[i].uploaded) break;
      i++;
    }

    return fileList;
  }

  getID() {
    return "_" + Math.random().toString(36).substr(2, 19);
  }
}

export const store = new Store();
