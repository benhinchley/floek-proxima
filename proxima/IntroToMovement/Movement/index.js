import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Tone from "../../Tone";
import { Socket } from "socket.io-client";
import { randomInt, scale, isWithin } from "../../utils";

import { Container } from "../../ui/Container";
import { Button } from "../../ui/Button";
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
  _filter = null;
  _lfo = new Tone.LFO(0.016, 74.42, 554.37).start()
  _lfos = [
    new Tone.LFO(0.009, 74.42, 554.37).start(),
    new Tone.LFO(0.009, 74.42 * 3.6364, 554.37 * 3.6364).start(),
    new Tone.LFO(0.009, 74.42 * 4.0909, 554.37 * 4.0909).start(),
    new Tone.LFO(0.009, 74.42 * 9.0909, 554.37 * 9.0909).start(),
    new Tone.LFO(0.009, 74.42 * 12.7273, 554.37 * 12.7273).start()
  ];

  componentDidMount() {
    const { role, socket } = this.props;

    if (Tone === null) {
      console.error("Tone was not initalised, abandoning all other setup.");
      return;
    }

    this._volume = new Tone.Volume(0).toMaster(); // intialise volue to 0 decibels

    if (role === ROLE_AUDIENCE) {
      this._sensorID = "B";

      // socket.on("floek:movement:height", this._audienceHandleHeightChange);
      socket.on("floek:movement:speed", this._audienceHandleSpeedChange);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { _sensorID } = this.state;

    if (_sensorID !== null && this._source === null) {
      if (_sensorID === "A") {
        this._source = [
          new Tone.Oscillator({
            type: "sine",
            frequency: 74.42,
            partials: [
              0.09,
              0.07,
              0,
              0,
              0,
              0.07,
              0,
              0.05,
              0,
              0,
              0,
              0,
              0,
              0.02,
              0,
              0.009
            ]
          })
            .connect(this._volume)
            .start(),
          new Tone.Oscillator({
            type: "sine",
            frequency: 270.6179112,
            partials: [0.06, 0.009]
          })
            .connect(this._volume)
            .start(),
          new Tone.Oscillator({
            type: "sine",
            frequency: 304.4454478,
            partials: [0.06]
          })
            .connect(this._volume)
            .start(),
          new Tone.Oscillator({
            type: "sine",
            frequency: 676.5454545,
            partials: [0.08]
          })
            .connect(this._volume)
            .start(),
          new Tone.Oscillator({
            type: "sine",
            frequency: 947.165666,
            partials: [0.008]
          })
            .connect(this._volume)
            .start()
        ]; 
        this._lfos.forEach((lfo, idx) => lfo.connect(this._source[idx].frequency))
      } else if (_sensorID === "B") {
        // setup pink noise
        this._source = new Tone.Noise("pink").start();
        this._filter = new Tone.Filter(440, "highpass");
        this._source.connect(this._filter);
        this._filter.connect(this._volume);
        this._lfo.connect(this._filter.frequency)
      }
    }
  }

  componentWillUnmount() {
    const { role, socket } = this.props;
    if (role === ROLE_AUDIENCE) {
      // socket.off("floek:movement:height");
      socket.off("floek:movement:speed");
    }

    if (role === ROLE_PERFORMER) {
      this._volume.dispose();
      this._source = this._filter = this._volume = null;
    }
  }

  render() {
    const { role } = this.props;
    const { _sensorID } = this.state;

    return role === ROLE_PERFORMER ? (
      <Fragment>
        {_sensorID === null ? (
          <Container>
            <Button
              onClick={() =>
                this.setState(state => ({ ...state, _sensorID: "A" }))
              }
            >
              A
            </Button>
            <Button
              onClick={() =>
                this.setState(state => ({ ...state, _sensorID: "B" }))
              }
            >
              B
            </Button>
          </Container>
        ) : null}

        <Motion
          frequency={50}
          onSpeedChange={this._handleSpeedChange}
        />
      </Fragment>
    ) : null;
  }

//   _adjustPitch = () => {
//     const { height, _sensorID } = this.state;

//     if (_sensorID === "A") {
//       const multipliers = [1.0, 3.6364, 4.0909, 9.0909, 12.7273];

//       const fundemental = this._freqScale(height);
//       this._source.forEach((osc, idx) => {
//         osc.frequency.value = fundemental * multipliers[idx];
//       });
//     } else if (_sensorID === "B") {
//       this._filter.frequency.value = this._freqScale(height);
//     }
//   };

  _adjustAmplitude = () => {
    const { speed } = this.state;

    const value = 1.0 - speed;
    if (value >= 0.05) {
      this._volume.volume.mute = false;
      const value = speed;
      const amplitute = scale(0.0, 1.0, -64, 0.0)(value);
      this._volume.volume.rampTo(amplitute, 0.05);
    } else {
      this._volume.volume.mute = true;
    }

    this._previousSpeed = speed;
  };

//   _audienceHandleHeightChange = ({ id, height }) => {
//     if (id !== this._sensorID) return;

//     this.setState(state => ({ ...state, height }), this._adjustPitch);
//   };

  _audienceHandleSpeedChange = ({ id, speed }) => {
    if (id !== this._sensorID) return;

    this.setState(state => ({ ...state, speed }), this._adjustAmplitude);
  };

//   _handleHeightChange = height => {
//     console.log({ height });
    
//     this.setState(
//       state => ({ ...state, height }),
//       () => {
//         // this._adjustPitch();

//         if (this.props.role === ROLE_PERFORMER) {
//           const { socket } = this.props;
//           const { height, _sensorID } = this.state;

//           const id = _sensorID;
//           if (id === null) return;

//           socket.emit("floek:movement:height", { id, height });
//         }
//       }
//     );
//   };

  _handleSpeedChange = speed => {
    if (isNaN(speed)) speed = 0;

    console.log({ speed });

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
  };
}
