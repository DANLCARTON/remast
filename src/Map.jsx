import {useEffect, useRef} from "react"
import mapboxgl from "mapbox-gl"

import "./map.css"
import "./mapbox-gl.css"

mapboxgl.accessToken = // votre access token

const Map = () => {
    const mapContainer = useRef(null)
    const map = useRef(null)

    useEffect(() => {
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11"
        })
        new mapboxgl.Marker()
            .setLngLat([0, 0])
            .setPopup(new mapboxgl.Popup().setHTML("<p>Lorem Ipsum</p>"))
            .addTo(map.current)
    }, [])

    return <div ref={mapContainer} id="map" />
}

export default Map