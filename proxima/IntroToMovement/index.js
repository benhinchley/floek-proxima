import React, { Component } from "react";
import { ROLE_PERFORMER, ROLE_AUDIENCE } from "../constants";
import { randomInt } from "../utils";

let Tone = null;
if (process.browser) {
  Tone = require("tone");
}

export class IntroToMovement extends Component {
  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  render() {
    return null;
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

    const HB = randomInt(2) === 0 ? "A" : "B";

    socket.on("floek:proxima:heartbeat", ({ sensor }) => {
      if (sensor === HB) {
        this.instruments[HB].triggerAttackRelease("C4", "8n");
      }
    });

    if (role === ROLE_AUDIENCE) {
      // audience specific things
      // recieving motion data and applying to params accordingly
    } else if (role === ROLE_PERFORMER) {
      // performer specific things
      // sending motion data
    }
  }
}

const setupInstruments = () => {
  if (!process.browser || Tone === null) return;

  const synthConfig = {
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
  };

  const envA = new Tone.AmplitudeEnvelope({
    attack: 0.1,
    decay: 0.2,
    sustain: 1.0,
    release: 0.8
  }).toMaster();

  const envB = new Tone.AmplitudeEnvelope({
    attack: 0.1,
    decay: 0.2,
    sustain: 1.0,
    release: 0.8
  }).toMaster();

  const osc = new Tone.Oscillator({
    partials: [3, 2, 1],
    type: "custom",
    frequency: "C#4",
    volume: -8
  });

  const heartbeatA = osc.connect(envA).start();
  const heartbeatB = osc.connect(envB).start();

  return {
    A: envA,
    B: envB
  };
};
