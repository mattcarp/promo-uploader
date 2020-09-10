export class Helper {
  /**
   * Convert unix time to normal
   * @param {number} seconds
   * @param {number} decimals
   * @return {string} result
   */
  clockFormat(seconds, decimals) {
    let hours;
    let minutes;
    let secs;
    let result;

    hours = parseInt(String(seconds / 3600), 10) % 24;
    minutes = parseInt(String(seconds / 60), 10) % 60;
    secs = seconds % 60;
    secs = secs.toFixed(decimals);

    result =
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (secs < 10 ? "0" + secs : secs);

    return result;
  }

  /**
   * Get size of file
   * @param {number} bytes
   * @return {string}
   */
  updateSize(bytes) {
    let output = bytes + " bytes";

    for (
      let multiples = ["Kb", "Mb", "Gb", "Tb"],
        multiple = 0,
        approx = bytes / 1024;
      approx > 1;
      approx /= 1024, multiple++
    ) {
      output = approx.toFixed(2) + " " + multiples[multiple];
    }

    return output;
  }

    /**
   * Ellipsis in the middle of long text (Mac style)
   * @param {string} fileName
   * @param {number} maxLength
   * @return {string} fileName
   */
  smartTrim(fileName, maxLength){
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
}
