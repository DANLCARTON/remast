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

const QUERY_CREATE_POST = gql`
    mutation (
        $latitude : Float!
        $longitude : Float!
        $content : String!
    ) {
        createPost (
            data: {
                latitude: $latitude,
                longitude: $longitude,
                content: $content
            }
        ) {
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
`

const QUERY_UPDATE_POSTLIST = gql`
    mutation (
        $id : ID!
        $posts : [ID]!
    ) {
        updatePostlist (
            id: $id
            data: {
                posts: $posts
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

    const [latitude, setLatitude] = useState(0)
    const [longitude, setLongitude] = useState(0)

    const {loading, error, data : postlist} = useQuery(QUERY_GET_POSTLIST, {
        variables: {
            id: id
        }
    })

    const posts = postlist?.postlist?.data?.attributes?.posts

    const [createPostlist] = useMutation(QUERY_CREATE_POSTLIST)
    const [createPost] = useMutation(QUERY_CREATE_POST)
    const [updatePostlist] = useMutation(QUERY_UPDATE_POSTLIST)

    useEffect(() => {
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11"
        })
    }, [])

    useEffect(() => {
        map.current.on("move", () => {
            const {lng, lat} = map.current.getCenter()
            setLatitude(lat)
            setLongitude(lng)
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

    const handleSumbit = (e) => {
        e.preventDefault()
        createPost({
            variables: {
                latitude: latitude,
                longitude: longitude,
                content: e.target.content.value
            }
        }).then(data => {
            const updatedPosts = [...posts.data, data.data.createPost.data]
            const updatedPostsIds = []
            updatedPosts.map(post => updatedPostsIds.push(parseInt(post.id)))
            updatePostlist({
                variables: {
                    id: id,
                    posts: updatedPostsIds
                }
            })
        })
    }

    return <div className="Map">
        <div id="form">
            <form onSubmit={(e) => handleSumbit(e)}>
                <p>{latitude} • {longitude}</p>
                <textarea name="content" cols="30" rows="10"></textarea>
                <input type="submit" value="poster ici" />
            </form>
        </div>
        <div ref={mapContainer} className="map-container " id="map" />
    </div>
}

export default Map