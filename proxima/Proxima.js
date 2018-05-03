import React, { Component } from "react";
import { injectGlobal } from "styled-components";
import StartAudioContext from "startaudiocontext";
import Tone from "./Tone";
import storage from "../lib/storage";

import { ROLE_AUDIENCE, ROLE_PERFORMER, CURRENT_SECTION } from "./constants";

import { AbsoluteContainer, Container } from "./ui/Container";
import { Button } from "./ui/Button";

import { RhythmOfTheHeart } from "./RhythmOfTheHeart";
import { IntroToMovement } from "./IntroToMovement";
import { ChaosClusters } from "./ChaosClusters";

const sections = [RhythmOfTheHeart, IntroToMovement, ChaosClusters];
const titles = ["Rhythm Of The Heart", "Intro To Movement", "Chaos Clusters"];

injectGlobal`
html, body {
  font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
    Bitstream Vera Sans Mono, Courier New, monospace, serif;
}
`;

export class Proxima extends Component {
  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  state = { current: -1, audioRunning: false };

  componentDidMount() {
    const { role, socket } = this.props;

    let current = storage.getItem(CURRENT_SECTION);
    if (current !== null) {
      current = parseInt(current, 10);

      if (current === 3) {
        this.setState(state => ({ ...state, current: -1 }));
        return;
      }

      this.setState(state => ({ ...state, current }));
    }

    socket.on("floek:proxima:section", ({ current }) => {
      if (this.state.current === current) {
        return;
      }

      this.setState(
        state => ({ ...state, current }),
        () => {
          storage.setItem(CURRENT_SECTION, this.state.current);
        }
      );
    });
    
    if (Tone !== null) {
      StartAudioContext(Tone.context, '#root').then(this._audioRunning)
    }
  }

  _audioRunning = () => this.setState(state => ({...state, audioRunning: true}))

  render() {
    const { role, socket } = this.props;
    const { current, audioRunning } = this.state;
    const Current = sections[current];

    if (current === -1 && role === ROLE_PERFORMER) {
      return <Button onClick={this._next}>start</Button>;
    }

    if (Current === null || Current === undefined) {
      return null;
    }

    return (
      <Container direction="column">
        {!audioRunning ? <h3>PLEASE TOUCH THE SCREEN, TO START AUDIO PLAYBACK</h3> : null}
      
        {role === ROLE_AUDIENCE ? (
          <div>
            <p>
              Welcome to Flœk’s Proxima. Please read the following carefully.
            </p>
            <ul>
              <li>
                This work uses the browser on your phone to play sound and make
                light.
              </li>
              <li>
                The performers need you to light them during the work! You can
                use your phone’s screen for this.
              </li>
              <li>
                Please keep your phone volume and brightness up to their
                maximum.
              </li>
              <li>
                If you know how to set your phone to “Do not disturb” please do
                so.
              </li>
              <li>
                If your phone locks or falls asleep during performance, wake it
                back up and re-join!
              </li>
            </ul>

            <p>
              Got a question for Ben and Andrew? Contact us at{" "}
              <a href="mailto:hi@vordenker.com.au">hi@vordenker.com.au</a>
            </p>
          </div>
        ) : null}

        {role === ROLE_PERFORMER ? <h2>{titles[current]}</h2> : null}

        <Current role={role} socket={socket} />

        {role === ROLE_PERFORMER ? (
          <AbsoluteContainer
            position={{ bottom: "1rem", left: "1rem", right: "1rem" }}
          >
            <Container>
              <Button onClick={this._prev}>prev</Button>
              <Button onClick={this._next}>next</Button>
            </Container>
          </AbsoluteContainer>
        ) : null}
      </Container>
    );
  }

  _next = () => {
    const { socket } = this.props;

    this.setState(
      state => ({
        ...state,
        current: (state.current += 1)
      }),
      () => {
        socket.emit("floek:proxima:section", { current: this.state.current });
        storage.setItem(CURRENT_SECTION, this.state.current);
      }
    );
  };

  _prev = () => {
    const { socket } = this.props;

    this.setState(
      state => ({
        ...state,
        current: (state.current -= 1)
      }),
      () => {
        socket.emit("floek:proxima:section", { current: this.state.current });
        storage.setItem(CURRENT_SECTION, this.state.current);
      }
    );
  };
}
