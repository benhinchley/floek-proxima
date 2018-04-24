import React, { Component } from "react";
import { PERFORMER, AUDIENCE } from "../constants";
import { randomInt } from "../utils";

let Tone = null;
if (process.browser) {
  Tone = require("tone");
}

export class LoveIn extends Component {
  static defaultProps = {
    role: AUDIENCE
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

    if (role === AUDIENCE) {
      // audience specific things
      // recieving motion data and applying to params accordingly
    } else if (role === PERFORMER) {
      // performer specific things
      // sending motion data
    }
  }
}

const setupInstruments = () => {
  if (!process.browser || Tone === null) return;

  return {};
};
