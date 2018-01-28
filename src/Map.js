import React, { Component } from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import uimarantadata from './data/uimarannat'

const LATITUDE_OF_OTANIEMI = 60.1841
const LONGITUDE_OF_OTANIEMI = 24.8301

const originalGeoJson = mockAlgaeAndTemperatureData(uimarantadata)

export default class MapContainer extends Component {
  constructor(props){
    super(props)

    this.state = {
      lat: LATITUDE_OF_OTANIEMI,
      lng: LONGITUDE_OF_OTANIEMI,
      zoom: 15,
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
   return  (
     <div id="mapContainer">
       {this.renderBeachCounter()}
     <Map center={position} zoom={this.state.zoom}>
       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
       {this.renderMarkers()}
     </Map>
       {this.renderControls()}
     </div>
   )
 }

 renderMarkers = () => {
    return this.state.features.map((feature) => {
      const name = feature.properties.UimavesiNi
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
        <input id="algae" type="checkbox" checked={this.state.noAlgae} onChange={this.handleChange('algae')}/>
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
    const features = originalGeoJson.features.filter(f => {
      const { minTemperature, algae } = this.state
      return Math.floor(f.properties.temperature) >= minTemperature && f.properties.algae === algae
    })
   this.setState({
     features
   })
 }
}


function mockAlgaeAndTemperatureData(originalData) {
  const mockData = originalData
  mockData.features.forEach(f => {
    f.properties.temperature = randomNumberBetween(0, 12)
    f.properties.algae = getRandomAlgaeStatus()
  })
  return mockData
}

function randomNumberBetween(start, end) {
    return (Math.random() * (end - start) + start).toFixed(2)
}

function getRandomAlgaeStatus(){
  return Math.random() > 0.9
}
