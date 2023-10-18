function calculateMidpoint(x1, y1, x2, y2) {
    const midpointX = (x1 + x2) / 2;
    const midpointY = (y1 + y2) / 2;
    return { x: midpointX, y: midpointY };
};

// Function to calculate the intersection point of two line segments
function calculateLineSegmentIntersection(segment1, segment2) {
    const x1 = segment1[0].x;
    const y1 = segment1[0].y;
    const x2 = segment1[1].x;
    const y2 = segment1[1].y;
    const x3 = segment2[0].x;
    const y3 = segment2[0].y;
    const x4 = segment2[1].x;
    const y4 = segment2[1].y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
        // The lines are parallel, or the segments do not intersect.
        return null;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        // There is an intersection.
        const intersectionX = x1 + t * (x2 - x1);
        const intersectionY = y1 + t * (y2 - y1);
        return { x: intersectionX, y: intersectionY };
    } else {
        // The segments do not intersect.
        return null;
    };
};
