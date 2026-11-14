// Very lazy implementation of Pareto-optimal data. Use in anything else at your own risk, testing has used the It Works For Two Common Cases™ methodology.

// Tracks all the frontier points (those that aren't dominated by another), plus at most numInnerSamples points that are dominated by the frontier
export type ParetoFrontier<T extends { vals: number[] }> = {
    frontier: T[]
    innerSamples: T[]
    numInnerSamples: number
}

export function recordOnFrontier<T extends { vals: number[] }>(frontier: ParetoFrontier<T>, newPoint: T) {
    const dominatesPoints: [number, T][] = []
    let isDominated = false
    for (const [i, frontierPoint] of frontier.frontier.entries()) {
        if (newPoint.vals.every((y, j) => y <= frontierPoint.vals[j])) { // newPoint dominates frontierPoint on all dimensions, so throw away frontierPoint and replace it by this one
            dominatesPoints.push([i, frontierPoint])
        } else if (newPoint.vals.every((y, j) => y >= frontierPoint.vals[j])) { // frontierPoint dominates newPoint, ignore newPoint
            isDominated = true
            break
        }
    }
    if (isDominated) { // record as an inner sample
        frontier.innerSamples.push(newPoint)
        frontier.innerSamples = frontier.innerSamples.toSorted((a, b) => a.vals[0] - b.vals[0]).slice(0, frontier.numInnerSamples)
    } else {
        let numDeletedPoints = 0 // to adjust the positions of the elements to delete, since they slide around as they get deleted
        // e.g. if we have to delete indices [1], [2] and [4], the first one is in fact deleted from [1], but the second one must NOT be deleted from [2] anymore but from [1] because they all moved one step to the left, and the third one must be deleted from [2]
        for (const [i, dominatedPoint] of dominatesPoints) {
            frontier.frontier.splice(i - numDeletedPoints++, 1)
            frontier.innerSamples.push(dominatedPoint)
            frontier.innerSamples = frontier.innerSamples.toSorted((a, b) => a.vals[0] - b.vals[0]).slice(0, frontier.numInnerSamples)
        }
        frontier.frontier.push(newPoint)
        frontier.frontier.sort((a, b) => a.vals[0] - b.vals[0])
    }
}
