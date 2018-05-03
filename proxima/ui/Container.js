import styled, { css } from "styled-components";

import { Button } from "./Button";

const position = css`
  ${({ position }) => (position && position.top ? `top: ${position.top}` : "")};
  ${({ position }) =>
    position && position.bottom ? `bottom: ${position.bottom}` : ""};
  ${({ position }) =>
    position && position.left ? `left: ${position.left}` : ""};
  ${({ position }) =>
    position && position.right ? `right: ${position.right}` : ""};
`;

export const AbsoluteContainer = styled.div`
  position: absolute;
  ${props => position};
`;

export const Container = styled.div`
  display: flex;
  justify-content: space-between;

  ${({ direction }) => (direction ? `flex-direction: ${direction}` : "")};
`;
