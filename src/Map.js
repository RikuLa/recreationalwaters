import React, { Component } from 'react'
import { Map, TileLayer, Marker, Popup, WMSTileLayer } from 'react-leaflet'
import { sortBy } from 'lodash'
import L from 'leaflet'
import poi1 from './Poi1.png'

const LATITUDE_OF_CURRENT_LOCATION = 60.1782223
const LONGITUDE_OF_CURRENT_LOCATION = 24.9141994

const MUIKKU_URL = 'http://paikkatieto.ymparisto.fi/arcgis/services/INSPIRE/SYKE_LajienLevinneisyys1/MapServer/WmsServer'

const SYVYYS_URL = 'http://paikkatieto.ymparisto.fi/ArcGIS/services/INSPIRE/SYKE_Korkeus/MapServer/WMSServer'


const LEVA_MAP = {
  0: 'No Algae',
  1: 'Some Algae',
  2: 'Lot Of Algae',
  3: 'Very much Algae'
}

export default class MapContainer extends Component {
  constructor(props){
    super(props)

    this.state = {
      currentLat: LATITUDE_OF_CURRENT_LOCATION,
      currentLng: LONGITUDE_OF_CURRENT_LOCATION,
      zoom: 12,
      features: null,
      bestThreeBeaches: null,
      minTemperature: 10,
      minVisibility: 3,
      algae: 0,
      amountOfValidBeaches: 0,
      originalFeatures: null
    }
  }

  componentWillMount(){
    this.fetchGeoJson()
  }

 render () {
   const position = [this.state.currentLat, this.state.currentLng]
   const currentPosIcon = L.icon({
     iconUrl: 'http://www.clipartpanda.com/clipart_images/location-icon-195x300-38755946/download',
     iconSize: [30, 45]
   })
   return  (
     <div id="mapContainer">
       {this.renderBeachCounter()}
       {this.renderBestThreeBeaches()}
     <Map center={position} zoom={this.state.zoom}>
       <TileLayer url='http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'/>
       <Marker position={[LATITUDE_OF_CURRENT_LOCATION, LONGITUDE_OF_CURRENT_LOCATION]} icon={currentPosIcon}/>
       {this.renderMarkers()}
       {this.renderMuikkus()}
     </Map>
       {this.renderControls()}
     </div>
   )
 }

 renderBestThreeBeaches(){
    if(this.state.bestThreeBeaches){
      const bestThree = this.state.bestThreeBeaches.map(f => {
        return <li key={f.properties.uimavesini}>{f.properties.uimavesini}
        <button onClick={this.zoomTo(f.geometry.coordinates)}>Move To!</button>
        </li>
      })
      return <div className={"bestThreeList"}>
        <div className="threeHeader">Best three choices:</div>
        <ul>
          {bestThree}
        </ul>
      </div>
    }
 }

 zoomTo = (coords) => {
    return () => {
      this.setState({
        currentLat: coords[1],
        currentLng: coords[0],
        zoom: 14
      })
    }
 }

 renderMuikkus(){
    if(this.state.muikkusVisible){
      return [
        <WMSTileLayer key={MUIKKU_URL} url={MUIKKU_URL} crs={L.CRS.EPSG4326} format={'image/png'} layers={'Muikku_esiintymat'} transparent={true}/>,
      <WMSTileLayer key={SYVYYS_URL} url={SYVYYS_URL} layers={'Syvyysalue'} crs={L.CRS.EPSG4326} format={'image/png'} transparent={true}/>
      ]
    }
 }

 renderMarkers = () => {
    if(this.state.features){
      return this.state.features.map((feature) => {
        const name = feature.properties.uimavesini
        const { lampo, leva, nako } = feature.properties
        const coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
        const currentPosIcon = L.icon({
          iconUrl: poi1,
          iconSize: [30, 35]
        })
        const routelink = "https://www.google.fi/maps/dir/" +
          LATITUDE_OF_CURRENT_LOCATION + "," + LONGITUDE_OF_CURRENT_LOCATION + "/" +
          coordinates[0] + "," + coordinates[1]
        return (
          <Marker key={feature.geometry.coordinates.join(';')} position={coordinates} icon={currentPosIcon}>
            <Popup>
            <span>
              Name: {name}<br/>
              Temp: {lampo} C<br/>
              Visibility: {nako} m<br/>
              Algae: {LEVA_MAP[leva]}<br/>
              <a target="_blank" href={routelink}>Directions</a>
            </span>
            </Popup>
          </Marker>
        )
      })
    }
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
        <span>Max algae: </span>
        <input id="algae" type="number" value={this.state.algae} onChange={this.handleChange('algae')} min={0} max={3}/>
        <span>Min visibility: </span>
        <input type="number" value={this.state.minVisibility} onChange={this.handleChange('minVisibility')} min={0} max={50}/>
        <button onClick={this.toggleMuikkus}>Toggle Muikkus</button>
    </div>
    )
  }

  toggleMuikkus = () => {
    this.setState({
      muikkusVisible: !this.state.muikkusVisible
    })
  }

 handleChange = (propertyToUpdate) => {
    return e => {
      this.setState({
        [propertyToUpdate]: e.target.value
      })
    }
 }

 componentDidUpdate(prevProps, prevState){
    const { minTemperature, algae, minVisibility } = this.state
    if(minTemperature !== prevState.minTemperature || algae !== prevState.algae || minVisibility !== prevState.minVisibility) {
      this.updateValidBeaches()
    }
 }

 updateValidBeaches() {
   const { minTemperature, algae, minVisibility } = this.state
    const features = this.state.originalFeatures.filter(f => {
      return f.properties.lampo >= minTemperature && f.properties.leva <= algae && f.properties.nako >= minVisibility
    })

    const bestThreeBeaches = features.slice(0,3)
    this.setState({
      features,
      bestThreeBeaches
    })
 }

 async fetchGeoJson(){
    const url = 'http://ongisline.7f.fi:8080/geoserver/wfs'

   let defaultParameters = {
     service: 'WFS',
     request: 'GetFeature',
     typeName: 'waterhackathon:swimmingsites',
     outputFormat: 'application/json',
     srsName:'EPSG:4326'
   }

   const paramString = L.Util.getParamString(defaultParameters)

   const response = await fetch(url + paramString)

   const result = await response.json()

   const features = addDistance(result)

   this.setState({
     originalFeatures: features
   }, this.updateValidBeaches)
 }
}

function addDistance(originalData) {
  const mockData = originalData.features
  mockData.forEach(f => {
    f.properties.distance = calculateDistanceToCurrentLocation(f)
  })
  return sortBy(mockData, [function(f) { return f.properties.distance }])
}

function calculateDistanceToCurrentLocation(feature) {
  const currentLatitude = LATITUDE_OF_CURRENT_LOCATION
  const currentLongitude = LONGITUDE_OF_CURRENT_LOCATION
  const latitudeDifference = (currentLatitude - feature.geometry.coordinates[1])
  const longitudeDifference = (currentLongitude - feature.geometry.coordinates[0])
  return Math.sqrt(Math.pow(latitudeDifference,2) + Math.pow(longitudeDifference,2))
}
