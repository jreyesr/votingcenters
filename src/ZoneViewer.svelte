<script lang="ts">
    import {
        type ElectionInfo,
        elections,
        type VotingCenterProperties,
        type ZoneInfo,
    } from './elections'
    import type {Feature, FeatureCollection, Point,} from "geojson";
    import {
        CircleLayer,
        FullscreenControl, GeoJSON, GeolocateControl,
        LineLayer,
        MapLibre, NavigationControl, Popup,
        ScaleControl,
    } from "svelte-maplibre";
    import BasemapSwitcherControl from "./lib/BasemapSwitcherControl.svelte";
    import {featureCollection, lineStrings} from "@turf/helpers";
    import * as maplibregl from "maplibre-gl";
    import bbox from "@turf/bbox";

    const activeElections = $derived(elections.filter(e => e.disabled === undefined))

    const {zonePath}: { zonePath: string[] } = $props()

    const zoneName = $derived(zonePath[3] || zonePath[2])

    type HistoricZoneInfo = ZoneInfo & {
        electionDate: string
    }

    let map = $state<maplibregl.Map>()

    async function zoneInfoInElection(election: ElectionInfo, zonePath: string[]): Promise<HistoricZoneInfo> {
        const data = (await import(`./data/${election.value}.json`)).default as FeatureCollection<Point, VotingCenterProperties>
        const thisZoneCenters = data.features.filter(f =>
            f.properties["PROVINCIA"].trim() === zonePath[0]
            && f.properties["CANTON"].trim() === zonePath[1]
            && f.properties["PARROQUIA"].trim() === zonePath[2]
            && (f.properties["ZONA"] ?? "").trim() == zonePath[3])
        return {
            centers: thisZoneCenters,
            id: thisZoneCenters[0]?.properties["ID ZONA"],
            province: zonePath[0],
            canton: zonePath[1],
            parish: zonePath[2],
            zone: zonePath[3],
            numCenters: thisZoneCenters.length,
            numVoters: thisZoneCenters.reduce((acc, c) => acc + (c.properties["NUMERO ELECTORES"] ?? 0), 0),
            numStations: thisZoneCenters.reduce((acc, c) => acc + c.properties["NUM JUNR"], 0),
            electionDate: election.date!
        }
    }

    const zoneInfoAcrossElectionsPromise = $derived(Promise.all(activeElections.map(e => zoneInfoInElection(e, zonePath))))
    const zoneInfoAcrossElections = $derived(Object.fromEntries(
        (await zoneInfoAcrossElectionsPromise).map((zoneCenters, i) => ([activeElections[i].value, zoneCenters]))))
    const firstAppearanceKey = $derived(Object.entries(zoneInfoAcrossElections).find(([_, e]) => e.numCenters > 0)![0])
    const firstAppearance = $derived(elections.find(e => e.value === firstAppearanceKey)!)
    const lastActiveCenters = $derived(featureCollection(Object.values(zoneInfoAcrossElections).findLast(e => e.numCenters > 0)!.centers!))

    function fitToLayer(e: maplibregl.MapSourceDataEvent | maplibregl.MapStyleDataEvent) {
        if (e.dataType === "style" || e.sourceDataType !== "content" || e.sourceId !== "votingCenters") return
        const sourceData = (e.source as maplibregl.GeoJSONSourceSpecification).data as typeof lastActiveCenters
        if (sourceData.features.length > 0) {
            map!.fitBounds(bbox(sourceData) as [number, number, number, number], {
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
        })

        // HACKITY HACKITY disable the internal _updateCamera function which is called on location updates
        // See https://stackoverflow.com/a/79790651
        geolocateControl._updateCamera = function (position) {
            // do nothing
        }
    })

    const linesToAllCenters = $derived(currentUserPosition && lastActiveCenters
        ? lineStrings(lastActiveCenters.features.map(center => ([center.geometry.coordinates, [currentUserPosition!.longitude, currentUserPosition!.latitude]])))
        : lineStrings([]))
</script>

<svg style="float:right; z-index: 2000; margin-right: 100px; max-width:200px; overflow: visible;"
     viewBox="80 80 240 240"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink">
    <path id="circleLeft" fill="none" stroke="none"
          d="M 200,200 m 90, 0 a 90,90 0 1,0 -180,0 a 90,90 0 1,0 180,0"></path>
    <path id="circleRight" fill="none" stroke="none"
          d="M 200,200 m 75, 0 a 75,75 0 1,1 -150,0 a 75,75 0 1,1 150,0"></path>
    <circle r="98" cx="200" cy="200" stroke="darkgoldenrod" fill="goldenrod" stroke-width="2"></circle>
    <g
            id="stars"
            transform="matrix(3,0,0,3, 215, 150)">
        <path
                style="fill:black;stroke:black;stroke-width:5"
                id="path1"
                d="M 79.7393,78.583657 56.077412,74.857191 39.593354,92.236698 35.825508,68.581365 14.202761,58.274656 35.535992,47.381322 38.656458,23.631919 55.608965,40.554802 79.160266,36.183572 68.304261,57.535823 Z"
                transform="matrix(0,0.07649769,-0.07649769, 0, 0, 0)"/>
        <path
                style="fill:black;stroke:black;stroke-width:5"
                id="path1"
                d="M 79.7393,78.583657 56.077412,74.857191 39.593354,92.236698 35.825508,68.581365 14.202761,58.274656 35.535992,47.381322 38.656458,23.631919 55.608965,40.554802 79.160266,36.183572 68.304261,57.535823 Z"
                transform="matrix(0,0.07649769,-0.07649769,0, -8, 3)"/>
        <path
                style="fill:black;stroke:black;stroke-width:5"
                id="path1"
                d="M 79.7393,78.583657 56.077412,74.857191 39.593354,92.236698 35.825508,68.581365 14.202761,58.274656 35.535992,47.381322 38.656458,23.631919 55.608965,40.554802 79.160266,36.183572 68.304261,57.535823 Z"
                transform="matrix(0,0.07649769,-0.07649769,0, 8, 3)"/>
    </g>

    <text font-size="28" x="200" y="200" text-anchor="middle" alignment-baseline="text-before-edge"
          font-weight="bold">{zoneName}</text>

    <text font-size="23" fill="#000000" letter-spacing="-1" word-spacing="3" font-family="sans-serif"
          text-anchor="middle">
        <textPath xlink:href="#circleRight" startOffset="353">ZONA ELECTORAL</textPath>
    </text>
    <text font-size="23" fill="#000000" letter-spacing="2" font-family="sans-serif" text-anchor="middle">
        <textPath xlink:href="#circleLeft" startOffset="424">EST. {firstAppearance.date!.split("-")[0]}</textPath>
    </text>
</svg>

<h1>La zona {zoneName} a través de la historia</h1>

<p>Provincia: {Object.values(zoneInfoAcrossElections)[0].province} >
    Cantón: {Object.values(zoneInfoAcrossElections)[0].canton} >
    Parroquia: {Object.values(zoneInfoAcrossElections)[0].parish}</p>

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
        ondata={fitToLayer}
>
    <NavigationControl showCompass={false}/>
    <GeolocateControl showAccuracyCircle={true} bind:control={geolocateControl}/>
    <FullscreenControl/>
    <ScaleControl/>

    <BasemapSwitcherControl/>

    <!--<GeoJSON data={zonesCollection} promoteId="ID ZONA">
        <FillLayer
                eventsIfTopMost
                paint={{
                    'fill-color': 'red',
                    'fill-opacity': hoverStateFilter(0, 0.3),
                }}
                manageHoverState bind:hovered={hoveredZone}
                onclick={({features}: {features: Feature<Polygon, ZoneProperties>[]}) => {if(!focusedZone) focusedZone = features[0]}}
                onmouseenter={({features}: {features: Feature<Polygon, ZoneProperties>[]}) => {focusedZone = features[0]}}
        />

        <LineLayer paint={{
            'line-color': 'red',
            'line-width': hoverStateFilter(1, 2),
        }}/>

        <SymbolLayer
                eventsIfTopMost
                paint={{
                    'text-color': hoverStateFilter("#333", "black"),
                    'text-opacity': zoomTransition(11, 0, 11.5, 1),
                    'text-halo-color': hoverStateFilter('transparent', 'red'),
                    'text-halo-width': 2,
                }}
                layout={{
                    'text-field': ['coalesce', ['get', 'ZONA'], ['get', 'PARROQUIA']],
                    'text-size': zoomTransition(11, 5, 13, 16)
                }}/>
    </GeoJSON>-->

    <GeoJSON id="votingCenters" data={lastActiveCenters} promoteId="CODIGO RECINTO">
        <CircleLayer
                eventsIfTopMost
                paint={{
            'circle-color': 'blue',
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

    <GeoJSON data={linesToAllCenters!}>
        <LineLayer
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                paint={{
                    'line-width': 4,
                    'line-color': '#008800',
                    'line-opacity': 1,
                }}/>
    </GeoJSON>

</MapLibre>

<pre>{JSON.stringify(zoneInfoAcrossElections, null, 2)}</pre>
