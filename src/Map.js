import React, { Component } from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import uimarantadata from './data/uimarannat'
import { minBy, sortBy } from 'lodash'
import L from 'leaflet'

const LATITUDE_OF_OTANIEMI = 60.2143699
const LONGITUDE_OF_OTANIEMI = 24.8805753

const originalGeoJson = mockAlgaeAndTemperatureData(uimarantadata)

export default class MapContainer extends Component {
  constructor(props){
    super(props)

    this.state = {
      lat: LATITUDE_OF_OTANIEMI,
      lng: LONGITUDE_OF_OTANIEMI,
      zoom: 12,
      features: null,
      minTemperature: 10,
      algae: false,
      amountOfValidBeaches: 0
    }
  }

  componentWillMount(){
    this.updateValidBeaches()
  }

 render () {
   const position = [this.state.lat, this.state.lng]
   const currentPosIcon = L.icon({
     iconUrl: 'http://www.clipartpanda.com/clipart_images/location-icon-195x300-38755946/download',
     iconSize: [30, 45]
   })
   return  (
     <div id="mapContainer">
       {this.renderBeachCounter()}
     <Map center={position} zoom={this.state.zoom}>
       <TileLayer url='http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'/>
       <Marker position={position} icon={currentPosIcon}/>
       {this.renderMarkers()}
     </Map>
       {this.renderControls()}
     </div>
   )
 }

 renderMarkers = () => {
    return this.state.features.map((feature) => {
      const name = feature.properties.uimavesini
      const { temperature, algae } = feature.properties
      const coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
      return (
        <Marker key={feature.geometry.coordinates.join(';')} position={coordinates}>
          <Popup>
            <span>
              Name: {name}<br/>
              Temp: {temperature}<br/>
              Algae: {algae.toString()}
            </span>
          </Popup>
        </Marker>
      )
    })
 }


 renderBeachCounter(){
    if(this.state.features){
      return <div id="beachCounter">Beaches: {this.state.features.length}</div>
    }
 }

 renderControls(){
    return (
      <div className="controlsContainer">
        <span>Min temp: </span>
        <input type="number" value={this.state.minTemperature} onChange={this.handleChange('minTemperature')} min={0} max={50}/>
        <input id="algae" type="checkbox" checked={this.state.algae} onChange={this.handleChange('algae')}/>
        <label htmlFor="algae"> Algae</label>
    </div>
    )
  }

 handleChange = (propertyToUpdate) => {
    return e => {
      let value = e.target.value
      if(propertyToUpdate === 'algae'){
        value = !this.state.algae
      }
      this.setState({
        [propertyToUpdate]: value
      })
    }
 }

 componentDidUpdate(prevProps, prevState){
    const { minTemperature, algae } = this.state
    if(minTemperature !== prevState.minTemperature || algae !== prevState.algae){
      this.updateValidBeaches()
    }
 }

 updateValidBeaches() {
    const features = originalGeoJson.filter(f => {
      const { minTemperature, algae } = this.state
      return Math.floor(f.properties.temperature) >= minTemperature && f.properties.algae === algae
    })
   this.setState({
     features
   })
 }
}

function mockAlgaeAndTemperatureData(originalData) {
  const mockData = originalData.features
  mockData.forEach(f => {
    f.properties.temperature = randomNumberBetween(4, 18)
    f.properties.algae = getRandomAlgaeStatus()
    f.properties.distance = calculateDistanceToCurrentLocation(f)
  })
  return sortBy(mockData, [function(f) { return f.properties.distance }])
}

function randomNumberBetween(start, end) {
    return (Math.random() * (end - start) + start).toFixed(2)
}

function getRandomAlgaeStatus(){
  return Math.random() > 0.9
}

function calculateDistanceToCurrentLocation(feature) {
  const currentLatitude = LATITUDE_OF_OTANIEMI
  const currentLongitude = LONGITUDE_OF_OTANIEMI
  const latitudeDifference = (currentLatitude - feature.geometry.coordinates[1])
  const longitudeDifference = (currentLongitude - feature.geometry.coordinates[0])
  return Math.sqrt(Math.pow(latitudeDifference,2) + Math.pow(longitudeDifference,2))
}
