import {useEffect, useRef} from "react"
import mapboxgl from "mapbox-gl"
import { useQuery, gql } from "@apollo/client"
import { Converter } from "showdown"

import "./map.css"
import "./mapbox-gl.css"

mapboxgl.accessToken = // votre access token

const QUERY_GET_POSTLIST = gql`
    query ($id : ID!) {
        postlist (id: $id) {
            data {
                id
                attributes {
                    posts {
                        data {
                            id
                            attributes {
                                latitude
                                longitude
                                content
                            }
                        }
                    }
                }
            }
        }
    }
`



const Map = () => {
    const mapContainer = useRef(null)
    const map = useRef(null)

    const {loading, error, data : postlist} = useQuery(QUERY_GET_POSTLIST, {
        variables: {
            id: 1
        }
    })

    const posts = postlist?.postlist?.data?.attributes?.posts

    useEffect(() => {
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11"
        })
    }, [])

    useEffect(() => {
        if (postlist && posts && map.current) {
            posts.data.map(post => {
                let converter = new Converter()
                const html = converter.makeHtml(post.attributes.content)
                new mapboxgl.Marker()
                    .setLngLat([post.attributes.longitude, post.attributes.latitude])
                    .setPopup(new mapboxgl.Popup().setHTML(html))
                    .addTo(map.current)
            })
        }
    }, [posts])

    return <div ref={mapContainer} id="map" />
}

export default Map