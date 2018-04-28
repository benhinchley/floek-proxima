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

      if (current === 5) {
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
        {role === ROLE_PERFORMER ? <h2>{titles[current]}</h2> : null}

        <Current role={role} socket={socket} />

        {role === ROLE_PERFORMER ? (
          <div>
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
}
