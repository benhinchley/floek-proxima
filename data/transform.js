const path = require("path");
const loadJSON = require("load-json-file");
const writeJSON = require("write-json-file");

const json = loadJSON.sync(path.resolve(__dirname, "sequences.json"));

const sequences = json.map(sequence => {
  return {
    reference: sequence["Reference"],
    description: sequence["Description"],
    voices: parseInt(sequence["Voices"], 10),
    tempo: parseInt(sequence["Tempo (MM)"], 10),
    frequencies: sequence["Frequency sequence (hz)"]
      .split(",")
      .map(freq => parseFloat(freq)),
    noteDuration: parseFloat(sequence["Note dur (s)"]),
    gain: parseFloat(sequence["Gain"]),
    repeat: parseFloat(sequence["Repeat"]),
    loopAfterRepeats: sequence["Notes"] === "trigger to next" ? true : false
  };
});

writeJSON.sync(
  path.resolve(__dirname, "transformed-sequences.json"),
  sequences
);
