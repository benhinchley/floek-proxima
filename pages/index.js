import React, { Component, Fragment } from "react";
import Head from "next/head";
import io from "socket.io-client";
import cuid from "cuid";
import storage from "../lib/storage";

import { Proxima } from "../proxima";
import { ROLE_AUDIENCE } from "../proxima/constants";

const DEVICE_ID = "floek:proxima:device-id";

class Index extends Component {
  state = { socket: null };
  deviceID = null;

  componentDidMount() {
    this.deviceID = getDeviceID();
    this.setState(state => ({ ...state, socket: io() }));
  }

  componentWillUnmount() {
    if (this.state.socket !== null) {
      this.state.socket.close();
    }
  }

  render() {
    if (this.state.socket === null) return null;

    return (
      <Fragment>
        <Head>
          <title>proxima :: audience</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <div>
          <h1>Proxima :: Audience</h1>
          <Proxima role={ROLE_AUDIENCE} socket={this.state.socket} />
        </div>
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

export default Index;
