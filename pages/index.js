import React, { Component, Fragment } from "react";
import Head from "next/head";
import io from "socket.io-client";
import cuid from "cuid";
import storage from "../lib/storage";

let Tone = null;
if (process.browser) {
  Tone = require("tone");
}

const DEVICE_ID = "floek:proxima:device-id";

class Index extends Component {
  state = { sensor: null, event: {}, error: null };
  deviceID = null;
  socket = null;

  proxima = {
    noise: null,
    heartbeat: {
      A: null,
      B: null
    }
  };

  componentDidMount() {
    this.deviceID = getDeviceID();
    this.socket = io();

    if (process.browser && Tone !== null) {
      this.proxima.noise = new Tone.Noise({
        type: "pink",
        volume: 0
      }).toMaster();

      this.proxima.heartbeat.A = new Tone.MonoSynth({
        oscillator: {
          type: "square8"
        },
        envelope: {
          attack: 0.05,
          decay: 0.3,
          sustain: 0.4,
          release: 0.8
        },
        filterEnvelope: {
          attack: 0.001,
          decay: 0.7,
          sustain: 0.1,
          release: 0.8,
          baseFrequency: 300,
          octaves: 4
        }
      }).toMaster();
    }

    this.socket.on("floek:proxima", ({ target, trigger }) => {
      if (target === "noise") {
        if (trigger === "start") {
          this.proxima.noise.start();
        } else if (trigger === "stop") {
          this.proxima.noise.stop();
        }
      }
    });

    this.socket.on("floek:proxima:heartbeat", ({ sensor }) => {
      this.proxima.heartbeat[sensor].triggerAttackRelease("C4", "8n");
    });
  }

  componentWillUnmount() {
    this.socket.close();
  }

  render() {
    const { sensor, event, error } = this.state;

    return (
      <Fragment>
        <Head>
          <title>proxima</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <div>
          <h1>Proxima</h1>
          <h2>{JSON.stringify(event)}</h2>
          <h2>
            {JSON.stringify(new Date())}
            {JSON.stringify(sensor)}
          </h2>
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
