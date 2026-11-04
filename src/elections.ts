import type {Feature, Point} from "geojson";

export type VotingCenterProperties = {
    PROVINCIA: string
    CANTON: string
    PARROQUIA: string
    ZONA: string
    "CODIGO RECINTO": number
    "NOMBRE RECINTO": string
    "JUN FEM": number
    "JUN MAS": number
    "NUM JUNR": number
    "JUN INIF": number
    "JUN FINF": number
    "JUN INIM": number
    "JUN FINM": number
    "NUMERO ELECTORES"?: number
    "ID ZONA": number
    "HASH ZONA": [number, number, number]
}
export type ZoneProperties = {
    "ID ZONA": string
    ZONA: string
    PARROQUIA: string
    center: Point
}
export type ZoneInfo = {
    id: number,
    province: string,
    canton: string,
    parish: string,
    zone: string,
    numCenters: number,
    numStations: number,
    numVoters: number,
    centers?: Feature<Point, VotingCenterProperties>[],
}

export type ElectionInfo = {
    value: string
    label: string
    disabled?: true
    tooltipRemark?: string,
    date?: string
}
export const elections: ElectionInfo[] = [
    {
        value: "before",
        label: "(187 años de vida nacional)",
        disabled: true,
        tooltipRemark: "Aparentemente no hubo nunca elecciones hasta 2017 (?)",
    },
    {value: "2017_pres", label: "Presidenciales 2017", date: "2017-02-19"},
    {
        value: "2019_alcaldes",
        label: "Alcaldes 2019",
        disabled: true,
        tooltipRemark: "El distributivo de esta elección no incluye información geográfica ni una forma de identificar los centros",
        date: "2019-03-24"
    },
    {value: "2021_pres", label: "Presidenciales 2021", date: "2021-02-07"},
    {value: "2023_alcaldes", label: "Alcaldes 2023", date: "2023-02-15"},
    {
        value: "2023_pres",
        label: "Presidenciales 2023",
        tooltipRemark: "Adelantadas por muerte cruzada, posiblemente usa la misma distribución que la elección anterior",
        date: "2023-08-20"
    },
    {
        value: "2024_consulta",
        label: "Consulta 2024",
        tooltipRemark: "Posiblemente usa la misma distribución que las dos elecciones anteriores",
        date: "2024-04-21"
    },
    {value: "2025_pres", label: "Presidenciales 2025", date: "2025-02-09"},
    {value: "2025_consulta", label: "Consulta 2025", date: "2025-11-16"},
    {value: "2027_alcaldes", label: "Alcaldes 2027", tooltipRemark: "Adelantadas a noviembre/2026", date: "2026-11-29"},
]

export const mostRecentElection = elections.findLast(e => !e.disabled)
