import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Tone from "../Tone";
import { Socket } from "socket.io-client";
import { ROLE_PERFORMER, ROLE_AUDIENCE } from "../constants";
import { randomInt } from "../utils";

import { Container } from "../ui/Container";
import { Button } from "../ui/Button";

export class RhythmOfTheHeart extends Component {
  static propTypes = {
    role: PropTypes.string,
    socket: PropTypes.instanceOf(Socket)
  };

  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  state = { heartbeat: false, _sensorID: null };
  sensor = null;
  instruments = null;

  render() {
    if (this.props.role === ROLE_AUDIENCE) return null;

    return (
      <Fragment>
        <Container>
          <Button
            onClick={() =>
              this.setState(state => ({
                ...state,
                heartbeat: true,
                _sensorID: "A"
              }))
            }
          >
            A
          </Button>
          <Button
            onClick={() =>
              this.setState(state => ({
                ...state,
                heartbeat: true,
                _sensorID: "B"
              }))
            }
          >
            B
          </Button>
        </Container>

        <Button
          onClick={() =>
            this.props.socket.emit("floek:proxima:heartbeat:audience", {
              active: true
            })
          }
        >
          audience hb sounds
        </Button>
      </Fragment>
    );
  }

  componentDidMount() {
    const { role, socket } = this.props;

    if (socket === null) {
      console.error(
        "provided socket does not exists, abandoning all other setup."
      );
      return;
    }

    this.instruments = setupInstruments();
    if (this.instruments === null) {
      console.error("could not setup instruments, abandoning all other setup.");
      return;
    }

    if (role === ROLE_AUDIENCE) {
      socket.on("floek:proxima:heartbeat:audience", ({ active }) =>
        this.setState(state => ({ ...state, heartbeat: active }))
      );

      this.sensor = randomInt(2) === 0 ? "A" : "B";
      socket.on("floek:proxima:heartbeat", data =>
        this._play(this.sensor)(data)
      );
    } else if (role === ROLE_PERFORMER) {
      socket.on("floek:proxima:heartbeat", data =>
        this._play(this.state._sensorID)(data)
      );
    }
  }

  componentWillUnmount() {
    const { role, socket } = this.props;

    socket.off("floek:proxima:heartbeat");
  }

  _play = HB => ({ sensor }) => {
    // If the heartbeat is active AND the sensor incoming matches the key for the deivce
    // play the sound
    if (this.state.heartbeat && sensor === HB) {
      const synth = this.instruments[HB];
      synth.triggerAttack(233.08, "+0.1", Math.random() * 0.5 + 0.5);
    }
  };
}

export const setupInstruments = () => {
  // If we are not running in the browser, or if we
  // have not required tone do nothing.
  if (!process.browser || Tone === null) return null;

  const heartbeatA = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: {
      attack: 0.0006,
      decay: 0.5,
      sustain: 0
    }
  }).toMaster();

  const heartbeatB = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: {
      attack: 0.0006,
      decay: 0.5,
      sustain: 0
    }
  }).toMaster();

  heartbeatA.volume.value = 0;
  heartbeatB.volume.value = 0;

  return {
    A: heartbeatA,
    B: heartbeatB
  };
};
