import React, { Component, Fragment } from "react";
import Tone from "../Tone";
import { ROLE_PERFORMER, ROLE_AUDIENCE } from "../constants";
import { randomInt, scale } from "../utils";

import { sections } from "./data/sections";

import { Button } from "../ui/Button";
import { Section } from "./Section";
import { Pointilism } from "./Pointilism";
import { IntroToMovement } from "../IntroToMovement";
import { Drone } from "./Drone";
import { Klangfarben } from "./Klangfarben";

export class ChaosClusters extends Component {
  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  state = { section: -1, showNextButton: true };

  render() {
    const { role, socket } = this.props;
    const { section, showNextButton } = this.state;

    return (
      <Fragment>
        {role === ROLE_PERFORMER && showNextButton ? (
          <Button onClick={this._handleNextSection}>
            {section === -1 ? "start" : "next section"}
          </Button>
        ) : null}

        {section >= 0 && section <= 23 ? (
          <Section
            sequences={sections[section]}
            wave={section >= 0 && section <= 12 ? "sine" : "square"}
            onSectionEnd={() =>
              this.setState(state => ({ showNextButton: true }))
            }
          />
        ) : null}

        {section === 24 ? (
          <Pointilism
            duration={60}
            bpmRange={[45, 418]}
            frequencyRange={[60.0, 9000.0]}
            noteDurationRange={[0.67, 10.0]}
            gainRange={[0.1, 1.0]}
            onSectionEnd={() =>
              this.setState(state => ({ showNextButton: true }))
            }
          />
        ) : null}

        {section === 25 ? (
          <Drone
            duration={10.0}
            freqRange={[60.0, 9000.0]}
            gain={1}
            onSectionEnd={() =>
              this.setState(state => ({ showNextButton: true }))
            }
          />
        ) : null}

        {section === 26 ? /* silence */ null : null}

        {section >= 27 ? (
          <Fragment>
            {section === 27 && role === ROLE_PERFORMER ? (
              <Button onClick={this._handleNextSection}>next section</Button>
            ) : null}
            <IntroToMovement role={role} socket={socket} />
          </Fragment>
        ) : null}
        {section === 28 ? <Klangfarben role={role} socket={socket} /> : null}
      </Fragment>
    );
  }

  _handleNextSection = () => {
    this.setState(
      state => ({
        ...state,
        section: (state.section += 1),
        showNextButton: false
      }),
      () => {
        const { socket } = this.props;
        const { section } = this.state;
        socket.emit("floek:chaos:section", { section });
      }
    );
  };

  componentDidMount() {
    const { role, socket } = this.props;

    if (socket === null) {
      console.error(
        "provided socket does not exists, abandoning all other setup."
      );
      return;
    }
    
    socket.on("floek:chaos:section", this._audienceUpdateSection);

    if (role === ROLE_AUDIENCE) {
      // audience specific things
    } else if (role === ROLE_PERFORMER) {
      // performer specific things
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;
    socket.off("floek:chaos:section", this._audienceUpdateSection);
  }

  componentDidUpdate() {
    const { section, showNextButton } = this.state;
    if (section === 26 && !showNextButton)
      this.setState(state => ({ showNextButton: true }));
  }

  _audienceUpdateSection = ({ section }) => {
    if (section === this.state.section) {
      return;
    }
    this.setState(state => ({ ...state, section, showNextButton: false }));
  }
}
