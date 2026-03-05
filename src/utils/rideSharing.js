/**
 * Haversine formula to calculate the great-circle distance between two points on Earth.
 * 
 * @param {number} lat1 Latitude of point 1 in decimal degrees
 * @param {number} lon1 Longitude of point 1 in decimal degrees
 * @param {number} lat2 Latitude of point 2 in decimal degrees
 * @param {number} lon2 Longitude of point 2 in decimal degrees
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRadian = (angle) => (Math.PI / 180) * angle;

    const R = 6371; // Radius of the Earth in km
    const dLat = toRadian(lat2 - lat1);
    const dLon = toRadian(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadian(lat1)) *
        Math.cos(toRadian(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Ride-Sharing Matching Algorithm
 * Matches a passenger to the most suitable available driver.
 *
 * Criteria for matching:
 * 1. The driver must have 'available' status.
 * 2. The driver's vehicle must have sufficient capacity.
 * 3. The distance to the passenger must be within the maximum search radius.
 * 4. The driver with the shortest estimated time of arrival (or distance) is selected.
 *
 * @param {Object} passenger - The passenger requesting a ride
 * @param {number} passenger.lat - Passenger's latitude
 * @param {number} passenger.lon - Passenger's longitude
 * @param {number} passenger.seatsRequired - Number of seats required by the passenger
 * @param {Array} drivers - Array of driver objects
 * @param {number} maxRadiusKm - Maximum acceptable distance to search for drivers (in km)
 * @returns {Object|null} The best matching driver, or null if no driver is found
 */
export function matchPassengerToDriver(passenger, drivers, maxRadiusKm = 10) {
    if (!passenger || !drivers || drivers.length === 0) {
        return null;
    }

    let bestDriver = null;
    let minDistance = Infinity;

    for (const driver of drivers) {
        // Check if driver is available and has enough capacity
        if (driver.status !== 'available' || driver.capacity < passenger.seatsRequired) {
            continue;
        }

        // Calculate distance between driver and passenger
        const distance = calculateDistance(
            passenger.lat,
            passenger.lon,
            driver.lat,
            driver.lon
        );

        // If driver is within the radius and is closer than the current best match
        if (distance <= maxRadiusKm && distance < minDistance) {
            minDistance = distance;
            bestDriver = {
                ...driver,
                distanceToPassenger: Number(distance.toFixed(2)), // in kilometers
                estimatedEtaMinutes: Number(((distance / 40) * 60).toFixed(0)), // assuming average speed 40km/h
            };
        }
    }

    return bestDriver;
}

/**
 * Advanced Pool Routing Algorithm
 * Simply demonstrates how to group multiple requests into a shared ride.
 * Takes pending requests and an available high-capacity driver, returning a plausible route.
 * 
 * @param {Array} requests - Array of passenger requests
 * @param {Object} driver - Driver object
 * @param {number} maxDetourKm - Maximum detour length allowed to pool requests
 */
export function calculatePoolRoute(requests, driver, maxDetourKm = 5) {
    // Sorting requests by proximity to the driver as a naive nearest-neighbor approach
    const sortedRequests = [...requests].sort((a, b) => {
        const distA = calculateDistance(driver.lat, driver.lon, a.lat, a.lon);
        const distB = calculateDistance(driver.lat, driver.lon, b.lat, b.lon);
        return distA - distB;
    });

    const routePlan = [];
    let currentLat = driver.lat;
    let currentLon = driver.lon;
    let currentCapacity = driver.capacity;

    for (const req of sortedRequests) {
        if (currentCapacity >= req.seatsRequired) {
            const distToReq = calculateDistance(currentLat, currentLon, req.lat, req.lon);

            if (distToReq <= maxDetourKm) {
                routePlan.push({
                    action: 'pickup',
                    passengerId: req.id,
                    lat: req.lat,
                    lon: req.lon,
                    distanceFromLastStop: Number(distToReq.toFixed(2))
                });

                currentLat = req.lat;
                currentLon = req.lon;
                currentCapacity -= req.seatsRequired;
            }
        }
    }

    return {
        success: routePlan.length > 0,
        driverId: driver.id,
        route: routePlan
    };
}
