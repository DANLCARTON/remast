import {useEffect, useRef, useState} from "react"
import mapboxgl from "mapbox-gl"
import { useQuery, gql, useMutation } from "@apollo/client"
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

const QUERY_CREATE_POSTLIST = gql`
    mutation {
        createPostlist (
            data: {
                posts: []
            }
        ) {
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

    const params = new URLSearchParams(window.location.search)
    const [id, setId] = useState(params.get("id"))

    const {loading, error, data : postlist} = useQuery(QUERY_GET_POSTLIST, {
        variables: {
            id: id
        }
    })

    const posts = postlist?.postlist?.data?.attributes?.posts

    const [createPostlist] = useMutation(QUERY_CREATE_POSTLIST)

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

    useEffect(() => {
        if (!loading && !postlist && map.current) {
            createPostlist().then(data => {
                window.location.href = "/?id="+data.data.createPostlist.data.id
            })
        }
    }, [loading, postlist])

    return <div ref={mapContainer} id="map" />
}

export default Map