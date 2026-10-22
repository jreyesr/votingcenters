<script lang="ts">
    import {
        Control,
        ControlGroup,
        ControlButton,
        RasterTileSource,
        RasterLayer,
    } from 'svelte-maplibre';

    type BasemapOption = {
        buttonLetter: string
        layers: BasemapLayer[]
    }
    type BasemapLayer = {
        kind: "raster" | "vector"
        tiles: string[]
        attribution: string
        tileSize?: number
        minzoom?: number
        maxzoom?: number
    }
    const options: BasemapOption[] = [
        {
            buttonLetter: "M",
            layers: [{
                kind: "raster",
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
                tileSize: 256,
                minzoom: 0,
                maxzoom: 22
            }]
        },
        {
            buttonLetter: "S",
            layers: [
                {
                    kind: "raster",
                    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
                    tileSize: 256,
                    attribution: "Satellite © <a href='https://www.esri.com'>ESRI</a>",
                    minzoom: 0,
                    maxzoom: 19
                },
                {
                    kind: "raster",
                    tiles: ["https://tiles.hemav.maps.eox.at/wmts/1.0.0/overlay_bright_3857/default/g/{z}/{y}/{x}.jpg"],
                    attribution: 'Overlay { Data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Rendering © <a href="https://eox.at/">EOX</a> and <a href="https://github.com/mapserver/basemaps">MapServer</a> }',
                    tileSize: 256
                }
            ]
        }
    ]

    let chosenOptionIndex = $state(0);
</script>

{#snippet selector(name: string, index: number)}
    <ControlButton onclick={()=>{chosenOptionIndex = index}}>
        {#if chosenOptionIndex === index}<b>{name}</b>{:else}{name}{/if}
    </ControlButton>
{/snippet}

<Control>
    <ControlGroup>
        {#each options as option, i}
            {@render selector(option.buttonLetter, i)}
        {/each}
    </ControlGroup>

    {#each options as option, i}
        {#if i === chosenOptionIndex}
            {#each option.layers as l}
                {#if l.kind === "raster"}
                    <RasterTileSource
                            tiles={l.tiles}
                            attribution={l.attribution}
                            tileSize={l.tileSize}
                            minzoom={l.minzoom}
                            maxzoom={l.maxzoom}>
                        <RasterLayer paint={{'raster-opacity': 1}} beforeLayerType={(l) => l.type !== "raster"}></RasterLayer>
                    </RasterTileSource>
                {/if}
            {/each}
        {/if}
    {/each}
</Control>
