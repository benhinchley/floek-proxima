import React, { Component } from "react";
import Tone from "../Tone";
import { ROLE_PERFORMER, ROLE_AUDIENCE } from "../constants";
import { randomInt } from "../utils";

export class RhythmOfTheHeart extends Component {
  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  state = { heartbeat: false };
  sensor = null;
  instruments = null;

  render() {
    if (this.props.role === ROLE_AUDIENCE) return null;

    return (
      <div>
        <button
          onClick={() =>
            this.setState(state => ({ ...state, heartbeat: true }))
          }
        >
          hb sounds
        </button>

        <button
          onClick={() =>
            this.props.socket.emit("floek:proxima:heartbeat:audience", {
              active: true
            })
          }
        >
          audience hb sounds
        </button>
      </div>
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

    // Random select what heartbeat to play
    this.sensor = randomInt(2) === 0 ? "A" : "B";

    socket.on("floek:proxima:heartbeat", this._play(this.sensor));

    if (role === ROLE_AUDIENCE) {
      socket.on("floek:proxima:heartbeat:audience", ({ active }) =>
        this.setState(state => ({ ...state, heartbeat: active }))
      );
    } else if (role === ROLE_PERFORMER) {
      // performer specific things
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;
    socket.off("floek:proxima:heartbeat", this._play(this.sensor));
  }

  _play = HB => ({ sensor }) => {
    // If the heartbeat is active AND the sensor incoming matches the key for the deivce
    // play the sound
    if (this.state.heartbeat && sensor === HB) {
      this.instruments[HB].triggerAttackRelease("C4", "8n");
    }
  };
}

const setupInstruments = () => {
  // If we are not running in the browser, or if we
  // have not required tone do nothing.
  if (!process.browser || Tone === null) return null;

  const heartbeatA = new Tone.MonoSynth({
    oscillator: {
      type: "square8"
    },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.7,
      sustain: 0.1,
      release: 0.8,
      baseFrequency: 300,
      octaves: 4
    }
  });

  const heartbeatB = new Tone.MonoSynth({
    oscillator: {
      type: "square8"
    },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.7,
      sustain: 0.1,
      release: 0.8,
      baseFrequency: 300,
      octaves: 4
    }
  });

  return {
    A: heartbeatA.toMaster(),
    B: heartbeatB.toMaster()
  };
};
