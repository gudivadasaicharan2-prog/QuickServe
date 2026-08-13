package com.quickserve.backend.util;

/**
 * Utility class providing geographic distance calculation using the
 * <a href="https://en.wikipedia.org/wiki/Haversine_formula">Haversine formula</a>.
 *
 * <p>The Haversine formula calculates the great-circle distance between two
 * points on a sphere given their longitudes and latitudes, accounting for
 * Earth's curvature. It is accurate to within ~0.5% for distances up to a
 * few hundred kilometres, which is well within the tolerance needed for
 * restaurant proximity checks.
 *
 * <p>This is a pure utility class — it carries no Spring beans or mutable state.
 * All methods are static.
 */
public final class HaversineUtil {

    /** Mean radius of the Earth in metres (WGS-84 approximation). */
    private static final double EARTH_RADIUS_METERS = 6_371_000.0;

    /** Prevent instantiation of this utility class. */
    private HaversineUtil() {
        throw new UnsupportedOperationException("HaversineUtil is a utility class and cannot be instantiated.");
    }

    /**
     * Calculates the straight-line (great-circle) distance between two geographic
     * coordinates using the Haversine formula.
     *
     * @param lat1 Latitude of point 1 in decimal degrees
     * @param lon1 Longitude of point 1 in decimal degrees
     * @param lat2 Latitude of point 2 in decimal degrees
     * @param lon2 Longitude of point 2 in decimal degrees
     * @return Distance between the two points in metres, rounded to one decimal place
     */
    public static double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        double rawDistance = EARTH_RADIUS_METERS * c;

        // Round to one decimal place for cleaner API responses
        return Math.round(rawDistance * 10.0) / 10.0;
    }
}
