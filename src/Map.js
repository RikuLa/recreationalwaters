import React, { Component } from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import uimarantadata from './data/uimarannat'

const LATITUDE_OF_OTANIEMI = 60.1841
const LONGITUDE_OF_OTANIEMI = 24.8301

export default class MapContainer extends Component {
  constructor(props){
    super(props)

    this.state = {
      lat: LATITUDE_OF_OTANIEMI,
      lng: LONGITUDE_OF_OTANIEMI,
      zoom: 15,
      geoJson: uimarantadata,
      maxNameLength: 10
    }
  }

 render () {
   const position = [this.state.lat, this.state.lng]
   return  (
     <div id="mapContainer">
     <Map center={position} zoom={this.state.zoom}>
       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
       {this.renderMarkers()}
     </Map>
       {this.renderControls()}
     </div>
   )
 }

 renderMarkers = () => {
    const filteredMarkers = this.state.geoJson.features.filter(f => f.properties.UimavesiNi.length < this.state.maxNameLength)
    return filteredMarkers.map((feature) => {
      const name = feature.properties.UimavesiNi
      const coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
      return (
        <Marker key={feature.geometry.coordinates.join(';')} position={coordinates}>
          <Popup>
            <span>
               Name: {name}
            </span>
          </Popup>
        </Marker>
      )
    })
 }

 renderControls(){
    return (
      <div className="controlsContainer">
      <input type="number" value={this.state.maxNameLength} onChange={this.handleChange} min={0} max={50}/>
    </div>
    )
  }

 handleChange = (e) => {
    this.setState({
      maxNameLength: e.target.value
    })
 }
}
