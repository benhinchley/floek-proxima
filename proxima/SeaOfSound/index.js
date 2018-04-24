import React, { Component } from "react";
import { ROLE_PERFORMER, ROLE_AUDIENCE } from "../constants";
import { randomInt } from "../utils";

let Tone = null;
if (process.browser) {
  Tone = require("tone");
}

export class SeaOfSound extends Component {
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

  return {};
};
