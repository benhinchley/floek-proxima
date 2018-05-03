import styled from "styled-components";
import randomColor from "randomcolor";

export const Button = styled.button`
  box-sizing: border-box;

  margin-bottom: 1rem;
  padding: 0.5rem 2rem;

  border: 2px solid #000;
  background: none;

  font-size: 24px;
  font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
    Bitstream Vera Sans Mono, Courier New, monospace, serif;

  &:last-of-type {
    margin-bottom: 0;
  }

  &:active {
    outline: none;
    background-color: ${props => randomColor()};
  }
`;
