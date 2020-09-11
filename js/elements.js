import { Helper } from "./helper.js";
import { store } from "./store.js";

export const promoUploader = document.getElementById("promo-uploader");
export const dropZone = document.getElementById("drop-zone");
export const btnUpload = document.getElementById("btn-upload");
export const btnPause = document.getElementById("btn-pause");
export const btnUnPause = document.getElementById("btn-un-pause");
export const btnListView = document.getElementById("btn-list-view");
export const btnThumbView = document.getElementById("btn-thumb-view");
export const btnSort = document.getElementById("btn-sort");
export const dropdown = document.getElementById("dropdown");
export const sortName = document.getElementById("sort-name");
export const sortSize = document.getElementById("sort-size");
export const sortDate = document.getElementById("sort-date");
export const btnClear = document.getElementById("btn-clear");
export const list = document.getElementById("files-list");
export const progressTotal = document.getElementById("progress-total");
export const progressLength = document.getElementById("progress-length");
export const progressSize = document.getElementById("progress-size");
export const progressSpeed = document.getElementById("progress-speed");
export const progress = document.getElementById("progress");
export const progressBar = document.getElementById("progress-bar");

export class HtmlElements {
  helper = new Helper();
  isSortOpen = false;

  /**
   * Upload complete
   * @return {void}
   */
  uploadComplete() {
    btnPause.style.display = "none";
    btnUnPause.style.display = "none";
    btnUpload.style.display = "flex";
    progressTotal.innerHTML = "Upload complete";
    btnSort.removeAttribute("disabled");
    btnClear.removeAttribute("disabled");
    this.cleanThumbnails();
    this.cleanProgressBar();
  }

  /**
   * Cleaning thumbnails in drop-zone
   * @return {void}
   */
  cleanThumbnails() {
    document.querySelectorAll(".drop-zone__thumb").forEach((el) => {
      el.remove();
    });
    document.querySelector(".drop-zone__prompt").style.opacity = "1";
    dropZone.classList.remove("disabled");
  }

  /**
   * Cleaning progress bar
   * @return {void}
   */
  cleanProgressBar() {
    progressTotal.innerHTML = "";
    progressLength.innerHTML = "";
    progressSize.innerHTML = "";
    progressSpeed.innerHTML = "";
    progress.setAttribute("value", "0");
    progressBar.style.width = "0%";

    // if (!fileList.length) this.btnForStart();
  }

  /**
   * Update file list
   * @return {void}
   */
  updateFileList() {
    list.innerHTML = "";
    this.closeSortList();
    const fileList = store.getFileList();
    if(!fileList || !fileList.length){
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      const grid = document.createElement("div");
      const cellState = document.createElement("div");
      const cellFileName = document.createElement("div");
      const cellFileSize = document.createElement("div");
      const cellDelete = document.createElement("div");
      const iconLoader = document.createElement("i");
      const iconSuccess = document.createElement("i");
      const iconInfo = document.createElement("i");
      const iconWarn = document.createElement("i");
      const iconDelete = document.createElement("i");

      grid.classList.add("grid");
      if (fileList[i].row === "new") grid.classList.add("new");
      if (fileList[i].row === "loading") grid.classList.add("loading");
      if (fileList[i].row === "success") grid.classList.add("success");
      if (fileList[i].row === "pause") grid.classList.add("pause");
      if (fileList[i].row === "error") grid.classList.add("error");
      cellFileName.innerHTML = this.helper.smartTrim(
        fileList[i].fileInfo.name,
        (list.offsetWidth - 164) / 10
      );
      cellFileSize.innerHTML = this.helper.updateSize(
        fileList[i].fileInfo.size
      );

      iconLoader.classList.add("icon");
      iconLoader.classList.add("loader");
      cellState.appendChild(iconLoader);
      iconSuccess.classList.add("icon");
      iconSuccess.classList.add("success");
      cellState.appendChild(iconSuccess);
      iconInfo.classList.add("icon");
      iconInfo.classList.add("info");
      cellState.appendChild(iconInfo);
      iconWarn.classList.add("icon");
      iconWarn.classList.add("warn");
      cellState.appendChild(iconWarn);
      iconDelete.classList.add("icon");
      iconDelete.classList.add("delete");
      iconDelete.id = "icon-delete-" + i;
      cellDelete.appendChild(iconDelete);

      grid.appendChild(cellState);
      grid.appendChild(cellFileName);
      grid.appendChild(cellFileSize);
      grid.appendChild(cellDelete);

      list.appendChild(grid);

      iconDelete.addEventListener("click", () => {
        this.updateFileList();
      });
    }

    if (!fileList.length) this.helper.cleanProgressBar();
  }

  /**
   * Activation/Disabled buttons for start
   * @return {void}
   */
  btnForStart() {
    //idUploading = 0;
    dropZone.classList.remove("disabled");
    btnPause.style.display = "none";
    btnUnPause.style.display = "none";
    btnUpload.style.display = "flex";
    btnUpload.setAttribute("disabled", "true");
    btnListView.setAttribute("disabled", "true");
    btnThumbView.setAttribute("disabled", "true");
    btnSort.setAttribute("disabled", "true");
    btnClear.setAttribute("disabled", "true");
  }

  /**
   * Close sort list
   * @return {void}
   */
  closeSortList() {
    if (this.isSortOpen) {
      btnSort.click();
      this.isSortOpen = false;
    }
  }

  DOMContentLoaded() {
    document.addEventListener("DOMContentLoaded", () => {
      this.btnForStart();

      btnUpload.addEventListener("click", () => {
        dropZone.classList.add("disabled");
        btnUpload.style.display = "none";
        btnPause.style.display = "flex";
        btnSort.setAttribute("disabled", "true");
      });

      btnListView.addEventListener("click", () => {
        list.classList.remove("thumb-view");
        btnListView.setAttribute("disabled", "true");
        btnThumbView.removeAttribute("disabled");
        this.closeSortList();
      });

      btnThumbView.addEventListener("click", () => {
        list.classList.add("thumb-view");
        btnListView.removeAttribute("disabled");
        btnThumbView.setAttribute("disabled", "true");
        this.closeSortList();
      });

      btnSort.addEventListener("click", () => {
        this.isSortOpen = !this.isSortOpen;
        this.isSortOpen
          ? (dropdown.style.display = "block")
          : (dropdown.style.display = "none");
      });

      sortName.addEventListener("click", () => {
        store.sortByField("name");
        this.updateFileList();
      });

      sortSize.addEventListener("click", () => {
        store.sortByField("size");
        this.updateFileList();
      });

      sortDate.addEventListener("click", () => {
        store.sortByField("lastModified");
        this.updateFileList();
      });

      btnClear.addEventListener("click", () => {
        store.clear();
        this.cleanThumbnails();
        this.btnForStart();
        this.updateFileList();
      });

      setTimeout(() => promoUploader.classList.remove("loading"), 200);

      this.onUploadResumeClick();
      this.onUploadPauseClick();
    });
  }

  /**
   * Activation of buttons
   * @return {void}
   */
  btnActivate() {
    btnThumbView.removeAttribute("disabled");
    btnSort.removeAttribute("disabled");
    btnClear.removeAttribute("disabled");
  }

  onUploadResumeClick() {
    btnUnPause.addEventListener("click", () => {
      btnUnPause.style.display = "none";
      btnPause.style.display = "flex";
      btnClear.setAttribute("disabled", "true");
    });
  }

  onUploadPauseClick() {
    btnPause.addEventListener("click", () => {
      btnPause.style.display = "none";
      btnUnPause.style.display = "flex";
      progressTotal.innerHTML = "Upload stopped";
      btnClear.removeAttribute("disabled");
    });
  }

  setProgress(bytesUploaded) {
    const totalSize = store.getTotalSize();
    const fileList = store.getFileList();
    const isUploading = store.getIsUploading();
    const totalUploaded = store.getTotalUploaded(bytesUploaded);
    const startedAt = store.getStartedAt();
    const currentIndex = store.getCurrentIndex();

    console.log(isUploading);
    if (isUploading) {
      let percentage = this.helper.getPercentage(
        totalUploaded,
        totalSize
      );
      const secondsElapsed =
        (new Date().getTime() - startedAt.getTime()) / 1000;
      let bytesPerSecond = secondsElapsed ? bytesUploaded / secondsElapsed : 0;
      let KbytesPerSecond = bytesPerSecond / 1000;
      let remainingBytes = totalSize - totalUploaded;
      console.log(totalSize, totalUploaded);
      let secondsRemaining = remainingBytes / bytesPerSecond;

      progressTotal.innerHTML = this.helper.getProgressTotalString(percentage);
      progressLength.innerHTML = this.helper.getProgressLength(
        currentIndex,
        fileList
      );
      progressSize.innerHTML = this.helper.getProgressSize(
        totalUploaded,
        totalSize
      );
      progressSpeed.innerHTML = this.helper.getProgressSpeed(
        KbytesPerSecond,
        secondsRemaining
      );
      progress.setAttribute("value", percentage);
      progressBar.style.width = percentage + "%";
      // this.updatefileList();

      document.getElementById("icon-delete-" + currentIndex).className =
        "icon delete";
      btnClear.setAttribute("disabled", "true");
    }
  }
}
