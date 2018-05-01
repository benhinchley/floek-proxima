import React, { Component } from "react";
import PropTypes from "prop-types";

import { round, max, scale, isWithin } from "../../utils";

const NOP = () => {};
const speedUpperBounds = 3.5;

export class Motion extends Component {
  static propTypes = {
    frequency: PropTypes.number,
    onHeightChange: PropTypes.func.isRequired,
    onSpeedChange: PropTypes.func.isRequired,
    onDirectionChange: PropTypes.func.isRequired
  };

  static defaultProps = {
    frequency: 50,
    onHeightChange: NOP,
    onSpeedChange: NOP,
    onDirectionChange: NOP
  };

  _accelerometer = null;
  _history = [0.0, 0.0, 0.0];
  _height = 140.0; // 1.4m in centimeters
  _speedScale = scale(0, speedUpperBounds, 0.0, 1.0);
  _heightScale = scale(0, 1.8, 0.0, 1.0);

  componentDidMount() {
    const { frequency } = this.props;

    if ("Accelerometer" in window) {
      this._accelerometer = new window.Accelerometer({
        frequency,
        referenceFrame: "screen"
      });
    }

    if (this._accelerometer === null) {
      console.error(
        "Accelerometer not found in window object, abandoning all other setup."
      );
      return;
    }

    this._accelerometer.addEventListener("reading", this._handleReading);
    this._accelerometer.start();
  }

  componentWillUnmount() {
    if (this._accelerometer === null) {
      return;
    }
    this._accelerometer.removeEventListener("reading", this._handleReading);
  }

  _handleReading = () => {
    const { onHeightChange, onSpeedChange, onDirectionChange } = this.props;

    const [x, y, z] = [
      round(this._accelerometer.x),
      round(this._accelerometer.y),
      round(this._accelerometer.z)
    ];

    const change = {
      x: x != 0 ? round(history[0] - x) : 0, // LEFT, RIGHT
      y: x != 0 ? round(history[1] - y) : 0, // UP, DOWN
      z: x != 0 ? round(history[2] - z) : 0 // FORWARDS, BACKWARDS
    };
    const direction = this._computeDirection(change);

    const maxSpeed = isWithin(max([x, z]), 9.5, 10.1) ? 0 : max([x, z]);
    const scaledSpeed = this._speedScale(maxSpeed);
    const roundedSpeed = round(scaledSpeed, 4);
    
    console.log({maxSpeed, scaledSpeed, roundedSpeed});
    
    onSpeedChange(roundedSpeed);
    onHeightChange(this._computeHeight(y, direction));
    onDirectionChange(direction);
  };

  _computeDirection = change => {
    const direction = {
      x: null,
      y: null,
      z: null
    };

    if (change.x > 1) {
      direction.x = "LEFT";
    } else if (change.x < -1) {
      direction.x = "RIGHT";
    }

    if (change.y > 1) {
      direction.y = "UP";
    } else if (change.y < -1) {
      direction.y = "DOWN";
    }

    if (change.z > 1) {
      direction.z = "FORWARD";
    } else if (change.z < -1) {
      direction.z = "BACKWARD";
    }

    return direction;
  };

  _computeHeight = (y, direction) => {
    const { frequency } = this.props;
    const cycle = 1 / frequency * 1000;

    // remove gravity from the equation
    const cmPerMs = isWithin(y, 9.5, 10.1) ? 0 : y / 10;
    const cmChange = cmPerMs * cycle;

    if (direction.y === "UP") {
      this._height += cmChange;
    } else if (direction.y === "DOWN") {
      this._height -= cmChange;
    }

    return this._heightScale(this._height);
  };

  render() {
    return null;
  }
}
