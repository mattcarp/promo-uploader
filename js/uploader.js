import { Helper } from "./helper.js";
import { store } from "./store.js";
import { CONF } from "./config.js";
import * as elements from "./elements.js";

export class Uploader {
  upload;
  helper = new Helper();
  htmlElement = new elements.HtmlElements();
  currentId;

  init() {
    this.onUploadClick();
    this.onPauseClick();
    this.onResumeClick();
  }

  onUploadClick() {
    elements.btnUpload.addEventListener("click", () => {
      store.setStartedAt();
      this.startUpload();
    });
  }

  onPauseClick() {
    elements.btnPause.addEventListener("click", () => {
      this.upload.abort();
      store.updateFileStatus(this.currentId, "pause");
      this.htmlElement.updateFileList();
      this.htmlElement.cleanProgressBar();
    });
  }

  onResumeClick() {
    elements.btnUnPause.addEventListener("click", () => {
      store.updateFileStatus(this.currentId, "loading");
      this.htmlElement.updateFileList();
      this.prevUpload();
    });
  }

  /**
   * Upload -- main function
   * @return {void}
   */
  startUpload() {
    const fileList = store.getFileList();

    let file = store.getFileToUpload();

    if (!file) {
      this.finishUploading(fileList);
      return;
    }

    this.currentId = file.id;

    this.upload = new tus.Upload(file.fileInfo, {
      endpoint: CONF.apiUrl,
      retryDelays: [0, 3000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onError: (error) => {
        this.htmlElement.uploadComplete();
        this.upload.abort();
        store.updateFileStatus(file.id, "error");
        //   store.setProgressTotal(); todo
        elements.progressTotal.innerHTML = "Upload error";
        this.htmlElement.updateFileList();
      },
      onProgress: (bytesUploaded) => {
        console.log("bytesUploaded", bytesUploaded);
        store.updateFileStatus(file.id, "loading");
        if (fileList && fileList.length && bytesUploaded) {
          this.htmlElement.setProgress(bytesUploaded);
        }
        // this.htmlElement.uploadComplete();
        // elements.progressTotal.innerHTML = "Upload checking";
        this.htmlElement.updateFileList();
      },
      onSuccess: () => {
        store.updateFileStatus(file.id, "success", true);
        this.htmlElement.updateFileList();
        this.removeFromLocalstorage();
        this.startUpload();
      },
    });
    this.upload.start();
  }

  finishUploading(fileList) {
    this.htmlElement.uploadComplete();
    elements.btnUpload.setAttribute("disabled", "true");
    this.upload.abort();
    const totalTime =
      (new Date().getTime() - store.getStartedAt().getTime()) / 1000;
    console.log(
      "Total: files ",
      fileList.length,
      "| size ",
      this.helper.updateSize(store.getTotalUploaded()),
      "| time ",
      this.helper.clockFormat(totalTime, 0)
    );
  }

  /**
   * If an upload has been chosen to be resumed
   * @param {any} upload
   * @return {void}
   */
  prevUpload() {
    if (!this.upload) {
      return;
    }
    this.upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads && previousUploads.length) {
        for (const item of previousUploads) {
          this.upload.resumeFromPreviousUpload(item);
        }
      }
      // Finally start the upload requests.
      this.startUpload();
    });
  }

  removeFromLocalstorage() {
    if (!this.upload) {
      return;
    }
    Object.keys(localStorage).map((key) => {
      if (JSON.parse(localStorage.getItem(key)).uploadUrl === this.upload.url) {
        localStorage.removeItem(key);
      }
    });
  }
}
