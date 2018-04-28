let Tone = null;
if (process.browser) {
  Tone = require("tone");
}

module.exports = Tone;
