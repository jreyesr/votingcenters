<script lang="ts">
    import {Chart} from 'svelte-echarts'

    import {init, use} from 'echarts/core'
    import {LineChart} from 'echarts/charts'
    import {GridComponent, TooltipComponent} from 'echarts/components'
    import {SVGRenderer} from 'echarts/renderers'
    import type {EChartsOption, SeriesOption} from "echarts";
    import {elections, type ZoneInfo} from "../elections";

    use([LineChart, GridComponent, TooltipComponent, SVGRenderer])

    function makeSeriesOneCenter(name: string, data: number[]): SeriesOption {
        return {
            name,
            symbolSize: 20,
            type: 'line',
            emphasis: {
                focus: 'series'
            },
            smooth: true,
            endLabel: {
                show: true,
                formatter: '{a}',
                distance: 20
            },
            lineStyle: {
                width: 3
            },
            data,
        }
    }

    function shortenName(name: string) {
        const replacements: Record<string, string> = {
            // remove accents
            "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
            // unneedes chars
            ".": "", "\"": "",
            // typos
            "EDUACION": "EDUCACION", "EDUCATIA": "EDUCATIVA", "FISCOMICIONAL": "FISCOMISIONAL",
            // abbreviations
            "UNIDAD EDUCATIVA PARTICULAR": "UEP",
            "UNIDAD EDUCATIVA FISCAL": "UEF",
            "CENTRO DE EDUCACION FISCAL": "UEF",
            "UNIDAD EDUCATIVA DEL MILENIO": "UEM",
            "UNIDAD EDUCATIVA REPLICA": "UER",
            "UNIDAD EDUCATIVA": "UE",
            "ESCUELA DE EDUCACION BASICA": "ESCUELA",
            "ESCUELA BASICA": "E",
            "ESCUELA DE EDUCACION": "ESCUELA",
            "ESCUELA BASICA COMPLETA FISCAL": "EF",
            "ESCUELA BASICA FISCAL": "EF",
            "ESCUELA FISCAL MIXTA": "EF",
            "ESCUELA FISCAL": "EF",
            "ESCUELA PARTICULAR MIXTA": "EP",
            "ESCUELA MIXTA PARTICULAR": "EP",
            "ESCUELA PARTICULAR": "EP",
            "ESCUELA SUPERIOR POLITECNICA": "ESP",
            "ESCUELA": "E",
            "COLEGIO NACIONAL": "COLEGIO",
            "COLEGIO FISCAL DE BACHILLERATO": "CFB",
            "COLEGIO FISCAL MIXTO": "CF",
            "COLEGIO FISCAL": "CF",
            "COLEGIO DE BACHILLERATO": "C",
            "COLEGIO": "C",
            "INSTITUTO SUPERIOR TECNOLOGICO": "IST",
            "INSTITUTO SUPERIOR": "IS",
            "UNIVERSIDAD ESTATAL": "UE",
            "UNIVERSIDAD TECNOLOGICA": "UT",
            "UNIVERSIDAD POLITECNICA": "UP",
            "UNIVERSIDAD": "U",
            "FACULTAD": "FAC",
            "N° ": "#",
            "N°": "#",
            " NO. ": " #",
            " NO.": " #",
        }
        for (const repl in replacements) {
            name = name.replaceAll(repl, replacements[repl])
        }
        return name
    }

    const {zoneDataAcrossElections}: { zoneDataAcrossElections: Record<string, ZoneInfo> } = $props()
    const electionKeys = $derived(Object.entries(zoneDataAcrossElections).filter(([_, zoneInfo]) => zoneInfo.numCenters > 0).map(([electionKey, _]) => electionKey))
    const activeElections = $derived(elections.filter(e => electionKeys.includes(e.value)))
    const centerOrders = $derived.by(() => {
        const electionOrders: Record<string, Record<string, number>> = {}
        for (const {value: electionKey} of activeElections) {
            const zoneInfo = zoneDataAcrossElections[electionKey]
            const orderedCenters = zoneInfo.centers!.toSorted((a, b) =>
                a.properties["JUN INIF"] && b.properties["JUN INIF"]
                    ? a.properties["JUN INIF"] - b.properties["JUN INIF"]// both have F stations, order by that
                    : a.properties["JUN INIM"] - b.properties["JUN INIM"]) // only one has F stations, both must have M stations, order by that instead
            electionOrders[electionKey] = Object.fromEntries(orderedCenters.map((c, i) => ([shortenName(c.properties["NOMBRE RECINTO"].trim().toUpperCase()), i + 1])))
        }
        return electionOrders
    })
    const centerOrdersAcrossElections = $derived.by(() => {
        const map = new Map<string, number[]>()
        const allCenterNames = new Set(Object.values(centerOrders).flatMap(centers => Object.keys(centers)))
        for (const {value: electionKey} of activeElections) {
            const e = centerOrders[electionKey]
            allCenterNames.forEach(centerName => {
                const order = e[centerName] ?? null
                map.set(centerName, (map.get(centerName) ?? []).concat(order))
            })
        }
        return map
    })
    const maxNumberOfCenters = $derived(Math.max(...Array.from(centerOrdersAcrossElections.values()).map(elOrders => Math.max(...elOrders))))

    const options: EChartsOption = $derived({
        /*title: {
            text: 'ECharts Example',
        },*/
        tooltip: {
            trigger: "item"
        },
        animation: false,
        xAxis: {
            type: 'category',
            axisLabel: {
                margin: 30,
                fontSize: 16
            },
            boundaryGap: false,
            data: activeElections.map(e => e.label)
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                margin: 30,
                fontSize: 16,
                formatter: '#{value}'
            },
            inverse: true,
            interval: 1,
            min: 1,
            max: maxNumberOfCenters
        },
        series: [...centerOrdersAcrossElections.entries()].map(([centerName, orders]) => makeSeriesOneCenter(centerName, orders)),
    })
    $inspect(new Set(Array.from(centerOrdersAcrossElections.keys()).flat()))
</script>

<div style:height={(maxNumberOfCenters <= 30 ? 50 * maxNumberOfCenters : 1600) + "px"} style="margin-block-end: 30px;">
    <Chart {init} {options}/>
</div>
