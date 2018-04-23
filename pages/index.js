import { Component } from "react";
import Head from "next/head";

import io from "socket.io-client";
import cuid from 'cuid';

import { storage } from "../lib";

const DEVICE_ID = "floek:proxima:device-id";

class Index extends Component {
  state = {enabled: false, distance: 0, event: {}, error: null};
  watchID = null;
  deivceID = null
  
  componentDidMount() {
    this.socket = io();
    
    const deviceID = storage.getItem(DEVICE_ID)
    if (deviceID === undefined || deviceID === null) {
      this.deviceID = cuid();
      storage.setItem(DEVICE_ID, this.deviceID)
    }
    this.deviceID = deviceID;
    
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", this.onDeviceMotionUpdate.bind(this), false)
    } else {
      this.onPositionError("motion not avaliable")
    }
    
  }

  componentWillUnmount() {}

  render() {
    const { enabled, distance, event, error } = this.state;

    return (
      <div>
        <Head>
          <title>proxima</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
      
        { error ? (<div>{JSON.stringify(error)}</div>) : null}
      
        <div>distance: {JSON.stringify(distance)}</div>
        <div>event: {JSON.stringify(new Date())}{JSON.stringify(event)}</div>
      </div>
    );
  }

  onPositionUpdate(position) {
    this.setState(state => ({
      ...state,
      location: {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
      }
    }), () => this.socket.emit("location", {id: this.deviceID, location: this.state.location}));
  }

  onPositionError(error) {
    this.setState(state => ({
      ...state,
      error: error
    }));
  }

  onDeviceMotionUpdate(event) {
    console.log(event);
    this.socket.emit("floek:motion", {id: this.deviceID, data: event })
    this.setState(state => ({...state, event: event }))
  }

}

export default Index;
