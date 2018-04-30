import React, { Component } from "react";
import PropTypes from "prop-types";
import { Sequence } from "../Sequence";

export class Super extends Component {
  static propTypes = {
    tempos: PropTypes.arrayOf(PropTypes.number),
    noteDurations: PropTypes.arrayOf(PropTypes.number),
    frequency: PropTypes.number,
    gain: PropTypes.number,
    repeat: PropTypes.number,
    loopAfterRepeats: PropTypes.bool,
    onSectionEnd: PropTypes.func
  };

  static defaultProps = {};

  state = { sequence: 0, repeats: 0 };

  componentDidMount() {
    this.props.onSectionEnd();
  }

  render() {
    const {
      tempos,
      noteDurations,
      frequency,
      gain,
      repeat
      //   onSectionEnd
    } = this.props;
    const { sequence } = this.state;

    const [tempo, noteDuration] = [tempos[sequence], noteDurations[sequence]];

    // if (this.state.repeats >= repeat) onSectionEnd();

    return (
      <Sequence
        voices={1}
        tempo={tempo}
        frequencies={[frequency]}
        noteDuration={noteDuration}
        gain={gain}
        repeat={0}
        loopAfterRepeats={false}
        next={() =>
          this.setState(
            state => ({
              ...state,
              sequence: (state.sequence += 1)
            }),
            () => {
              const { tempos } = this.props;
              const { sequence } = this.state;

              if (sequence === tempos.length - 1) {
                this.setState(state => ({
                  ...state,
                  sequence: 0,
                  repeats: (state.repeats += 1)
                }));
              }
            }
          )
        }
      />
    );
  }
}
