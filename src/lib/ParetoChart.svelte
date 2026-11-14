<script lang="ts">
    import type {ParetoFrontier} from "../pareto";
    import {init, use, format} from "echarts/core";
    import {SVGRenderer} from 'echarts/renderers'
    import {LineChart, ScatterChart} from 'echarts/charts'
    import {Chart} from "svelte-echarts";
    import type {EChartsOption} from "echarts";
    import {GridComponent, TooltipComponent, MarkLineComponent} from "echarts/components";
    import type {CallbackDataParams, TopLevelFormatterParams} from "echarts/types/dist/shared";

    const {pareto}: { pareto: ParetoFrontier<{ vals: number[], parish: string, zone: string }> } = $props()

    use([LineChart, ScatterChart, GridComponent, TooltipComponent, MarkLineComponent, SVGRenderer])

    const options: EChartsOption = $derived({
        tooltip: {
            trigger: "item",
            formatter: (params: TopLevelFormatterParams) => {
                const [centerName, avg, stddev] = (params as CallbackDataParams).value! as [string, number, number]
                return `<b>${format.encodeHTML(centerName)}:</b> ${avg.toFixed(2)}±${stddev.toFixed(2)} km`
            }
        },
        xAxis: {
            type: 'value',
            min: 0, //max: 5,
            name: "Distancia\npromedio\n[km]",
        },
        yAxis: {
            type: 'value',
            min: 0, max: 1,
            name: "Desviación estándar\n[km]"
        },
        series: [
            {
                type: 'line',
                step: 'end',
                name: "Centros óptimos",
                symbolSize: 15,
                data: pareto.frontier.map(x => ([x.zone || x.parish, ...x.vals])),
                encode: {x: 1, y: 2},
            }, {
                type: 'scatter',
                name: "Centros subóptimos",
                symbolSize: 10,
                data: pareto.innerSamples.map(x => ([x.zone || x.parish, ...x.vals])),
                encode: {x: 1, y: 2},
            },
        ]
    } satisfies EChartsOption)
</script>

<div style:height="300px" style="max-width: 800px;">
    <Chart {init} {options}/>
</div>

