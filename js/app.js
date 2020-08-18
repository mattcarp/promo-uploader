let filesList = [];
let uploadList = [];
let totalSize = 0;
let totalUploaded = 0;
let fileUploaded = 0;
let uploading = 1;
let isSortOpen = false;
const dropZone = document.getElementById('drop-zone');
const btnUpload = document.getElementById('btn-upload');
const btnPause = document.getElementById('btn-pause');
const btnListView = document.getElementById('btn-list-view');
const btnThumbView = document.getElementById('btn-thumb-view');
const btnSort = document.getElementById('btn-sort');
const sortName = document.getElementById('sort-name');
const sortSize = document.getElementById('sort-size');
const sortDate = document.getElementById('sort-date');
const btnClear = document.getElementById('btn-clear');
const list = document.getElementById('files-list');
const progressTotal = document.getElementById('progress-total');
const progressLength = document.getElementById('progress-length');
const progressSize = document.getElementById('progress-size');
const progressSpeed = document.getElementById('progress-speed');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progress-bar');
const debugMode = false;

btnPause.style.display = 'none';
btnUpload.setAttribute('disabled', 'true');
btnListView.setAttribute('disabled', 'true');
btnThumbView.setAttribute('disabled', 'true');
btnSort.setAttribute('disabled', 'true');
btnClear.setAttribute('disabled', 'true');

/*
const style = [
  'padding: 0.4rem 0.8rem;',
  'background: linear-gradient(#4560ad, #1139ad);',
  'font: 0.8rem/1 -apple-system, Roboto, Helvetica, Arial;',
  'color: #fff;'
].join('');
fetch('http://18.213.229.220:3000/promo-uploader/version') // for @Andrew
  // fetch('/promo-uploader/version')
  .then((response) => response.text())
  .then((version) => {
    // verApp.innerHTML = version;
    console.log('%c%s', style, 'Uploader', 'v.' + version);
  });
*/

// in case there are multiple drop zones...
document.querySelectorAll('.drop-zone__input').forEach((inputElement) => {
  const dropZoneElement = inputElement.closest('#drop-zone');
  if (debugMode) console.log(`drop zone el`, dropZoneElement);

  dropZoneElement.addEventListener('click', () => {
    if (dropZone.className !== 'disabled') {
      inputElement.click();
      document.querySelectorAll('.drop-zone__thumb').forEach((el) => {
        el.remove();
      });
      dropZoneElement.querySelector('.drop-zone__prompt').style.opacity = '1';
    }
  });

  dropZoneElement.addEventListener('change', (e) => {
    const dropZoneFile = /**HTMLInputElement*/e.target;

    if (inputElement.files.length && dropZone.className !== 'disabled') {
      for (let i = 0; i < dropZoneFile.files.length; i++) {
        updateThumbnail(dropZoneElement, inputElement.files[i]);
        updateFilesList(dropZoneFile.files[i], i);
        filesList.push(dropZoneFile.files[i]);
        uploadList.push(dropZoneFile.files[i]);
        totalSize += dropZoneFile.files[i].size;
      }

      btnUpload.removeAttribute('disabled');
      btnActivate();
      closeSortList();
      cleanProgressBar();
    }
  });

  dropZoneElement.addEventListener('dragover', (e) => {
    if (dropZone.className !== 'disabled') {
      e.preventDefault();
      dropZoneElement.classList.add('drop-zone--over');
    }
  });

  ['dragleave', 'dragend'].forEach((type) => {
    dropZoneElement.addEventListener(type, () => {
      dropZoneElement.classList.remove('drop-zone--over');
    });
  });

  dropZoneElement.addEventListener('drop', (e) => {
    e.preventDefault();
    if (debugMode) console.log(`drop event`, e.dataTransfer.files);

    if (e.dataTransfer.files.length && dropZone.className !== 'disabled') {
      document.querySelectorAll('.drop-zone__thumb').forEach((el) => {
        el.remove();
      });
      inputElement.files = e.dataTransfer.files;

      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        updateThumbnail(dropZoneElement, e.dataTransfer.files[i]);
        updateFilesList(e.dataTransfer.files[i], i);
        filesList.push(e.dataTransfer.files[i]);
        uploadList.push(e.dataTransfer.files[i]);
        totalSize += e.dataTransfer.files[i].size;
      }

      btnUpload.removeAttribute('disabled');
      btnActivate();
      closeSortList();
      cleanProgressBar();
      if (debugMode) console.log(`input el files`, inputElement.files);
    }

    dropZoneElement.classList.remove('drop-zone--over');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  btnUpload.addEventListener('click', () => {
    dropZone.classList.add('disabled');
    closeSortList();
    upload();
  });

  btnListView.addEventListener('click', () => {
    list.classList.remove('thumb-view');
    btnListView.setAttribute('disabled', 'true');
    btnThumbView.removeAttribute('disabled');
    closeSortList();
  });

  btnThumbView.addEventListener('click', () => {
    list.classList.add('thumb-view');
    btnListView.removeAttribute('disabled');
    btnThumbView.setAttribute('disabled', 'true');
    closeSortList();
  });

  btnSort.addEventListener('click', () => {
    isSortOpen = !isSortOpen;
  });

  sortName.addEventListener('click', () => {
    sortBy('name');
  });

  sortSize.addEventListener('click', () => {
    sortBy('size');
  });

  sortDate.addEventListener('click', () => {
    sortBy('lastModified');
  });

  btnClear.addEventListener('click', () => {
    list.innerHTML = '';
    filesList = [];
    uploadList = [];
    closeSortList();
  });
});

/**
 * Upload -- main function
 * @return {void}
 */
function upload() {
  let i = -1;
  let id = 1;
  let startedAt = new Date();

  const startUpload = () => {
    i++;
    if (i < uploadList.length) {
      let file = uploadList[i];
      let row = document.querySelector('.grid:nth-child(' + id + ')');
      let upload = new tus.Upload(file, {
        endpoint: 'http://18.213.229.220:1080/files/',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type
        },
        parallelUploads: 1,
        onError: function (error) {
          console.log('Failed because: ' + error);

          btnPause.style.display = 'none';
          btnUpload.style.display = 'flex';
          btnUpload.setAttribute('disabled', 'true');
          row.className = 'grid error';
        },
        onProgress: function (bytesUploaded) {
          fileUploaded = bytesUploaded;
          let percentage = ((totalUploaded + bytesUploaded) / totalSize * 100).toFixed(2);
          let secondsElapsed = (new Date().getTime() - startedAt.getTime()) / 1000;
          let bytesPerSecond = secondsElapsed ? bytesUploaded / secondsElapsed : 0;
          let KbytesPerSecond = bytesPerSecond / 1000;
          let remainingBytes = totalSize - totalUploaded - bytesUploaded;
          let secondsRemaining = remainingBytes / bytesPerSecond;

          progressTotal.innerHTML = 'Total: ' + percentage + '%';
          progressLength.innerHTML = '(' + id + '/' + filesList.length + ')';
          progressSize.innerHTML = updateSize(totalUploaded + bytesUploaded) + '/' + updateSize(totalSize);
          progressSpeed.innerHTML = 'Speed: ' + KbytesPerSecond.toFixed(0) + 'Kb/sec, Time left: ' +
            clockFormat(secondsRemaining, 0) + ')';
          progress.setAttribute('value', percentage);
          progressBar.style.width = percentage + '%';

          row = document.querySelector('.grid:nth-child(' + uploading + ')');
          row.classList.replace('new', 'loading');

          document.getElementById('icon-delete-' + (id - 1)).className = 'icon delete';

          if (!!percentage) {
            btnUpload.style.display = 'none';
            btnPause.style.display = 'flex';
          }
        },
        onSuccess: function () {
          console.log('Download %s from %s', upload.file.name, upload.url);
          progressSpeed.innerHTML = '';
          totalUploaded += fileUploaded;
          btnPause.style.display = 'none';
          btnUpload.style.display = 'flex';

          if (uploading === filesList.length) btnUpload.setAttribute('disabled', 'true');

          row.classList.replace('loading', 'success');
          id++;
          uploading++;

          startUpload();
        },
      });

      btnPause.addEventListener('click', () => {
        upload.abort();
        btnPause.style.display = 'none';
        btnUpload.style.display = 'flex';
        row.classList.replace('loading', 'pause');
        progressSpeed.innerHTML = '';
      });

      btnUpload.addEventListener('click', () => {
        upload.start();
        btnUpload.style.display = 'none';
        btnPause.style.display = 'flex';
        row.classList.replace('pause', 'loading');
      });

      btnClear.addEventListener('click', () => {
        btnPause.click();
      });

      upload.findPreviousUploads().then((previousUploads) => {
        // previousUploads is an array containing details about the previously started uploads.
        // The objects in the array have following properties:
        // - size: The upload's size in bytes
        // - metadata: The metadata associated with the upload during its creation
        // - creationTime: The timestamp when the upload was created

        // We ask the end user if they want to resume one of those uploads or start a new one.
        const chosenUpload = askToResumeUpload(previousUploads);

        // If an upload has been chosen to be resumed, instruct the upload object to do so.
        if (chosenUpload) {
          upload.resumeFromPreviousUpload(chosenUpload);
        }

        // Finally start the upload requests.
        upload.start();
      });


      // upload.start();
    } else {
      uploadList = [];
      dropZone.removeAttribute('disabled');
    }
  };

  startUpload();
}

/**
 * Update file list
 * @param {File} file
 * @param {number} index
 * @return {void}
 */
function updateFilesList(file, index) {
  const grid = document.createElement('div');
  const cellState = document.createElement('div');
  const cellFileName = document.createElement('div');
  const cellFileSize = document.createElement('div');
  const cellDelete = document.createElement('div');
  const iconLoader = document.createElement('i');
  const iconSuccess = document.createElement('i');
  const iconInfo = document.createElement('i');
  const iconWarn = document.createElement('i');
  const iconDelete = document.createElement('i');

  grid.classList.add('grid');
  grid.classList.add('new');
  cellFileName.innerHTML = smartTrim(file.name, (list.offsetWidth - 164) / 10);
  cellFileSize.innerHTML = updateSize(file.size);

  iconLoader.classList.add('icon');
  iconLoader.classList.add('loader');
  cellState.appendChild(iconLoader);
  iconSuccess.classList.add('icon');
  iconSuccess.classList.add('success');
  cellState.appendChild(iconSuccess);
  iconInfo.classList.add('icon');
  iconInfo.classList.add('info');
  cellState.appendChild(iconInfo);
  iconWarn.classList.add('icon');
  iconWarn.classList.add('warn');
  cellState.appendChild(iconWarn);
  iconDelete.classList.add('icon');
  iconDelete.classList.add('delete');
  iconDelete.classList.add('active');
  iconDelete.id = 'icon-delete-' + index;
  cellDelete.appendChild(iconDelete);

  grid.appendChild(cellState);
  grid.appendChild(cellFileName);
  grid.appendChild(cellFileSize);
  grid.appendChild(cellDelete);

  list.appendChild(grid);

  iconDelete.addEventListener('click', () => {
    if (iconDelete.className === 'icon delete active') {
      filesList.splice(index, 1);
      document.querySelector('.grid:nth-child(' + (index + 1) + ')').remove();
      progressLength.innerHTML = '(' + uploading + '/' + filesList.length + ')';
      closeSortList();
    }
  });
}

/**
 * Get size of file
 * @param {number} bytes
 * @return {string}
 */
function updateSize(bytes) {
  let output = bytes + ' bytes';

  for (let multiples = ['Kb', 'Mb', 'Gb', 'Tb'], multiple = 0, approx = bytes / 1024; approx > 1; approx /= 1024, multiple++) {
    output = approx.toFixed(2) + ' ' + multiples[multiple];
  }

  return output;
}

/**
 * Ellipsis in the middle of long text (Mac style)
 * @param {string} fileName
 * @param {number} maxLength
 * @return {string} fileName
 */
function smartTrim(fileName, maxLength) {
  if (!fileName) return fileName;
  if (maxLength < 1) return fileName;
  if (fileName.length <= maxLength) return fileName;
  if (maxLength === 1) return fileName.substring(0, 1) + '...';

  const midpoint = Math.ceil(fileName.length / 2);
  const toRemove = fileName.length - maxLength;
  const lStrip = Math.ceil(toRemove / 2);
  const rStrip = toRemove - lStrip;

  return fileName.substring(0, midpoint - lStrip) + '...' + fileName.substring(midpoint + rStrip);
}

/**
 * Convert unix time to normal
 * @param {number} seconds
 * @param {number} decimals
 * @return {string} result
 */
function clockFormat(seconds, decimals) {
  let hours;
  let minutes;
  let secs;
  let result;

  hours = parseInt(String(seconds / 3600), 10) % 24;
  minutes = parseInt(String(seconds / 60), 10) % 60;
  secs = seconds % 60;
  secs = secs.toFixed(decimals);

  result = (
    hours < 10
      ? '0' + hours
      : hours
  ) + ':' + (
    minutes < 10
      ? '0' + minutes
      : minutes
  ) + ':' + (
    secs < 10
      ? '0' + secs
      : secs
  );

  return result;
}

/**
 * Open a dialog box to the user where they can select whether they want to resume an upload
 * or instead create a new one
 * @param {any []} previousUploads to be uploaded
 * @return {null | number}
 */
function askToResumeUpload(previousUploads) {
  if (previousUploads.length === 0) return null;

  let text = 'You tried to upload this file previously at these times:\n\n';
  previousUploads.forEach((previousUpload, index) => {
    text += '[' + index + '] ' + previousUpload.creationTime + '\n';
  });
  text += '\nEnter the corresponding number to resume an upload or press Cancel to start a new upload';

  const answer = prompt(text);
  const index = parseInt(answer, 10);

  if (!isNaN(index) && previousUploads[index]) {
    return previousUploads[index];
  }
}

/**
 * Adds a thumbnail for a file that is queued for upload
 * @param {Element} dropZoneElement the html element for the drop area
 * @param {File} file the file to be used as the thumbnail
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');
  dropZoneElement.querySelector('.drop-zone__prompt').style.opacity = '0';
  thumbnailElement = document.createElement('div');
  thumbnailElement.classList.add('drop-zone__thumb');
  dropZoneElement.appendChild(thumbnailElement);
  thumbnailElement.dataset.label = smartTrim(file.name, 14);

  const reader = new FileReader();
  reader.readAsDataURL(file);

  if (file.type.startsWith('image/')) {
    reader.onload = () => {
      // thumbnailElement.style.backgroundImage = `url('${reader.result}')`; // if need real thumbnail
      thumbnailElement.style.backgroundImage = `url(data:image/png;base64,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)`;
    };
  } else if (file.type.startsWith('video/')) {
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAABaCAMAAABubpNyAAAAOVBMVEX19PTKysr6/v/Q0NDs7Ozz8/PGxsb29vb4+PjwOC7e3t720c3329n3nZr2fHTzaWKyFxXvvLq6Sky9ft81AAAE6klEQVRo3u1ai3KjMAw0toWMQ8Kl//+xp5VsQu5mCglq52auSkPSlHpZvWUS6Fsl/Mdw+bich8tjOixDPgvHtZYgjz1hnJTH4Sy7MRcWCZ8KB5wAuPE0nELxjug5eRyP6HOHXTgoDHZjPsuOWE7ZxWpwwz6/PXZ8QEjOErjhAL9dOHnsLMFhZTfs4e3A4e/HlDko3B7eZ3BDjkdEVEmFhiZpfB3uMr0gM1Resliuyctwy4twgUrJtcnrcLeX4KI6p+YzHD4LBw+4gkhYXYrTF8PFALyeW/ltdvEuh8scb1OJsczyKTxxnpZZjrdnuJ6t+X24ywzMa7zKYbpdBFZep2kp92W5x+WhTBJupkw+AXeN03SLi8HJurO96lXgt00gbIL+fdvJ6nfFUBhB19dy7deyKrObjs8oc5ovWHsLJ3KNf8MFNuPJ80QgXEWTywOu2Gv8KnZLhJ1W211WG9pv3uymgPWbZ85GFBfx7Jlu7CZdFAEgcXdZLO4CkOO8TP7sjmYVJ3YvJLFvY4cCxMTfxQ4YTCfYvVZepXcAv/fZ3X+JfNzvl/myL6SVAHDvsovA+0jSGhV57EgDOsFOmiOBG7L0IGF34tQ618DeYwf5EHbS0BWUMtYHPT2tpUWpU8AzcafD5F3+L8DB4Xf68/S06Yf1hBbnZ9itE5B2BIqpi2ojr2QVgHpt5XPsOpxaRt28aLvVm4RgSPzcvXuwYyOkR6Gn5pS3RdVYQs9g7MSOGr82qFaZ/GUYqBV+1NIJe7ML2ipTTToM2CHJ9I5TaDOpO9lOPSYngNSas4wE8n4Uhg/z+bLjUGWIq5mjDgMcch3HlHtP68jOHrp6d0ldGgwz8WbL4yw7U6WcCLRaupOSJrgoY92g+yHqMj7sTJWyclUHJS5tC0ByXEhjAhI5ZRW2K2esywiyOkCjhLDXuBjA2S+rsMFV0VrB7CExMFSKGurQp+iY2C3udCUCuRphQR36BbCghAeckYyel+2CjvpCzhSLCBfAVDWbicfUMemk5WU7pGdZU8FKYweNSk4huGi7EjfPFKVBY5Yek6Yw06gm6FWbbuywZOauTOXXAFEiKi6F/Wyn/qA7ZA1OEfVNDQbnyU6cftAdMjZXMesZIqldC6+J7XwgyI/B4e2GGjJYZ8d+cceb4GqeaQQTXNLXdgYnS1rqeLjKiOq6jXOnihA0h6VWaLrtpBKg0UTulreecac792MOq+00bbaOSDMAFb+cqRwSfB7ZWuG0S5GPC5IodElentlaOik0uedMqUAAMN5SKkLwY4eszxpdA1l7VAGmuhR60HKx0uDjmdacF0LdLvJ5wYEtCoFWS5u4nGxnBR3bzTBZ798J1pPeLIVt6+dRzbVhV++EInVQQCmSJhd2LDoC+cVdS5vykwAoWLFIW0RCTdwVsPwYFNjDVVSDhORibbT00Giik4bAo0x5VfPQCJbchoRRweA22/t4LvXOQq8FMhPuGOicwKXPeOw1IzCv4ynrXCeuWdqT1xHZlV0fg0hvd9ln1OYsDv7sVkcI6xaDjeshfAm7ENbVLRC106XtnOxY76yuUuiQtFZdenD3tt2fNFfVerGTCKfyhPQ0F4c/dlTs7+kEu3Lsbm/bQcJttbeVWdMb39nI+fXbhet3LPqWxmHZuZm98wWS9jzO7dT3VdzlB+4H7t+E+w262b3J6LjdzQAAAABJRU5ErkJggg==)`;
    };
  } else if (file.type.startsWith('text/')) {
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAABaBAMAAACrnn5zAAAAMFBMVEX29vf09PQ4lN35+fnJycnp6ene3t7+/fvR0dLx8fHFxcWjy+zU5fJ1reVIcNMjV8fmPxWTAAADYElEQVRYw+2Yv2/TQBTH7+QBdXsPN4rcwpKlC0i2POQfSKSSiYWKMFVy45ZuVQcLQSWGFkUVQ09lqCXGtEKZUBmyw9ClMHTJP8AEQ3cWuLObOOdfd/bMt5YipX7+3Pf5/N5zCNYTYfVE6vIsSY1neVLyGqNhnvoq3vJbx02JEIP2VLxlD6gsQvnXnb6Ct+LlrAisTlfJy4RR5HGjvsKfhyQtEZcFZvylwzhvqTPKOJT3y4ccfwBWrzPqlvJWNsNUPkU6aYerX+yPr3O7HQRtSfuUkV0eNy7kNVq5+sbgbNwbjftFvNX8uM+ASxu+73exgFcQN6EAxHXbA6sab8IIhSVmDqry+JZBHqrgNYNgEry5bk2vguD+HQ94pKHiTVprl63pzbX4iHkWAjXMLYW/KO7R6kESZwICnmrxHgeX8zgK4r9myl9yiSQueN26ulmM4/sN9Hj7XxfiQJPH/X0/qMVbzKcmb8r97T1oTS/Xbirx8vanDi8nrhbvi5nL03gesB4PnXJ/H29vf7+/zugUFbzmj78/PXc/JcMitNxfc+/2lweZgi6Och4+/PPyVbpeWyav2KX+GAuPvZM0z0EgtJSHyHgfo0ghaWG8Xsc1u5Qn+hGvCRg1zKSxoIJnif7H+5a8Bmrn8hb7Q9SPCIYCA3cilpIX9VuKJ6bU/wyi9Cd4FM0QpcUzqsNDA3aG68P1mQ4Pu64Oj+dldyzpwlHyojnETE1ZfVU+o/mF72J5LnBt1ONRkhlhNHh87JBOAItp8fgXrrTQey5o8bJ50eLxainGjkS9c6LFo6dbUlynS7XyCdQK+SXCmSymd/94pDwOOop6PeORVF2iinod8fgpwFB+ILR4QE+MxbncbtuoweOrMsU05g/8jfjwBwT17t+x9Bj1LhwdHqC5I791HDl6PCeugfPnCVGPx+Jam9wPrXxyjmjMYpSblULNfEan0uivAo8vkBszCNiOXYWHxHy+824ojqdVeEDm98+rxMN4v/h+NZ6wZ9uu2KOV/NH4NkslTSufdOGNsYq/+clQlQfxycklqB4PZy+M8zpfgYfxeBW9AuryonkCZ/sTNPxtimzAHWzOi7yW8RrbJilQ86iE1zgPi9T4VMLDF51ekZ6U8NAq5IWM1fu9B7He7z3/eTq8f78DIITfzGl9AAAAAElFTkSuQmCC)`;
    };
  } else if (file.type.startsWith('audio/')) {
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAABaCAMAAABubpNyAAAAQlBMVEX39/fg4ODNzMzFxcX5+PnIyMjp6enz8/P1dUb19fXb29v1/P738/D////T09P5wrD24Nr5tJ/3nYH608f2hmDOSzb5tTfVAAAD/UlEQVRo3u2a65qjIAyGAwRSFKyH7v3f6ibBOp3ZmVqr+Gc2PtNOT7z9YkgCFuhUg9+LC85596KF3bjgTXjZfNiLc03GCGuGfACSfUnfM5w3SHF1hCjviWRf4j3FNZEgrh3FyHr7gj+f4xAortiizlm/ru85DuIq7k5lcWxhT6jIuduijs3uwQFBSolSMbr/Ux4USzEin8CkMJZo38ZZ07bQ/mw43wkydr6487k/n+CSs/0LNqWWeOoZ65glWchuxg2XDXZtE0LC0Fmx7un8+x533YTLKc0RrB82vi6O1c3TnSJQbraqSxtxnDJJpCkSmsrObPkLIpWUQIQ7cEPmqBnzRW8w59zzS3nkF1JOw+JMeJj2e3B97oWp4Eu+XsYr3/BXGHC4DXg9Brecu1vu8+0DN2gcyr2SrvlgdUMeRcoj7iZPjfwl9N9j1U3pgtNnHN/mYSi6yhPHqcvTZcqfcWM9dUMW48F52CsW3KT3Wc8dHnvueGiWMF1SfxuTRuQ4CWtgkkbnsTjVwN689ZmhF1aK/fjvvIMUOY0dMe9ezJk8zom4CCmeqW4fLm1O0XCeuqnlWpD24HD8w+ZM/q4jAvhoi8rjh276LRzRpDhMsbSRSbqtsiQonSX3C/eDBwFK+3DUM65pI663tV8ev4djnjPx5aZ9Ny4G12CKZ+Gki850Is6ZlvBMHJyLQ0qnOvOHWNEOFpClUwj0+OROdd8sHiMSg4iCMU1nfVcPJ2sAATVNxyDZvfGuw2U9crg6CHcOk2Stal13TwUVcNEUjKL0lnH1nInG+YVVrLtXg0q4O8kWaEVcLOp4TSzrcDY5d0BUT50vIG+7rjGBGsFBLRyIM4XDQ/I8F7WVQ6ULILuOOjyPXR23VHj5+Am40rLMY1fGecvxiXAWztl5A1edWRenkQg60UAz9gmhQnOYSMGrMxFA3ydqeHiUTwFXPS53pvMVKoJsCUljTlHOndRXnvBWthOlIuDRSQwpYAwNJy5RI216nPcv61Rz7si6kitleInKkqml3uHcrh0aKo27V1QdM2iqlr8KoVJ20p2Ob9WZwXmtQpYXEnB4AZLh5URps8ABSmUj34pvj2+NxHmlNfHlwhDzrWqVKxvH1zvgOirinDM05xPpMw13nFQjMiNx5DvfheI7ySlRKxERHN9nshppZ0mviCx6tMguK9gjnVlUwJwrP3bx9ZUKEyHqxbUy/KyopLVYoyJIgqbiSICHJ4hijWke5wDBpbh+ECpEJs0+LSH5sMVBdBTON3jmVgCnjFN3HhqM6xeyv27HxLfVGSyXxbcc3M68iQvcF2w36N7EketMY7baM9rKD0jCfD11y/Hupd7Tf6/yH/cf91twfwFjgRyVa7gpagAAAABJRU5ErkJggg==)`;
    };
  } else if (file.type.startsWith('application/')) {
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAABaCAMAAABubpNyAAAANlBMVEX19vXw8fDk5OTX19b39/f5+fjLzMvz8/NmrkLGxsbr6+vf4N7///95uF2t0Z6UxX4Wf0pjn4ABs+DbAAAEXUlEQVRo3u2ai5biIAyGCRAil+rO+7/sJqHQuupoW/Ts2R3qdGydwzd/SCDBGvpoM/8tDlJ8vVlzFGeDfbFlG0I6iINIiOi98U8boo0hmYM4MK8OLeYYXrHn9zhvvm9kjCc+jLGRec/1HcN57gCBgEqOwrP+0Ng9w6lAHjvyYswQY/LvVMcwJKSKC/JKuBvHvsYfS5+PDjGm2hSrOtZncScuV2PyzzcRYBBBPMZGFSf2xL24BE8aTzwAXnQaRUW152bc5bShgcwEBhyjqr6tODNtwak4HmGAxI0n2s3qNuKWOOSBpnfjerjom4/haodwHHcu59PpgqWky4nPcP4Dt7bnAHW5ZGFOU06ncp5Cme4aU7HH1U0lM+BcBMk4vr7cuArV+cf447hzuTDkMY5otSAdxzk4oRPUlLIY0+F0PxDMEGOWcHKFcaXk6VTUYd6IE04pZzGmsM+3Yb56HTdmQPGW8A1uqLoShcnuUq8u93Bd3wBXeXnOZOBHcF3cLnWXj6qDTThdCFSi/8TYAdaFx+/2zPSL25fjjloN8KB5ycIM9ClsX9wRKO55Es4Zpld1dCTu+PaX4Jalxd89xICe8zFTa4Xd6viDLzamf5JGc7ouWFyp24kjyJK0U1821wbrSym/CP38scrbi+slCa2AksJ66nittXRhFbvWpHs/rpck/GfYzOc1vbuVKvBj6jpO7EWLRUmR6it9yLCWL2PUkXZI3SVnbJ8ttRu/OxDWOCJza7gbc7Y7fgyOfCv15AJpliZ321U9DVLXS8duPh5T9Ubx1mViGaTOYEvLhYN1/Bpa1/GROGx/zwfk7HKtUtWYhEh9MMfgfOZi0UnFGJLulWWqV3IbutZhYxd050TOiaQmtlRvSMUKq8AfhHO1ZwFBkC0G0uJYie/Bxdp9AjUm1K0NYUIPxmFjV3FqOpQq3GAr/lkdjlZHYd4nDWSdy+KbLHhuabw6m+XIOaWgv63LUN/Y7A0N9kzGsSg+UrZgU7IJHOkNljovdQNx1CzH+vRtSK7vVcPKpcYGQhSTxuCiSw6qp0jcjR47mUNq1NmU2TfYHXOa4z7MOdTIsZujLIqTME6NWUOD4w6HL0BdHbtKJsNnl1qcAx4qJx/NmeoqKYhbMi2n98Ud9u8oUCOCG3BA1G8tsO+sjFuAXGu84MnGKvY7eZ3ODAuEeRKTtUDO0BYkjrtVdj8szOcoE5C4jAnLeleTBxqsbt6816UnUwvyFncj80yNu/m7iaqO9DoucUc0eBKrC1zSyctSbLlKBE/jx65H2Zwa9RVQvrsbPEXrCq7NEkkIJGPbnYQeBxuT01ottmrlhXzFuW2roj2NM+amRv8QjnqdsJwO4uhup3SvvnuvOk/LfsNSYx7G0VWn7VT3IK6l0QhjPhG4/BcKPICr//DV3va672X/ph7moLq+sTe/ro7rX3qYwrPPTtyGZx7WLezFbXqio7dgP/a8ijwgsPsBkje0H9wP7u/E/Qay4eCmlyuI9gAAAABJRU5ErkJggg==)`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}

/**
 * Cleaning progress bar
 * @return {void}
 */
function cleanProgressBar() {
  progressTotal.innerHTML = '';
  progressLength.innerHTML = '';
  progressSize.innerHTML = '';
  progressSpeed.innerHTML = '';
  progress.setAttribute('value', '0');
  progressBar.style.width = '0%';
}

/**
 * Activation of buttons
 * @return {void}
 */
function btnActivate() {
  btnThumbView.removeAttribute('disabled');
  btnSort.removeAttribute('disabled');
  btnClear.removeAttribute('disabled');
}

/**
 * Close sort list
 * @return {void}
 */
function closeSortList() {
  if (isSortOpen) {
    btnSort.click();
    isSortOpen = false;
  }
}

/**
 * Sort by key
 * @param {string} key
 * @return {void}
 */
function sortBy(key) {
  filesList = filesList.sort((a, b) => {
    if (key === 'name') {
      if (a.name > b.name) return 1;
      if (b.name > a.name) return -1;
      return 0;
    } else if (key === 'size') {
      if (a.size > b.size) return 1;
      if (b.size > a.size) return -1;
      return 0;
    } else if (key === 'lastModified') {
      if (a.lastModified > b.lastModified) return 1;
      if (b.lastModified > a.lastModified) return -1;
      return 0;
    }
  });
  list.innerHTML = '';

  for (let i = 0; i < filesList.length; i++) {
    updateFilesList(filesList[i], i);
  }
}
