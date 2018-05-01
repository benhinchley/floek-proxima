import React, { Component } from "react";

import storage from "../lib/storage";

import { ROLE_AUDIENCE, ROLE_PERFORMER, CURRENT_SECTION } from "./constants";

import { RhythmOfTheHeart } from "./RhythmOfTheHeart";
import { IntroToMovement } from "./IntroToMovement";
import { ChaosClusters } from "./ChaosClusters";

const sections = [RhythmOfTheHeart, IntroToMovement, ChaosClusters];
const titles = ["Rhythm Of The Heart", "Intro To Movement", "Chaos Clusters"];

export class Proxima extends Component {
  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  state = { current: -1 };

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
  }

  render() {
    const { role, socket } = this.props;
    const { current } = this.state;
    const Current = sections[current];

    if (current === -1 && role === ROLE_PERFORMER) {
      return (
        <div>
          <button onClick={this._next}>start</button>
        </div>
      );
    }

    if (Current === null || Current === undefined) {
      return null;
    }

    return (
      <div>
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
          <div>
            <button onClick={this._prev}>prev</button>
            <button onClick={this._next}>next</button>
          </div>
        ) : null}
      </div>
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
