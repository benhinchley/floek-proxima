import React, { Component, Fragment } from "react";
import Head from "next/head";
import io from "socket.io-client";
import cuid from "cuid";
import storage from "../lib/storage";

import { Proxima } from "../proxima";
import { ROLE_PERFORMER } from "../proxima/constants";

const DEVICE_ID = "floek:proxima:device-id";

class Performer extends Component {
  state = { socket: null };
  deviceID = null;

  componentDidMount() {
    this.deviceID = getDeviceID();
    this.setState(state => ({ ...state, socket: io() }));
  }

  componentWillUnmount() {
    this.state.socket.close();
  }

  render() {
    if (this.state.socket === null) return null;

    return (
      <Fragment>
        <Head>
          <title>proxima :: performer</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <Proxima role={ROLE_PERFORMER} socket={this.state.socket} />
      </Fragment>
    );
  }
}

const getDeviceID = () => {
  let deviceID = storage.getItem(DEVICE_ID);
  if (deviceID === undefined || deviceID === null) {
    let deviceID = cuid();
    storage.setItem(DEVICE_ID, deviceID);
    return deviceID;
  }
  return deviceID;
};

export default Performer;
