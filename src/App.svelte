<script module>
  import * as maplibregl from 'maplibre-gl';
  import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

  maplibregl.setWorkerUrl(maplibreWorkerUrl);
</script>

<script lang="ts">
    import type {GeoJSON as GeoJSONType, Feature, FeatureCollection, Point} from 'geojson';
    import {
        MapLibre,
        NavigationControl, GeolocateControl, FullscreenControl, ScaleControl,
        GeoJSON,
        CircleLayer, FillLayer, LineLayer,
        Popup,
        hoverStateFilter,
    } from 'svelte-maplibre';
    import BasemapSwitcherControl from "./lib/BasemapSwitcherControl.svelte";
    import TimelineRadio from "./lib/TimelineRadio.svelte"

    import {clusterEach, clusterReduce} from "@turf/clusters";

    import {convex} from "@turf/convex";
    import {buffer} from "@turf/buffer";
    import {distance} from "@turf/distance";
    import {featureCollection, lineString} from "@turf/helpers";

    let chosenElection = $state("2027_alcaldes")

    import corrections from './data/corrections.json' with {type: "json"}
    import type {ExpressionFilterSpecification} from "maplibre-gl";

    // NOTE the import(...) below MUST use backticks `path/${filename}.json`, NOT "path/" + filename + ".json" or other forms of creating the import path
    // Vite does some kind of analysis of backtick dynamic imports and rewrites them to an object lookup taking into account all the files that exist in that directory
    // See https://vite.dev/guide/assets#new-url-url-import-meta-url especially the "How it works" accordion in that section
    // NOTE keep the import split into two, $derived(import(...)) and then $derived(await ...), to avoid https://svelte.dev/docs/svelte/runtime-warnings#Client-warnings-await_waterfall
    const rawElectionDataPromise = $derived(import(`./data/${chosenElection}.json`))
    const rawElectionData: FeatureCollection = $derived((await rawElectionDataPromise).default)
    const chosenElectionData = $derived.by(() => {
        rawElectionData.features.forEach(f => {
            if (f.properties!["CODIGO RECINTO"].toString() in corrections)
                (f.geometry as Point).coordinates = (corrections as Record<string, number[]>)[f.properties!["CODIGO RECINTO"]]
        })
        return rawElectionData
    })

    const zonesCollection = $derived.by(() => {
        const zones: Feature[] = []
        clusterEach(chosenElectionData as FeatureCollection, "ID ZONA", function (zone, zoneId) {
            const hull = convex(zone)
            if (hull) {
                if (!hull.properties) hull.properties = {}
                hull.properties["ID ZONA"] = zoneId
                hull.properties["ZONA"] = zone.features[0].properties!["ZONA"]
                zones.push(buffer(hull, 200, {units: 'meters'})!)
            } else if (zone.features.length === 1) { // single point, just buffer it
                zones.push(buffer(zone.features[0], 500, {units: 'meters'})!)
            } else if (zone.features.length === 2) { // 2 points form a line
                zones.push(buffer(lineString(
                    zone.features.map(p => (p.geometry as Point).coordinates),
                    {"ID ZONA": zoneId, "ZONA": zone.features[0].properties!["ZONA"]}
                ), 500, {units: 'meters'})!)
            }
        });
        return featureCollection(zones)
    })

    type ZoneInfo = {
        id: number,
        province: string,
        canton: string,
        parish: string,
        zone: string,
        numCenters: number,
        numStations: number,
        numVoters: number
    }
    const zonesInfo = $derived.by(() => {
        const info: Record<string, ZoneInfo> = {}
        clusterReduce(chosenElectionData as FeatureCollection, "ID ZONA", function (prev: typeof info, zone, zoneId) {
            prev[zoneId] = {
                id: zoneId,
                province: zone.features![0].properties!["PROVINCIA"],
                canton: zone.features[0].properties!["CANTON"],
                parish: zone.features[0].properties!["PARROQUIA"],
                zone: zone.features[0].properties!["ZONA"],
                numCenters: zone.features!.length,
                numStations: zone.features!.reduce((acc, center) => acc + center.properties!["NUM JUNR"], 0),
                numVoters: zone.features!.reduce((acc, center) => acc + center.properties!["NUMERO ELECTORES"], 0)
            }
            return prev
        }, info)
        return info
    })

    let map = $state<maplibregl.Map>()
    let hoveredZone: Feature | undefined = $state();
    const hoveredZoneId = $derived(hoveredZone?.properties?.["ID ZONA"].toString())
    const hoveredZoneCentersFilter: ExpressionFilterSpecification = $derived(hoveredZoneId ? ["==", ["to-string", ["get", "ID ZONA"]], hoveredZoneId] : false)
    const hoveredZoneInfo = $derived(hoveredZoneId ? zonesInfo[hoveredZoneId] : undefined)

    let focusedCenter = $state<Feature>()

    let geolocateControl = $state<maplibregl.GeolocateControl>()
    let currentUserPosition = $state<GeolocationCoordinates>()
    $effect(() => {
        if (!geolocateControl) return;

        geolocateControl.on("geolocate", (e) => {
            currentUserPosition = e.coords
        })

        // HACKITY HACKITY disable the internal _updateCamera function which is called on location updates
        // See https://stackoverflow.com/a/79790651
        geolocateControl._updateCamera = function (position) {
            if (!map) return;
            // ensure that the map contains ALL that it previously contained, and also the user's current pos
            // i.e. it'll never zoom in because it'd no longer display all that it previously did, it'll at most zoom out
            // if necessary (if the user's pos is outside the screen) until that pos is shown
            const x1 = map.getBounds().getWest(), x2 = map.getBounds().getEast(),
                y1 = map.getBounds().getSouth(), y2 = map.getBounds().getNorth();
            const px = position.coords.longitude, py = position.coords.latitude;
            map.fitBounds([
                [Math.min(x1, px), Math.min(y1, py)],
                [Math.max(px, x2), Math.max(py, y2)]
            ], {padding: 20})
        }
    })

    const lineBetweenUserAndCenter = $derived(focusedCenter && currentUserPosition
        ? lineString([
            (focusedCenter.geometry as Point).coordinates,
            [currentUserPosition.longitude, currentUserPosition.latitude]
        ])
        : [])
    const distanceBetweenUserAndCenter = $derived(focusedCenter && currentUserPosition
        ? distance([currentUserPosition.longitude, currentUserPosition.latitude], (focusedCenter.geometry as Point).coordinates)
        : undefined)
    const distanceBetweenUserAndCenterDisplay = $derived(distanceBetweenUserAndCenter
        ? (distanceBetweenUserAndCenter < 1 ? `${(distanceBetweenUserAndCenter * 1000).toFixed()} m` : `${distanceBetweenUserAndCenter.toFixed(1)} km`)
        : undefined)
</script>

<h1>Recintos electorales a través de la historia</h1>

<small>(es decir, a través de los últimos tres años)</small>

<div style="padding-bottom: 20px;">
    <TimelineRadio
            options={[
            {value: "2017_pres", label: "Presidenciales 2017", disabled: true},
            {value: "2019_alcaldes", label: "Alcaldes 2019", disabled: true},
            {value: "2021_pres", label: "Presidenciales 2021"},
            {value: "2023_alcaldes", label: "Alcaldes 2023"},
            {value: "2023_pres", label: "Presidenciales 2023"},
            {value: "2024_consulta", label: "Consulta 2024"},
            {value: "2025_pres", label: "Presidenciales 2025"},
            {value: "2025_consulta", label: "Consulta 2025"},
            {value: "2027_alcaldes", label: "Alcaldes 2027 (2026)"},
        ]}
            color="gray"
            bind:value={chosenElection}
    />
</div>

<MapLibre
        bind:map={map}
        center={[-78.8558726,-1.8128107]}
        zoom={6.5}
        maxZoom={19}
        class="map"
        standardControls={false}
        style={{
          version: 8,
          sources: {},
          layers: [],
        }}
>
    <NavigationControl showCompass={false}/>
    <GeolocateControl showAccuracyCircle={true} bind:control={geolocateControl}/>
    <FullscreenControl/>
    <ScaleControl/>

    <BasemapSwitcherControl/>

    <GeoJSON data={zonesCollection} promoteId="ID ZONA">
        <FillLayer paint={{
            'fill-color': 'red',
            'fill-opacity': hoverStateFilter(0, 0.3),
        }} manageHoverState bind:hovered={hoveredZone}>
            <Popup openOn="hover" closeButton closeOnMove>
                {#snippet children({data}: { data?: Feature })}
                    {@const props = zonesInfo[data!.properties!["ID ZONA"]]}
                    <p><b>Zona: {props.zone ?? "(zona sin nombre)"}</b></p>

                    <p>Prov: {props.province} > Cant: {props.canton} > Parr: {props.parish}</p>
                    <p>{props.numCenters} centros, {props.numStations} JRVs</p>
                    {#if !isNaN(props.numVoters)}<p>Atiende <b>{props.numVoters} votantes</b></p>{/if}
                {/snippet}
            </Popup>
        </FillLayer>

        <LineLayer paint={{
            'line-color': 'red',
            'line-width': hoverStateFilter(1, 2),
        }}/>
    </GeoJSON>

    <!-- line joining the center with its popup open to the user's current geolocation -->
    <GeoJSON data={lineBetweenUserAndCenter}>
        <LineLayer
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                paint={{
                    'line-width': 4,
                    'line-color': '#008800',
                    'line-opacity': 1,
                }}/>
    </GeoJSON>


    <GeoJSON data={chosenElectionData as GeoJSONType} promoteId="CODIGO RECINTO">
        <CircleLayer paint={{
            'circle-color': [
                "case",
                hoveredZoneCentersFilter,
                "red",
                [
                    "rgb",
                    ["%", ["*", ["get", 'ID ZONA'], 25601], 256],
                    ["%", ["*", ["get", 'ID ZONA'], 25621], 256],
                    ["%", ["*", ["get", 'ID ZONA'], 25657], 256],
                ]
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
            <Popup openOn="click" closeButton popupClass="narrow" onclose={() => focusedCenter = undefined}>
                {#snippet children({data}: { data: Feature })}
                    {@const props = data!.properties!}
                    <p>[{props["CODIGO RECINTO"]}] <b>Recinto: {props["NOMBRE RECINTO"]}</b></p>

                    <p>Prov: {props["PROVINCIA"]} > Cant: {props["CANTON"]} > Parr: {props["PARROQUIA"]} >
                        Zona: {props["ZONA"] || "(sin nombre)"}</p>
                    <p>{props["NUM JUNR"]} JRVs, {props["JUN FEM"]}F ({props["JUN INIF"]}F-{props["JUN FINF"]}F)
                        + {props["JUN MAS"]}M ({props["JUN INIM"]}M-{props["JUN FINM"]}M)</p>
                    {#if props["NUMERO ELECTORES"]}<p>Atiende <b>{props["NUMERO ELECTORES"]} votantes</b></p>{/if}

                    <button onclick={() => {
                        focusedCenter = data
                        geolocateControl?.trigger()
                    }} class="flat">Voto aquí
                    </button>
                    {#if distanceBetweenUserAndCenterDisplay !== undefined}
                        {distanceBetweenUserAndCenterDisplay} desde tu ubicación
                    {/if}
                {/snippet}
            </Popup>
        </CircleLayer>
    </GeoJSON>
</MapLibre>

<div class="bottombar">
    Esta página <b>no</b> está asociada con el CNE
    <br>
    <a href="#">Reportar un error</a> / <a href="#">Acerca de</a> / <a href="#">Privacidad</a>
</div>

<style>
    :global(.map) {
        height: 800px;
    }

    div.bottombar {
        padding: 2em;
        text-align: center;
        /*background-color: */
    }

    button.flat {
        border: unset;
        border: 1px solid dodgerblue;
        color: dodgerblue;
        padding: 2px 6px;
        cursor: pointer;
        font-size: 1.2em;
        border-radius: 4px;
        background-color: unset;
    }

    :global(.maplibregl-popup.narrow) {
        max-width: 300px;
    }
</style>
