import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import _ from "lodash";

import { Sequence } from "../Sequence";

// Section represents a set of sequences
export class Section extends Component {
  static propTypes = {
    sequences: PropTypes.arrayOf(PropTypes.object).isRequired,
    wave: PropTypes.string,
    children: PropTypes.node
  };

  state = { sequence: 0 };

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(prevProps.sequences, this.props.sequences)) {
      this.setState(state => ({ ...state, sequence: 0 }));
    }
  }

  render() {
    const { sequences, children, wave, onSectionEnd } = this.props;
    const { sequence } = this.state;

    let idx = sequence > sequences.length - 1 ? sequences.length - 1 : sequence;

    const seq = sequences[idx];
    if (seq === undefined) return null;

    const {
      voices,
      tempo,
      frequencies,
      noteDuration,
      gain,
      repeat,
      loopAfterRepeats
    } = seq;

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
          loopAfterRepeats={loopAfterRepeats}
          wave={wave}
          next={() =>
            this.setState(
              state => ({
                ...state,
                sequence: (state.sequence += 1)
              }),
              () => {
                const { sequences, onSectionEnd } = this.props;
                const { sequence } = this.state;

                if (sequence === sequences.length - 1) {
                  onSectionEnd();
                }
              }
            )
          }
        />
        {children}
      </Fragment>
    );
  }
}
