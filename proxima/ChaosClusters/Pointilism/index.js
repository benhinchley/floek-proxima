import React, { Component } from "react";
import PropTypes from "prop-types";
import Tone from "../../Tone";
import { randomInt, scale } from "../../utils";

export class Pointilism extends Component {
  static propTypes = {
    bpmRange: PropTypes.arrayOf(PropTypes.number),
    duration: PropTypes.number,
    frequencyRange: PropTypes.arrayOf(PropTypes.number),
    noteDurationRange: PropTypes.arrayOf(PropTypes.number),
    gainRange: PropTypes.arrayOf(PropTypes.number)
  };

  _sine = null;
  _env = null;
  _sequence = null;
  _noteDurScale = null;
  _gainScale = null;

  componentDidMount() {
    const {
      frequencyRange,
      bpmRange,
      noteDurationRange,
      gainRange,
      duration,
      onSectionEnd
    } = this.props;

    if (Tone === null) {
      console.error("Tone was not initalised, abandoning all other setup.");
      return;
    }

    this._noteDurScale = scale(
      bpmRange[0],
      bpmRange[1],
      noteDurationRange[0],
      noteDurationRange[1]
    );
    this._gainScale = scale(
      bpmRange[0],
      bpmRange[1],
      gainRange[0],
      gainRange[1]
    );

    this._env = new Tone.AmplitudeEnvelope({
      attack: 0.1,
      decay: 0.2,
      sustain: 0,
      release: 0.2
    }).toMaster();

    this._sine = new Tone.Oscillator({
      type: "square4",
      frequency:
        frequencyRange[0] + randomInt(frequencyRange[1] - frequencyRange[0])
    })
      .connect(this._env)
      .start();

    // Set the transport bpm to the sequence tempo
    Tone.Transport.bpm.value = bpmRange[0];
    Tone.Transport.bpm.rampTo(bpmRange[1], duration);
    Tone.Transport.start();

    this._sequence = new Tone.Sequence(this._play, [0], "4n").start("+0.1");
    setTimeout(onSectionEnd, duration * 1000);
  }

  componentWillUnmount() {
    Tone.Transport.stop();
    if (this._sequence !== null) {
      this._sequence.stop();
    }

    this._env = this._sine = this._sequence = null;
  }

  _play = (time, note) => {
    this._env.triggerAttackRelease(
      this._noteDurScale(Tone.Transport.bpm.value),
      time,
      this._gainScale(Tone.Transport.bpm.value)
    );
  };

  render() {
    return null;
  }
}
