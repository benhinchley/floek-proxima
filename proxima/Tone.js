let Tone = null;
if (process.browser) {
  if (Tone === null) {
    Tone = require("tone");
  }

  if (process.env.NODE_ENV !== "production") {
    if (!("Tone" in window)) {
      window["Tone"] = Tone;
    }
  }
}

module.exports = Tone;
