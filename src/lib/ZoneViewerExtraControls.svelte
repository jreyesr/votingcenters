<script lang="ts">
    import {Control, ControlGroup, ControlButton} from 'svelte-maplibre'

    let {linesToCenters = $bindable(), orderArrows = $bindable()} = $props()
</script>

<Control>
    <ControlGroup>
        <ControlButton onclick={() => {linesToCenters = !linesToCenters}}>
            <svg
                    width="22"
                    height="22"
                    viewBox="0 0 8.4666664 8.4666661"
                    id="svg1"
                    xmlns="http://www.w3.org/2000/svg"
                    style:--strokeWidth={linesToCenters ? "0.8px" : "0.4px"}>
                <title>Mostrar la distancia a mi posición actual ({linesToCenters ? "activo" : "inactivo"})</title>
                <defs
                        id="defs1">
                    <clipPath
                            clipPathUnits="userSpaceOnUse"
                            id="clipPath40">
                        <g
                                id="g43"
                                style="display:none">
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle40"
                                    r="1.5875"
                                    cy="4.2333331"
                                    cx="4.2333331"
                                    d="m 5.8208331,4.2333331 a 1.5875,1.5875 0 0 1 -1.5875,1.5875 1.5875,1.5875 0 0 1 -1.5875,-1.5875 1.5875,1.5875 0 0 1 1.5875,-1.5875 1.5875,1.5875 0 0 1 1.5875,1.5875 z"/>
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle41"
                                    r="0.79374999"
                                    cy="1.4552078"
                                    cx="1.4552078"
                                    d="m 2.2489578,1.4552078 a 0.79374999,0.79374999 0 0 1 -0.79375,0.79375 0.79374999,0.79374999 0 0 1 -0.79374996,-0.79375 0.79374999,0.79374999 0 0 1 0.79374996,-0.79374996 0.79374999,0.79374999 0 0 1 0.79375,0.79374996 z"/>
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle42"
                                    r="0.79374999"
                                    cy="7.0114584"
                                    cx="1.4552078"
                                    d="m 2.2489578,7.0114584 a 0.79374999,0.79374999 0 0 1 -0.79375,0.79375 0.79374999,0.79374999 0 0 1 -0.79374996,-0.79375 0.79374999,0.79374999 0 0 1 0.79374996,-0.79375 0.79374999,0.79374999 0 0 1 0.79375,0.79375 z"/>
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle43"
                                    r="0.79374999"
                                    cy="6.8791661"
                                    cx="6.8791661"
                                    d="m 7.6729161,6.8791661 a 0.79374999,0.79374999 0 0 1 -0.79375,0.79375 0.79374999,0.79374999 0 0 1 -0.79375,-0.79375 0.79374999,0.79374999 0 0 1 0.79375,-0.79375 0.79374999,0.79374999 0 0 1 0.79375,0.79375 z"/>
                        </g>
                        <path
                                id="lpe_path-effect51"
                                class="powerclip"
                                d="M -0.86021091,-0.86021091 H 11.97271 V 11.97271 H -0.86021091 Z M 5.8208331,4.2333331 a 1.5875,1.5875 0 0 0 -1.5875,-1.5875 1.5875,1.5875 0 0 0 -1.5875,1.5875 1.5875,1.5875 0 0 0 1.5875,1.5875 1.5875,1.5875 0 0 0 1.5875,-1.5875 z M 2.2489578,1.4552078 a 0.79374999,0.79374999 0 0 0 -0.79375,-0.79374996 0.79374999,0.79374999 0 0 0 -0.79374996,0.79374996 0.79374999,0.79374999 0 0 0 0.79374996,0.79375 0.79374999,0.79374999 0 0 0 0.79375,-0.79375 z m 0,5.5562506 a 0.79374999,0.79374999 0 0 0 -0.79375,-0.79375 0.79374999,0.79374999 0 0 0 -0.79374996,0.79375 0.79374999,0.79374999 0 0 0 0.79374996,0.79375 0.79374999,0.79374999 0 0 0 0.79375,-0.79375 z M 7.6729161,6.8791661 a 0.79374999,0.79374999 0 0 0 -0.79375,-0.79375 0.79374999,0.79374999 0 0 0 -0.79375,0.79375 0.79374999,0.79374999 0 0 0 0.79375,0.79375 0.79374999,0.79374999 0 0 0 0.79375,-0.79375 z"/>
                    </clipPath>
                    <clipPath
                            clipPathUnits="userSpaceOnUse"
                            id="clipPath43">
                        <g
                                id="g47"
                                style="display:none">
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle44"
                                    r="1.5875"
                                    cy="4.2333331"
                                    cx="4.2333331"
                                    d="m 5.8208331,4.2333331 a 1.5875,1.5875 0 0 1 -1.5875,1.5875 1.5875,1.5875 0 0 1 -1.5875,-1.5875 1.5875,1.5875 0 0 1 1.5875,-1.5875 1.5875,1.5875 0 0 1 1.5875,1.5875 z"/>
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle45"
                                    r="0.79374999"
                                    cy="1.4552078"
                                    cx="1.4552078"
                                    d="m 2.2489578,1.4552078 a 0.79374999,0.79374999 0 0 1 -0.79375,0.79375 0.79374999,0.79374999 0 0 1 -0.79374996,-0.79375 0.79374999,0.79374999 0 0 1 0.79374996,-0.79374996 0.79374999,0.79374999 0 0 1 0.79375,0.79374996 z"/>
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle46"
                                    r="0.79374999"
                                    cy="7.0114584"
                                    cx="1.4552078"
                                    d="m 2.2489578,7.0114584 a 0.79374999,0.79374999 0 0 1 -0.79375,0.79375 0.79374999,0.79374999 0 0 1 -0.79374996,-0.79375 0.79374999,0.79374999 0 0 1 0.79374996,-0.79375 0.79374999,0.79374999 0 0 1 0.79375,0.79375 z"/>
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle47"
                                    r="0.79374999"
                                    cy="6.8791661"
                                    cx="6.8791661"
                                    d="m 7.6729161,6.8791661 a 0.79374999,0.79374999 0 0 1 -0.79375,0.79375 0.79374999,0.79374999 0 0 1 -0.79375,-0.79375 0.79374999,0.79374999 0 0 1 0.79375,-0.79375 0.79374999,0.79374999 0 0 1 0.79375,0.79375 z"/>
                        </g>
                        <path
                                id="lpe_path-effect52"
                                class="powerclip"
                                d="M -3.6383364,-0.86021092 H 9.3268775 V 12.105003 H -3.6383364 Z M 5.8208331,4.2333331 a 1.5875,1.5875 0 0 0 -1.5875,-1.5875 1.5875,1.5875 0 0 0 -1.5875,1.5875 1.5875,1.5875 0 0 0 1.5875,1.5875 1.5875,1.5875 0 0 0 1.5875,-1.5875 z M 2.2489578,1.4552078 a 0.79374999,0.79374999 0 0 0 -0.79375,-0.79374996 0.79374999,0.79374999 0 0 0 -0.79374996,0.79374996 0.79374999,0.79374999 0 0 0 0.79374996,0.79375 0.79374999,0.79374999 0 0 0 0.79375,-0.79375 z m 0,5.5562506 a 0.79374999,0.79374999 0 0 0 -0.79375,-0.79375 0.79374999,0.79374999 0 0 0 -0.79374996,0.79375 0.79374999,0.79374999 0 0 0 0.79374996,0.79375 0.79374999,0.79374999 0 0 0 0.79375,-0.79375 z M 7.6729161,6.8791661 a 0.79374999,0.79374999 0 0 0 -0.79375,-0.79375 0.79374999,0.79374999 0 0 0 -0.79375,0.79375 0.79374999,0.79374999 0 0 0 0.79375,0.79375 0.79374999,0.79374999 0 0 0 0.79375,-0.79375 z"/>
                    </clipPath>
                    <clipPath
                            clipPathUnits="userSpaceOnUse"
                            id="clipPath47">
                        <g
                                id="g51"
                                style="display:none">
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle48"
                                    r="1.5875"
                                    cy="4.2333331"
                                    cx="4.2333331"
                                    d="m 5.8208331,4.2333331 a 1.5875,1.5875 0 0 1 -1.5875,1.5875 1.5875,1.5875 0 0 1 -1.5875,-1.5875 1.5875,1.5875 0 0 1 1.5875,-1.5875 1.5875,1.5875 0 0 1 1.5875,1.5875 z"/>
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle49"
                                    r="0.79374999"
                                    cy="1.4552078"
                                    cx="1.4552078"
                                    d="m 2.2489578,1.4552078 a 0.79374999,0.79374999 0 0 1 -0.79375,0.79375 0.79374999,0.79374999 0 0 1 -0.79374996,-0.79375 0.79374999,0.79374999 0 0 1 0.79374996,-0.79374996 0.79374999,0.79374999 0 0 1 0.79375,0.79374996 z"/>
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle50"
                                    r="0.79374999"
                                    cy="7.0114584"
                                    cx="1.4552078"
                                    d="m 2.2489578,7.0114584 a 0.79374999,0.79374999 0 0 1 -0.79375,0.79375 0.79374999,0.79374999 0 0 1 -0.79374996,-0.79375 0.79374999,0.79374999 0 0 1 0.79374996,-0.79375 0.79374999,0.79374999 0 0 1 0.79375,0.79375 z"/>
                            <circle
                                    style="fill:none;stroke:#000000;stroke-width:0.5;stroke-dasharray:none"
                                    id="circle51"
                                    r="0.79374999"
                                    cy="6.8791661"
                                    cx="6.8791661"
                                    d="m 7.6729161,6.8791661 a 0.79374999,0.79374999 0 0 1 -0.79375,0.79375 0.79374999,0.79374999 0 0 1 -0.79375,-0.79375 0.79374999,0.79374999 0 0 1 0.79375,-0.79375 0.79374999,0.79374999 0 0 1 0.79375,0.79375 z"/>
                        </g>
                        <path
                                id="lpe_path-effect53"
                                class="powerclip"
                                d="M -3.6383364,-3.6383364 H 9.3268775 V 9.3268775 H -3.6383364 Z m 9.4591695,7.8716695 a 1.5875,1.5875 0 0 0 -1.5875,-1.5875 1.5875,1.5875 0 0 0 -1.5875,1.5875 1.5875,1.5875 0 0 0 1.5875,1.5875 1.5875,1.5875 0 0 0 1.5875,-1.5875 z M 2.2489578,1.4552078 a 0.79374999,0.79374999 0 0 0 -0.79375,-0.79374996 0.79374999,0.79374999 0 0 0 -0.79374996,0.79374996 0.79374999,0.79374999 0 0 0 0.79374996,0.79375 0.79374999,0.79374999 0 0 0 0.79375,-0.79375 z m 0,5.5562506 a 0.79374999,0.79374999 0 0 0 -0.79375,-0.79375 0.79374999,0.79374999 0 0 0 -0.79374996,0.79375 0.79374999,0.79374999 0 0 0 0.79374996,0.79375 0.79374999,0.79374999 0 0 0 0.79375,-0.79375 z M 7.6729161,6.8791661 a 0.79374999,0.79374999 0 0 0 -0.79375,-0.79375 0.79374999,0.79374999 0 0 0 -0.79375,0.79375 0.79374999,0.79374999 0 0 0 0.79375,0.79375 0.79374999,0.79374999 0 0 0 0.79375,-0.79375 z"/>
                    </clipPath>
                </defs>
                <g
                        id="layer1">
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                            d="M 1.4552078,1.4552078 C 2.3812497,2.3812497 3.3072914,3.3072914 4.2333333,4.2333333"
                            id="path3"
                            clip-path="url(#clipPath47)"/>
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                            d="M 4.2333333,4.2333333 C 3.3072916,5.1593749 2.3812496,6.0854168 1.4552078,7.0114585"
                            id="path4"
                            clip-path="url(#clipPath43)"/>
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                            d="M 4.2333333,4.2333333 C 5.1152776,5.1152776 5.997222,5.997222 6.8791661,6.8791661"
                            id="path5"
                            clip-path="url(#clipPath40)"/>
                    <circle
                            style="fill:none;stroke:#000000;stroke-dasharray:none"
                            id="path1"
                            cx="4.2333331"
                            cy="4.2333331"
                            r="1.5875"/>
                    <circle
                            style="fill:none;stroke:#000000;stroke-dasharray:none"
                            id="path2"
                            r="0.79374999"
                            cy="1.4552078"
                            cx="1.4552078"/>
                    <circle
                            style="fill:none;stroke:#000000;stroke-dasharray:none"
                            id="circle2"
                            r="0.79374999"
                            cy="7.0114584"
                            cx="1.4552078"/>
                    <circle
                            style="fill:none;stroke:#000000;stroke-dasharray:none"
                            id="circle4"
                            r="0.79374999"
                            cy="6.8791661"
                            cx="6.8791661"/>
                </g>
            </svg>
        </ControlButton>

        <ControlButton onclick={() => {orderArrows = !orderArrows}}>
            <svg
                    width="22"
                    height="22"
                    viewBox="0 0 8.4666664 8.4666661"
                    version="1.1"
                    id="svg1"
                    xmlns="http://www.w3.org/2000/svg"
                    style:--strokeWidth={orderArrows ? "0.8px" : "0.4px"}>
                <title>Mostrar la secuencia de los centros ({orderArrows ? "activo" : "inactivo"})</title>
                <defs
                        id="defs1">
                    <marker
                            style="overflow:visible"
                            id="Triangle"
                            refX="2"
                            refY="0"
                            orient="auto-start-reverse"
                            markerWidth="1"
                            markerHeight="1.5"
                            viewBox="0 0 1 1"
                            preserveAspectRatio="xMidYMid">
                        <path
                                transform="scale(0.5)"
                                style="fill:context-stroke;fill-rule:evenodd;stroke:context-stroke;stroke-width:0.4px"
                                d="M 5.77,0 -2.88,5 V -5 Z"
                                id="path135"/>
                    </marker>
                </defs>
                <g
                        id="layer1">
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;marker-end:url(#Triangle)"
                            d="M 0.57652395,4.233333 L 4,1.8448766"
                            id="path54"
                            transform="translate(-0.32544146,0.2196727)"/>
                    <path
                            style="fill:none;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;marker-end:url(#Triangle)"
                            d="M 4,1.8448766 L 7.8901421,5.8146558"
                            id="path55"/>
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
