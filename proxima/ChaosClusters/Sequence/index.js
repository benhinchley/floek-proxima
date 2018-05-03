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
    loopAfterRepeats: PropTypes.bool,
    wave: PropTypes.string
  };

  static defaultProps = {
    loopAfterRepeats: false
  };

  _voice = -1;
  _sine = null;
  _env = null;
  _sequence = null;
  _repeats = 0;

  componentDidUpdate(prevProps, prevState) {
    Tone.Transport.stop();

    if (this._sequence !== null) {
      this._sequence.stop();
      this._env.disconnect(Tone.Master).dispose();
      this._sine
        .stop()
        .disconnect(this._env)
        .dispose();
      this._repeats = 0;
      this._env = this._sine = this._sequence = null;
    }

    this._setupSequence(this.props);
  }

  componentDidMount() {
    this._setupSequence(this.props);
  }

  componentWillUnmount() {
    Tone.Transport.stop();

    if (this._sequence !== null) {
      this._sequence.stop();
      this._env.disconnect(Tone.Master);
      this._sine
        .stop()
        .disconnect(this._env)
        .dispose();
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
    wave,
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
      type: wave !== undefined ? wave + "4" : "sine4",
      frequency: frequencies[this._voice]
    })
      .connect(this._env)
      .start();

    // Set the transport bpm to the sequence tempo
    Tone.Transport.bpm.value = tempo;
    Tone.Transport.start();

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
    if (note === this._voice) {
      this._env.triggerAttackRelease(noteDuration, time, gain);
    }

    if (note === voices - 1) {
      if (!loopAfterRepeats && this._repeats === repeat) {
        Tone.Transport.scheduleOnce(time => {
          next();
        }, "+" + noteDuration);
        return;
      }
      this._repeats += 1;
    }
  };

  render() {
    return null;
  }
}
