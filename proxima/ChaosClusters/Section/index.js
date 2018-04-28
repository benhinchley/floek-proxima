import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import { Sequence } from "../Sequence";

// Section represents a set of sequences
export class Section extends Component {
  static propTypes = {
    sequences: PropTypes.arrayOf(PropTypes.object).isRequired,
    children: PropTypes.node
  };

  state = { sequence: 0 };

  render() {
    const { sequences, children } = this.props;
    const { sequence } = this.state;

    const {
      voices,
      tempo,
      frequencies,
      noteDuration,
      gain,
      repeat,
      loopAfterRepeats
    } = sequences[sequence];

    if (voices === undefined) return null;

    return (
      <Fragment>
        <Sequence
          voices={voices}
          tempo={tempo}
          frequencies={frequencies}
          noteDuration={noteDuration}
          gain={gain}
          repeat={repeat}
          loopAfterRepeats={
            loopAfterRepeats === undefined ? false : loopAfterRepeats
          }
          next={() =>
            this.setState(
              state => ({
                ...state,
                sequence: (state.sequence += 1)
              }),
              () => {
                const { sequences, onDone } = this.props;
                const { sequence } = this.state;

                if (sequence === sequences.length - 1) onDone();
              }
            )
          }
        />
        {children}
      </Fragment>
    );
  }
}
