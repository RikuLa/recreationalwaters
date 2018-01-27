import React, { Component } from 'react'
import 'leaflet/dist/leaflet.css'
import leaflet from 'leaflet'
import { Map, TileLayer, GeoJSON } from 'react-leaflet'

const LATITUDE_OF_OTANIEMI = 60.1841
const LONGITUDE_OF_OTANIEMI = 24.8301

export default class MapContainer extends Component {
  constructor(props){
    super(props)

    this.state = {
      lat: LATITUDE_OF_OTANIEMI,
      lng: LONGITUDE_OF_OTANIEMI,
      zoom: 5,
      geoJson: null
    }
  }

 render () {
   const position = [this.state.lat, this.state.lng]
   return  (
     <Map center={position} zoom={this.state.zoom}>
       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
       {this.renderGeoJsonLayer()}
     </Map>
   )
 }

 renderGeoJsonLayer(){
    if(this.state.geoJson){
      return <GeoJSON data={this.state.geoJson}/>
    }
 }

 componentDidMount(){
    this.getWfsData()
 }

 async getWfsData() {
    let rootUrl = 'http://geo.stat.fi:8080/geoserver/wfs'

   let defaultParameters = {
     service: 'WFS',
     request: 'GetFeature',
     typeName: 'postialue:pno',
     outputFormat: 'application/json',
     srsName:'EPSG:4326'
   }

   const paramString = leaflet.Util.getParamString(defaultParameters)

   const response = await fetch(rootUrl + paramString)

   const result = await response.json()

   this.saveMultipolygons(result)
 }

 saveMultipolygons(geoJson){
    this.setState({
      geoJson
    })
 }
}
