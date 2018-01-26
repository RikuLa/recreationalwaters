import React, { Component } from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'

const LATITUDE_OF_OTANIEMI = 60.1841
const LONGITUDE_OF_OTANIEMI = 24.8301

export default class MapContainer extends Component {
  constructor(props){
    super(props)

    this.state = {
      lat: LATITUDE_OF_OTANIEMI,
      lng: LONGITUDE_OF_OTANIEMI,
      zoom: 13,
    }
  }

 render () {
   const position = [this.state.lat, this.state.lng]
   return  (
     <Map center={position} zoom={this.state.zoom}>
       <TileLayer
         attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
       />
       <Marker position={position}>
         <Popup>
            <span>
              Otaniemi :)
            </span>
         </Popup>
       </Marker>
     </Map>
   )
 }
}
