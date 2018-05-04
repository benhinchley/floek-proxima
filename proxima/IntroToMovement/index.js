import React, { Component } from "react";
import Tone from "../Tone";
import { ROLE_PERFORMER, ROLE_AUDIENCE } from "../constants";
import { randomInt } from "../utils";
import { setupInstruments } from "../RhythmOfTheHeart";

import { Movement } from "./Movement";

export class IntroToMovement extends Component {
  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  instruments = null;
  HB = null;

  render() {
    const { role, socket } = this.props;
    return <Movement role={role} socket={socket} />;
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

    this.HB = "B";

    socket.on("floek:proxima:heartbeat", this._play(this.HB));
  }

  componentWillUnmount() {
    const { socket } = this.props;

    socket.off("floek:proxima:heartbeat");
  }

  _play = HB => ({ sensor }) => {
    if (sensor === HB) {
      this.instruments[HB].triggerAttackRelease("C4", "8n");
    }
  };
}
