<script lang="ts">
    import {mostRecentElection, type VotingCenterProperties} from "./elections";
    import type {Feature, FeatureCollection, Point} from "geojson";
    import {clusterEach, clusterReduce} from "@turf/clusters";
    import {featureReduce} from "@turf/meta";
    import {distance} from "@turf/distance";
    import {
        CircleLayer,
        FullscreenControl,
        GeoJSON,
        GeolocateControl, LineLayer,
        MapLibre,
        NavigationControl,
        Popup, ScaleControl
    } from "svelte-maplibre";
    import BasemapSwitcherControl from "./lib/BasemapSwitcherControl.svelte";
    import * as maplibregl from "maplibre-gl";
    import crc24 from "crc/crc24";
    import corrections from "./data/corrections.json";
    import {featureCollection, lineString, lineStrings} from "@turf/helpers";
    import bbox from "@turf/bbox";

    const {lat, lng}: { lat: number, lng: number } = $props()

    const latestElection: FeatureCollection<Point, VotingCenterProperties> = (await import(`./data/${mostRecentElection.value}.json`)).default
    latestElection.features.forEach(f => {
        // compute some sort of hash of the zone's PROVINCIA|CANTON|PARROQUIA|ZONA, this uses CRC24 that has 24-bit output
        // then split those 24 bits into 3 bytes and use them as R, G, B
        const crcZoneName = crc24(`${f.properties.PROVINCIA.trim()}|${f.properties.CANTON.trim()}|${f.properties.PARROQUIA.trim()}|${f.properties.ZONA?.trim()}`)
        f.properties["HASH ZONA"] = [(crcZoneName >> 16) % 256, (crcZoneName >> 8) % 256, crcZoneName % 256]

        if (f.properties["CODIGO RECINTO"].toString() in corrections)
            (f.geometry as Point).coordinates = (corrections as Record<string, number[]>)[f.properties["CODIGO RECINTO"]]
    })

    type OptimalZoneInfo = {
        zoneId: string,
        province: string, canton: string, parish: string, zone: string,
        metric: number,
        centers: FeatureCollection<Point, VotingCenterProperties>
    }
    const optimalZone = $derived(lat !== undefined ? clusterReduce(latestElection, "ID ZONA", (prevMin: OptimalZoneInfo, cluster, zoneId) => {
        // compute the RMS sqrt(sum(dist_i)/n) of the distances, this pulls to the nearest-ish average zone but also penalizes zones that are more "spread out" i.e. larger
        const thisZoneMetric = Math.sqrt(1 / cluster.features.length * featureReduce(cluster, (acc, center) => acc + Math.pow(distance([lng, lat], center), 2), 0))
        if (thisZoneMetric < prevMin.metric) {
            return {
                zoneId,
                province: cluster.features[0].properties.PROVINCIA,
                canton: cluster.features[0].properties.CANTON,
                parish: cluster.features[0].properties.PARROQUIA,
                zone: cluster.features[0].properties.ZONA,
                metric: thisZoneMetric, centers: cluster
            }
        } else {
            return prevMin
        }
    }, {metric: Infinity}) as unknown as OptimalZoneInfo : undefined)

    let map = $state<maplibregl.Map>()

    function fitToLayer() {
        if (optimalZone && map && currentUserPosition) {
            const centersBbox = bbox(optimalZone.centers) as [number, number, number, number]

            map!.fitBounds([
                Math.min(centersBbox[0], currentUserPosition.longitude),
                Math.min(centersBbox[1], currentUserPosition.latitude),
                Math.max(centersBbox[2], currentUserPosition.longitude),
                Math.max(centersBbox[3], currentUserPosition.latitude),
            ], {
                padding: 40,
                animate: false,
                maxZoom: 15
            })
        }
    }


    let geolocateControl = $state<maplibregl.GeolocateControl>()
    let currentUserPosition = $state<GeolocationCoordinates>()

    function triggerGeolocate() {
        geolocateControl?.trigger()
    }

    $effect(() => {
        if (!geolocateControl) return;

        geolocateControl.on("geolocate", (e) => {
            currentUserPosition = e.coords
            fitToLayer()
        })

        // HACKITY HACKITY disable the internal _updateCamera function which is called on location updates
        // See https://stackoverflow.com/a/79790651
        geolocateControl._updateCamera = function (position) {
            // do nothing
        }
    })


    const linesToOptimalCenters = $derived(currentUserPosition && optimalZone
        ? featureCollection(optimalZone.centers.features
            .map(center => lineString([center.geometry.coordinates, [currentUserPosition!.longitude, currentUserPosition!.latitude]], {...center.properties}))
            .map(centerLine => ({
                ...centerLine,
                properties: {
                    ...centerLine.properties,
                    distance: distance(centerLine.geometry.coordinates[0], centerLine.geometry.coordinates[centerLine.geometry.coordinates.length - 1])
                }
            })))
        : lineStrings([]))


</script>

<h1>El Optimizador</h1>

{#if optimalZone}
    <p>La zona óptima es {optimalZone.province} > {optimalZone.canton} > {optimalZone.parish} > {optimalZone.zone}</p>

    <MapLibre
            bind:map={map}
            center={[-78.8558726,-1.8128107]}
            zoom={6.5}
            maxZoom={18}
            class="map"
            standardControls={false}
            style={{
          version: 8,
          sources: {},
          layers: [],
        }}
            onload={triggerGeolocate}
            dragRotate={false}
    >
        <NavigationControl showCompass={false}/>
        <GeolocateControl showAccuracyCircle={true} bind:control={geolocateControl}/>
        <FullscreenControl/>
        <ScaleControl/>

        <BasemapSwitcherControl/>

        <GeoJSON data={linesToOptimalCenters}>
            <LineLayer
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    paint={{
                    'line-width': 4,
                    'line-color': '#008800',
                    'line-opacity': 1,
                }}>
            </LineLayer>
        </GeoJSON>

        <GeoJSON id="votingCenters" data={latestElection} promoteId="CODIGO RECINTO">
            <CircleLayer
                    eventsIfTopMost
                    paint={{
            'circle-color': [
                "rgb",
                ["at", 0, ["get", 'HASH ZONA']],
                ["at", 1, ["get", 'HASH ZONA']],
                ["at", 2, ["get", 'HASH ZONA']],
            ],
            'circle-radius': [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 4,
                13, 10,
            ],
            'circle-stroke-width': [
                "interpolate",
                ["linear"],
                ["zoom"],
                12, 0,
                13, 1.5,
            ],
        }}
                    hoverCursor="context-menu">
                <Popup openOn="click" closeButton popupClass="narrow">
                    {#snippet children({data}: { data: Feature<Point, VotingCenterProperties> })}
                        {@const props = data!.properties!}
                        <p>[{props["CODIGO RECINTO"]}] <b>Recinto: {props["NOMBRE RECINTO"]}</b></p>

                        <p>Prov: {props["PROVINCIA"]} > Cant: {props["CANTON"]} > Parr: {props["PARROQUIA"]} >
                            Zona: {props["ZONA"] || "(sin nombre)"}</p>
                        <p>{props["NUM JUNR"]} JRVs, {props["JUN FEM"]}F ({props["JUN INIF"]}F-{props["JUN FINF"]}F)
                            + {props["JUN MAS"]}M ({props["JUN INIM"]}M-{props["JUN FINM"]}M)</p>
                        {#if props["NUMERO ELECTORES"]}<p>Atiende <b>{props["NUMERO ELECTORES"]} votantes</b></p>{/if}
                    {/snippet}
                </Popup>
            </CircleLayer>
        </GeoJSON>
    </MapLibre>
{:else}
    <p>Calculando la zona óptima...</p>
{/if}
