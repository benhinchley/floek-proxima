import React, { Component, Fragment } from "react";
import Tone from "../Tone";
import { ROLE_PERFORMER, ROLE_AUDIENCE } from "../constants";
import { randomInt, scale } from "../utils";
import { Section } from "./Section";

const sections = [[{}]];

export class ChaosClusters extends Component {
  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  state = { section: 0, showNextButton: false };

  render() {
    const { section, showNextButton } = this.state;
    return (
      <Fragment>
        {showNextButton ? (
          <button onClick={this._handleNextSection}>next</button>
        ) : null}

        <Section
          sequences={
            /* sections[section] */ [
              {
                voices: 36,
                tempo: 80,
                repeat: 0,
                gain: 0.2,
                noteDuration: 0.56,
                frequencies: []
              }
            ]
          }
          onSectionEnd={() =>
            this.setState(state => ({ showNextButton: true }))
          }
        />
      </Fragment>
    );
  }

  _handleNextSection = () => {
    this.setState(state => ({
      ...state,
      section: (state.section += 1),
      showNextButton: false
    }));
  };

  componentDidMount() {
    const { role, socket } = this.props;

    // Start the global transport
    Tone.Transport.start(0);

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

  const sine = new Tone.Oscillator({
    type: "sine4",
    frequency: scale(0, 20, 6500, 9000)(randomInt(36))
  });

  const square = new Tone.Oscillator({
    type: "square4",
    frequency: scale(0, 20, 6500, 9000)(randomInt(36))
  });

  return {};
};
