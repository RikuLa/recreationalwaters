import React, { Component } from 'react'
import './App.css'
import MapContainer from './Map'

export default class App extends Component {
  render() {
    return <div id="map">
      <MapContainer/>
    </div>
  }
}
