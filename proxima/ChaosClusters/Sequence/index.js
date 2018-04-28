import React, { Component } from "react";
import PropTypes from "prop-types";

import Tone from "../../Tone";
import { randomInt, range } from "../../utils";

export class Sequence extends Component {
  static propTypes = {
    voices: PropTypes.number.isRequired,
    frequencies: PropTypes.arrayOf(PropTypes.number).isRequired,
    tempo: PropTypes.number.isRequired,
    noteDuration: PropTypes.number.isRequired,
    gain: PropTypes.number.isRequired,
    repeat: PropTypes.number.isRequired,
    loopAfterRepeats: PropTypes.bool
  };

  static defaultProps = {
    loopAfterRepeats: false
  };

  _voice = -1;
  _sine = null;
  _env = null;
  _sequence = null;
  _repeats = 0;

  componentDidUpdate(nextProps, nextState) {
    if (this._sequence !== null) {
      this._sequence.stop();
      this._repeats = 0;
    }

    this._setupSequence(nextProps);
  }

  componentDidMount() {
    this._setupSequence(this.props);
  }

  componentWillUnmount() {
    if (this._sequence !== null) {
      this._sequence.stop();
    }
    this._env = this._sine = this._sequence = null;
  }

  _setupSequence = ({
    voices,
    frequencies,
    gain,
    noteDuration,
    tempo,
    repeat,
    loopAfterRepeats,
    next
  }) => {
    this._voice = randomInt(voices);

    if (Tone === null) {
      console.error("Tone was not initalised, abandoning all other setup.");
      return;
    }

    this._env = new Tone.AmplitudeEnvelope({
      attack: 0.1,
      decay: 0.2,
      sustain: 0,
      release: 0.2
    }).toMaster();

    this._sine = new Tone.Oscillator({
      type: "sine4",
      frequency: frequencies[this._voice]
    })
      .connect(this._env)
      .start();

    // Set the transport bpm to the sequence tempo
    Tone.Transport.bpm.value = tempo;

    this._sequence = new Tone.Sequence(
      this._play(noteDuration, repeat, loopAfterRepeats, gain, voices, next),
      range(voices),
      "4n"
    ).start("+0.1");
  };

  _play = (noteDuration, repeat, loopAfterRepeats, gain, voices, next) => (
    time,
    note
  ) => {
    if (note === voices - 1) {
      if (!loopAfterRepeats && this._repeats === repeat) {
        next();
        return;
      }
      this._repeats += 1;
    } else if (note === this._voice) {
      this._env.triggerAttackRelease(noteDuration, time, gain);
    }
  };

  render() {
    return null;
  }
}
