import React, { Component } from "react";
import PropTypes from "prop-types";

import { round, max, scale, isWithin, unNegative } from "../../utils";

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

  _speedScale = scale(0.5, speedUpperBounds, 0.0, 1.0);
  _heightScale = scale(0, 1.8, 0.0, 1.0);

  componentDidMount() {
    const { frequency } = this.props;

    if ("Accelerometer" in window) {
      this._accelerometer = new window.Accelerometer({
        frequency,
        referenceFrame: "screen"
      });

      this._accelerometer.addEventListener("reading", this._handleReading);
      this._accelerometer.start();
    }

    if (this._accelerometer === null) {
      console.error(
        "Accelerometer not found in window object, falling back to devicemotion api."
      );

      window.addEventListener(
        "devicemotion",
        this._handleDeviceMotionEvent,
        true
      );
    }
  }

  componentWillUnmount() {
    if (this._accelerometer === null) {
      window.removeEventListener("devicemotion", this._handleDeviceMotionEvent);
      return;
    }
    this._accelerometer.removeEventListener("reading", this._handleReading);
  }

  _handleReading = () => {
    const {
      frequency,
      onHeightChange,
      onSpeedChange,
      onDirectionChange
    } = this.props;

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

    const maxSpeed = isWithin(max([unNegative(x), unNegative(z)]), 9.5, 10.1)
      ? 0
      : max([unNegative(x), unNegative(z)]);
    const scaledSpeed = this._speedScale(maxSpeed);
    const roundedSpeed = round(scaledSpeed, 4);
    
    console.log({maxSpeed, roundedSpeed})

    onSpeedChange(roundedSpeed);
    onHeightChange(
      this._computeHeight(unNegative(y), 1 / frequency * 1000, direction)
    );
    onDirectionChange(direction);
  };

  _computeDirection = change => {
    const direction = {
      x: null,
      y: null,
      z: null
    };

    if (Math.sign(change.x) === 1) {
      direction.x = "LEFT";
    } else if (Math.sign(change.x) === -1) {
      direction.x = "RIGHT";
    }

    if (Math.sign(change.y) === 1) {
      direction.y = "UP";
    } else if (Math.sign(change.y) === -1) {
      direction.y = "DOWN";
    }

    if (Math.sign(change.z) === 1) {
      direction.z = "FORWARD";
    } else if (Math.sign(change.z) === -1) {
      direction.z = "BACKWARD";
    }

    return direction;
  };

  _computeHeight = (value, cycle, direction) => {
    // remove gravity from the equation
    const cmPerMs = isWithin(value, 9.5, 10.1) ? 0 : value / 10;
    const cmChange = unNegative(cmPerMs * cycle);

    if (direction.y === "UP") {
      this._height += cmChange;
    } else if (direction.y === "DOWN") {
      this._height -= cmChange;
    }

    return this._heightScale(this._height);
  };

  _handleDeviceMotionEvent = ({
    accelerationIncludingGravity: acceleration,
    interval: cycle
  }) => {
    const { onHeightChange, onSpeedChange, onDirectionChange } = this.props;

    const [x, y, z] = [
      round(acceleration.x),
      round(acceleration.y),
      round(acceleration.z)
    ];

    // z and y axis are flipped due to difference in how the apis work
    const change = {
      x: x != 0 ? round(history[0] - x) : 0, // LEFT, RIGHT
      y: x != 0 ? round(history[1] - z) : 0, // UP, DOWN
      z: x != 0 ? round(history[2] - y) : 0 // FORWARDS, BACKWARDS
    };
    const direction = this._computeDirection(change);

    const maxSpeed = isWithin(max([unNegative(x), unNegative(y)]), 9.5, 10.1)
      ? 0
      : max([unNegative(x), unNegative(y)]);
    const scaledSpeed = this._speedScale(maxSpeed);
    const roundedSpeed = round(scaledSpeed, 4);

    onSpeedChange(roundedSpeed);
    onHeightChange(this._computeHeight(unNegative(z), cycle, direction));
    onDirectionChange(direction);
  };

  render() {
    return null;
  }
}
