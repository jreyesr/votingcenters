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
    import {type ParetoFrontier, recordOnFrontier} from "./pareto";

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
        centers: FeatureCollection<Point, VotingCenterProperties>,
        average: number, stddev: number, min: number, max: number,
        vals: number[],
    }

    // noinspection JSVoidFunctionReturnValueUsed
    const optimalZones = $derived(lat !== undefined ? clusterReduce(latestElection, "ID ZONA", (prevMin: ParetoFrontier<OptimalZoneInfo>, cluster, zoneId) => {
        const average = featureReduce(cluster, (acc, center) => acc + distance([lng, lat], center) / cluster.features.length, 0)
        const stddev = Math.sqrt(featureReduce(cluster, (acc, center) => acc + Math.pow(distance([lng, lat], center) - average, 2), 0) / cluster.features.length)

        const zoneToInsert: OptimalZoneInfo = {
            zoneId,
            province: cluster.features[0].properties.PROVINCIA,
            canton: cluster.features[0].properties.CANTON,
            parish: cluster.features[0].properties.PARROQUIA,
            zone: cluster.features[0].properties.ZONA,
            centers: cluster,
            average, stddev, vals: [average, stddev],
            min: featureReduce(cluster, (acc, center) => Math.min(acc, distance([lng, lat], center)), Infinity),
            max: featureReduce(cluster, (acc, center) => Math.max(acc, distance([lng, lat], center)), 0),
        }
        recordOnFrontier(prevMin, zoneToInsert)
        return prevMin
    }, {frontier: [], innerSamples: [], numInnerSamples: 15}) as unknown as ParetoFrontier<OptimalZoneInfo> : undefined)
    let currentlyDisplayedZoneIndex = $state<number>(0)
    const optimalZone = $derived(optimalZones?.frontier.toSorted((a, b) => a.average - b.average)[0])
    const currentlyDisplayedZone = $derived(optimalZones && currentlyDisplayedZoneIndex < optimalZones?.frontier.length ? optimalZones?.frontier[currentlyDisplayedZoneIndex] : optimalZones?.innerSamples[currentlyDisplayedZoneIndex - optimalZones!.frontier.length])

    let map = $state<maplibregl.Map>()

    function fitToLayer() {
        if (currentlyDisplayedZone && map && currentUserPosition) {
            const centersBbox = bbox(currentlyDisplayedZone.centers) as [number, number, number, number]

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
        geolocateControl._updateCamera = function (_position) {
            // do nothing
        }
    })

    const linesToOptimalCenters = $derived(currentUserPosition && currentlyDisplayedZone
        ? featureCollection(currentlyDisplayedZone.centers.features
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
    <p>La zona óptima desde tu ubicación actual es {optimalZone.province} > {optimalZone.canton} > {optimalZone.parish}
        > {optimalZone.zone}
        (en promedio {optimalZone.average.toFixed(2)}±{optimalZone.stddev.toFixed(2)} km de distancia)</p>

    <details>
        <summary>Ver alternativas</summary>

        <ol>
            {#each optimalZones?.frontier as z, i}
                <li>{z.province} > {z.canton} > {z.parish} > {z.zone || "(zona sin nombre)"} ({z.average.toFixed(2)}±{z.stddev.toFixed(2)}
                    km, {z.centers.features.length} centros)
                    {#if i !== currentlyDisplayedZoneIndex}
                        <button class="linkish"
                                onclick={() => {currentlyDisplayedZoneIndex = i}}>
                            Ver
                        </button>
                    {/if}
                </li>
            {/each}
        </ol>
        {#if optimalZones?.frontier.length === 1}
            <p>(esta es la mejor zona tanto en distancia promedio como en dispersión. A continuación algunas otras
                zonas, aunque son peores en ambas dimensiones)
            </p>
        {:else}
            <p>(todas las demás zonas del país son peores que estas, tienen mayor distancia promedio y dispersión
                que alguna de las de arriba. A continuación algunos ejemplos)
            </p>
        {/if}
        <ol start={(optimalZones?.frontier.length ?? 0) + 1}>
            {#each optimalZones?.innerSamples.slice(0, 5) as z, i}
                <li>{z.province} > {z.canton} > {z.parish} > {z.zone || "(zona sin nombre)"} ({z.average.toFixed(2)}±{z.stddev.toFixed(2)}
                    km, {z.centers.features.length} centros)
                    {#if i + optimalZones!.frontier.length !== currentlyDisplayedZoneIndex}
                        <button class="linkish"
                                onclick={() => {currentlyDisplayedZoneIndex = optimalZones!.frontier.length + i}}>
                            Ver
                        </button>
                    {/if}
                </li>
            {/each}
        </ol>
    </details>

    <details>
        <summary>¿Por qué?</summary>

        <ul>
            <li>Porque lo dice El Optimizador&trade;</li>
            <li>La distancia promedio a los centros de la zona {optimalZone.zone || optimalZone.parish} es
                de {optimalZone.average.toFixed(2)} km
                (entre {optimalZone.min.toFixed(1)} km y {optimalZone.max.toFixed(1)} km)
            </li>
            <li>Esta es la mínima distancia promedio entre todas las zonas del país</li>
            <li>Aplica para el proceso electoral {mostRecentElection?.label}, otras elecciones (pasadas y futuras)
                tendrán un conjunto diferente de recintos y por lo tanto podría ser que otra zona sea preferible
            </li>
        </ul>
    </details>

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
                    {#snippet children({data}: { data: Feature<Point, VotingCenterProperties> | undefined })}
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

<style>
    button.linkish {
        background: none;
        border: none;
        font-size: 1em;
        text-decoration: underline;
        color: blue;
        cursor: pointer;
    }
</style>
