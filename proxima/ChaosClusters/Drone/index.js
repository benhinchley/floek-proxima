import React, { Component } from "react";
import PropTypes from "prop-types";
import Tone from "../../Tone";

// TODO(@benhinchley): create drone synth
export class Drone extends Component {
  static propTypes = {
    bpm: PropTypes.number,
    duration: PropTypes.number,
    freqRange: PropTypes.arrayOf(PropTypes.number),
    gain: PropTypes.number
  };

  componentDidMount() {
    this._env.triggerAttack();
    setTimeout(function() {
      this._env.triggerRelease();
      this.props.onSectionEnd();
    }, this.props.duration * 1000);
  }

  render() {
    return null;
  }
}
