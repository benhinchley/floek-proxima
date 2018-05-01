import React, { Component } from "react";
import PropTypes from "prop-types";
import Tone from "../../Tone";
import { randomInt } from "../../utils";

export class Drone extends Component {
  static propTypes = {
    duration: PropTypes.number.isRequired,
    freqRange: PropTypes.arrayOf(PropTypes.number).isRequired,
    gain: PropTypes.number.isRequired,
    onSectionEnd: PropTypes.func.isRequired
  };

  _synth = null;

  componentDidMount() {
    const { freqRange, duration, gain, onSectionEnd } = this.props;

    this._synth = new Tone.Synth({
      oscillator: {
        type: "square"
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 1,
        release: 1
      }
    }).toMaster();

    const freq = freqRange[0] + randomInt(freqRange[1] - freqRange[0]);

    this._synth.triggerAttackRelease(freq, duration, "+0.05", gain);
    setTimeout(onSectionEnd, duration * 1000);
  }

  componentWillUnmount() {
    this._synth = null;
  }

  render() {
    return null;
  }
}
