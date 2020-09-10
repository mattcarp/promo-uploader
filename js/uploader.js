import { Helper } from "./helper.js";
import { Store } from "./store.js";
import { CONF } from "./config.js";
import * as elements from "./elements.js";

export class Uploader {
  helper = new Helper();
  store = new Store();
  htmlElement = new elements.HtmlElements();

  /**
   * Upload -- main function
   * @return {void}
   */
  upload() {
    let startedAt = new Date();
    const debugMode = this.store.getDebugMode();
    const idUploading = this.store.getIdUploading();
    const fileList = this.store.getFileList();

    if (debugMode) {
      console.log("id for uploading file", idUploading);
    }

    let file = fileList[idUploading].fileInfo;
    let upload = new tus.Upload(file, {
      endpoint: CONF.apiUrl,
      retryDelays: [0, 3000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onError: (error) => {
        if (idUploading < fileList.length) {
          this.htmlElement.uploadComplete();
          upload.abort();
          fileList[idUploading].row = "error";
          this.store.setProgressTotal();
          elements.progressTotal.innerHTML = "Upload error";

          if (debugMode) console.log("Failed because: " + error);
        }
      },
      onProgress: (bytesUploaded) => {
        if (
          fileList &&
          fileList[idUploading] &&
          !fileList[idUploading].uploaded
        ) {
          this.htmlElement.setProgress(bytesUploaded);
        } else {
          this.htmlElement.uploadComplete();
          elements.progressTotal.innerHTML = "Upload checking";
        }
      },
      onSuccess: () => {
       // totalTime += secondsElapsed;

        if (debugMode) {
          console.log("Download %s from %s", upload.file.name, upload.url);
          console.log(
            'Uploaded:\n • file name: "%s"',
            upload.file.name,
            "\n • file size: ",
            this.helper.updateSize(upload.file.size),
            "\n • upload time: ",
          //  this.helper.clockFormat(secondsElapsed, 0)
          );
        }

       // totalUploaded += fileUploaded;
        fileList[idUploading].row = "success";
        fileList[idUploading].uploaded = true;
        this.htmlElement.updatefileList();
        //idUploading++;

        Object.keys(localStorage).map((key) => {
          if (JSON.parse(localStorage.getItem(key)).uploadUrl === upload.url) {
            localStorage.removeItem(key);
          }
        });

        if (idUploading === fileList.length) {
          this.uploadComplete();
          elements.btnUpload.setAttribute("disabled", "true");
          upload.abort();
          console.log(
            "Total: files ",
            fileList.length,
            "| size ",
        //    this.helper.updateSize(totalSize),
            "| time ",
          //  this.helper.clockFormat(totalTime, 0)
          );
        } else {
         // if (idUploading < fileList.length) startUpload();
        }
      },
    });

    elements.btnPause.addEventListener("click", () => {
      upload.abort();
      this.store.setCurrentStatus("pause");
      this.htmlElement.updatefileList();
      this.htmlElement.cleanProgressBar();
    });

    elements.btnUnPause.addEventListener("click", () => {
      this.store.setCurrentStatus("loading");
      this.htmlElement.updatefileList();
      this.prevUpload(upload);
    });

    this.prevUpload(upload);
  }

  /**
   * If an upload has been chosen to be resumed
   * @param {any} upload
   * @return {void}
   */
  prevUpload(upload) {
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads && previousUploads.length) {
        for (const item of previousUploads) {
          upload.resumeFromPreviousUpload(item);
        }
      }
      // Finally start the upload requests.
      upload.start();
    });
  }
}
