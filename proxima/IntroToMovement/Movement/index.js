import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Tone from "../../Tone";
import { Socket } from "socket.io-client";
import { randomInt } from "../../utils";

import { Motion } from "../../components/Motion";
import { ROLE_AUDIENCE, ROLE_PERFORMER } from "../../constants";

export class Movement extends Component {
  static propTypes = {
    role: PropTypes.string,
    socket: PropTypes.instanceOf(Socket)
  };

  static defaultProps = {
    role: ROLE_AUDIENCE
  };

  state = { _sensorID: null, speed: 0.0, height: 0.0 };
  _sensorID = null;

  _volume = null;
  _source = null;

  componentDidMount() {
    const { role, socket } = this.props;

    if (Tone === null) {
      console.error("Tone was not initalised, abandoning all other setup.");
      return;
    }

    this._volume = new Tone.Volume(0).toMaster(); // intialise volue to 0 decibels

    if (role === ROLE_AUDIENCE) {
      this._sensorID = randomInt(2) === 0 ? "A" : "B";

      socket.on("floek:movement:height", this._audienceHandleHeightChange);
      socket.on("floek:movement:speed", this._audienceHandleSpeedChange);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { _sensorID } = this.state;

    if (_sensorID !== null && this._source === null) {
      if (_sensorID === "A") {
        // TODO(@benhinchley): setup synth tone for andrew
      } else if (_sensorID === "B") {
        // setup pink noise
        this._source = new Tone.Noise("pink").start();
        this._source.connect(this._volume);
      }
    }
  }

  componentWillUnmount() {
    const { role, socket } = this.props;
    if (role === ROLE_AUDIENCE) {
      socket.off("floek:movement:height", this._audienceHandleHeightChange);
      socket.off("floek:movement:speed", this._audienceHandleSpeedChange);
    }
  }

  render() {
    const { role } = this.props;
    const { _sensorID } = this.state;

    return role === ROLE_PERFORMER ? (
      <Fragment>
        {_sensorID === null ? (
          <Fragment>
            <button
              onClick={() =>
                this.setState(state => ({ ...state, _sensorID: "A" }))
              }
            >
              A
            </button>
            <button
              onClick={() =>
                this.setState(state => ({ ...state, _sensorID: "B" }))
              }
            >
              B
            </button>
          </Fragment>
        ) : null}

        <Motion
          frequency={50}
          onHeightChange={this._handleHeightChange}
          onSpeedChange={this._handleSpeedChange}
        />
      </Fragment>
    ) : null;
  }

  // TODO(@benhinchley): connect height to pitch / filter center
  _adjustPitch = () => {};

  _adjustAmplitude = () => {
    const { speed } = this.state;

    const value = 1.0 - speed;
    const amplitute = scale(0.0, 1.0, -Infinity, 0.0)(value);
    this._volume.rampTo(amplitute, 0.05);
  };

  _audienceHandleHeightChange = ({ id, height }) => {
    if (id !== this._sensorID) return;

    this.setState(state => ({ ...state, height }), this._adjustPitch);
  };

  _audienceHandleSpeedChange = ({ id, speed }) => {
    if (id !== this._sensorID) return;

    this.setState(state => ({ ...state, speed }), this._adjustAmplitude);
  };

  _handleHeightChange = height =>
    this.setState(
      state => ({ ...state, height }),
      () => {
        this._adjustPitch();

        if (this.props.role === ROLE_PERFORMER) {
          const { socket } = this.props;
          const { height, _sensorID } = this.state;

          const id = _sensorID;
          if (id === null) return;

          socket.emit("floek:movement:height", { id, height });
        }
      }
    );

  _handleSpeedChange = speed =>
    this.setState(
      state => ({ ...state, speed }),
      () => {
        this._adjustAmplitude();

        if (this.props.role === ROLE_PERFORMER) {
          const { socket } = this.props;
          const { speed, _sensorID } = this.state;

          const id = _sensorID;
          if (id === null) return;

          socket.emit("floek:movement:speed", { id, speed });
        }
      }
    );
}
