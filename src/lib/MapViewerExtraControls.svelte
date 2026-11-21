<script lang="ts">
    import {Control, ControlGroup, ControlButton} from 'svelte-maplibre'

    let {showHeatmap = $bindable()}: { showHeatmap: boolean } = $props()
</script>

<Control>
    <ControlGroup>
        <ControlButton onclick={() => {showHeatmap = !showHeatmap}}>
            <svg
                    width="22"
                    height="22"
                    viewBox="0 0 48 48"
                    id="svg1"
                    xmlns="http://www.w3.org/2000/svg"
                    style:--strokeWidth={showHeatmap ? "3px" : "2px"}>
                <title>Mostrar mapa de calor ({showHeatmap ? "activo" : "inactivo"})</title>
                <g

                        id="layer1">
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                            d="M 33.651225,7.4754854 C 12.86353,11.244763 26.485568,35.635257 36.587637,27.481972 44.493909,21.100894 48.14373,5.6156122 33.651225,7.4754854 Z"
                            id="path39"/>
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                            d="M 19.143366,0 C 8.6631046,29.623624 22.905402,39.488636 48,39.488636"
                            id="path40"/>
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                            d="m 31.817001,12.450286 c -1.364606,0.3556 -3.630788,3.629764 -4.118094,5.022065 -0.962814,2.750899 1.42752,5.294829 4.670521,2.862578 3.772135,-2.829101 4.983365,-9.327201 -0.552427,-7.884643 z"
                            id="path41"/>
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                            d="M 0,14.216076 C 16.73253,24 3.9906198,33.000007 28.262943,48"
                            id="path42"/>
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                            d="M 0,33.000007 C 8.7469199,35.484215 10.660836,41.747989 14.136705,48"
                            id="path43"/>
                </g>
            </svg>
        </ControlButton>
    </ControlGroup>
</Control>

<style>
    svg g path, svg g circle {
        stroke-width: var(--strokeWidth);
    }
</style>
