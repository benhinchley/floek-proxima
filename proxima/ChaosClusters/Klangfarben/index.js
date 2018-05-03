import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Tone from "../../Tone";
import { Socket } from "socket.io-client";
import { ROLE_AUDIENCE, ROLE_PERFORMER } from "../../constants";
import { randomInt } from "../../utils";

import { voices } from "./data/voices";
import { sequences } from "./data/sequences";

import { Button } from "../../ui/Button";

export class Klangfarben extends Component {
  static propTypes = {
    role: PropTypes.oneOf([ROLE_AUDIENCE, ROLE_PERFORMER]),
    socket: PropTypes.instanceOf(Socket)
  };

  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  state = { sequence: 0, done: false };

  _voice = null;
  _synth = null;
  _part = null;

  componentDidMount() {
    const { role, socket } = this.props;
    const { sequence } = this.state;

    this._voice = voices[randomInt(24)];
    this._synth = new Tone.Synth({
      oscillator: {
        type: "triangle"
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2
      }
    }).toMaster();

    if (role === ROLE_AUDIENCE) {
      socket.on("floek:chaos:klangfarben:sequence", this._handleSequenceUpdate);
    }

    Tone.Transport.bpm.value = 60;
    Tone.Transport.seconds = 0;
    Tone.Transport.stop();

    this._part = new Tone.Part(this._play, sequences[sequence]).start(0);
    Tone.Transport.start();
  }

  _handleSequenceUpdate = ({ sequence }) =>
    this.setState(state => ({ ...state, sequence }));

  componentDidUpdate(prevProps, prevState) {
    const { sequence } = this.state;
    Tone.Transport.stop();
    this._part.dispose();

    console.log({ voice: this._voice, sequence: sequences[sequence] });

    Tone.Transport.seconds = 0;
    this._part = new Tone.Part(this._play, sequences[sequence]).start(0);
    Tone.Transport.start();
  }

  _play = (time, { voices, duration, freqs, gain }) => {
    const index = voices.indexOf(this._voice);
    if (index === -1) return;

    this._synth.triggerAttackRelease(freqs[index], duration, time, gain);
  };

  componentWillUnmount() {
    const { role, socket } = this.props;

    if (role === ROLE_AUDIENCE) {
      socket.off(
        "floek:chaos:klangfarben:sequence",
        this._handleSequenceUpdate
      );
    }
  }

  render() {
    const { role } = this.props;
    const { done } = this.state;
    return role === ROLE_PERFORMER ? (
      <Fragment>
        {done ? (
          <h1>DONE</h1>
        ) : (
          <Button onClick={this._nextSequence}>next sequence</Button>
        )}
      </Fragment>
    ) : null;
  }

  _nextSequence = () =>
    this.setState(
      state => ({
        ...state,
        sequence: (state.sequence += 1)
      }),
      () => {
        const { role, socket } = this.props;
        if (role === ROLE_PERFORMER) {
          const { sequence } = this.state;
          socket.emit("floek:chaos:klangfarben:sequence", { sequence });
          if (sequence === sequences.length - 1) {
            this.setState(state => ({ ...state, done: true }));
          }
        }
      }
    );
}
