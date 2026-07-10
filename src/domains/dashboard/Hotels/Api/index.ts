import { SuccessGenericResponse } from '@customtypes/general';
import { HotelBookingResponse, HotelFinalBookResponse, TripResponse } from '../types/bookingTypes';
import { paymentRequest } from '../types/cancellationTypes';
import { getSearchDetailsPayload, HotelSearch } from '../types/hotelTypes';
import { bookingData } from '../types/managebookingTypes';
import {
    bookings,
    cancelBooking,
    cancellation,
    cancellationData,
    CityData,
    countrySearchPayload,
    getSearchListPayload,
    prebookPayload,
    searchList,
    ticket,
    V4RoomPaxPayload,
} from '../types/types';
import { ApiClient } from '@src/services/config';

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Search hotels by city location.
 * Peko backend proxies to Cleartrip V4 POST /hotels/api/v4/search-by-location
 * and enriches results with hotel-profile data.
 */
export const getHotels = async (payload: getSearchListPayload) => {
    try {
        const resp: SuccessGenericResponse<searchList> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/travel/hotels/searchHotels`,
            {
                locationId: payload.locationId,
                locationName: payload.locationName,
                countryName: payload.countryName,
                checkIn: payload.checkIn,
                checkOut: payload.checkOut,
                rooms: payload.rooms.map((r: V4RoomPaxPayload) => ({ adults: r.adults, childAges: r.childAges })),
                travelerNationality: payload.travelerNationality,
                travelerCountryOfResidence: payload.travelerCountryOfResidence,
            }
        );
        return resp.data;
    } catch {
        return false;
    }
};

// ─── City / Country Autocomplete ──────────────────────────────────────────────

export const fetchCityData = async (payload: countrySearchPayload) => {
    try {
        const resp: SuccessGenericResponse<CityData> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/travel/hotels/cityName?searchText=${payload.searchText}`
        );
        return resp.data;
    } catch {
        return false;
    }
};

export const fetchCountryData = async (payload: countrySearchPayload) => {
    try {
        const resp: SuccessGenericResponse<CityData> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/travel/hotels/countries?searchText=${payload.searchText}`
        );
        return resp.data;
    } catch {
        return false;
    }
};

// ─── Hotel Detail ─────────────────────────────────────────────────────────────

/**
 * Fetch detailed rate info for a specific hotel.
 * Peko backend proxies to Cleartrip V4 POST /hotels/api/v4/detail
 * and enriches with hotel-profile data.
 */
export const hotelAndRoomDetails = async (payload: getSearchDetailsPayload) => {
    try {
        const resp: SuccessGenericResponse<HotelSearch> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/travel/hotels/hotelAndRoomDetails`,
            {
                hotelId: payload.hotelId,
                searchId: payload.searchId,
                checkIn: payload.checkIn,
                checkOut: payload.checkOut,
                rooms: payload.rooms.map((r: V4RoomPaxPayload) => ({ adults: r.adults, childAges: r.childAges })),
            }
        );
        return resp.data;
    } catch {
        return false;
    }
};

// ─── Provisional Book ─────────────────────────────────────────────────────────

/**
 * Hold a booking for 15 minutes.
 * Peko backend proxies to Cleartrip V4 POST /hotels/api/v4/provisional-book.
 */
export const prebookHotel = async (payload: prebookPayload) => {
    try {
        const resp: SuccessGenericResponse<HotelBookingResponse> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/travel/hotels/preBook`,
            {
                searchId: payload.searchId,
                bookingCode: payload.bookingCode,
                bookingAmount: payload.bookingAmount,
                hotelId: payload.hotelId,
                checkIn: payload.checkIn,
                checkOut: payload.checkOut,
                rooms: payload.rooms.map((r: V4RoomPaxPayload) => ({ adults: r.adults, childAges: r.childAges })),
                contactPhone: payload.contactPhone,
                contactEmail: payload.contactEmail,
                travellers: payload.travellers,
                panCardNumber: payload.panCardNumber,
                specialRequest: payload.specialRequest,
            }
        );
        return resp.data;
    } catch {
        return false;
    }
};

// ─── Final Book ───────────────────────────────────────────────────────────────

/**
 * Finalise a booking using the provisionalBookId.
 * Peko backend proxies to Cleartrip V4 POST /hotels/api/v4/book.
 */
export const bookRoom = async (payload: paymentRequest) => {
    const resp: SuccessGenericResponse<HotelFinalBookResponse> = await ApiClient.post(
        `${payload.userType}/${payload.userId}/travel/hotels/book`,
        {
            affiliateTripReference: payload.affiliateTripReference,
            provisionalBookId: payload.provisionalBookId,
            depositAccountId: payload.depositAccountId,
        }
    );
    return resp.data;
};

// ─── Manage Bookings ──────────────────────────────────────────────────────────

/** List all bookings from Peko's own DB (each entry has a Cleartrip tripId). */
export const allBookings = async (payload: bookings) => {
    try {
        const resp: SuccessGenericResponse<bookingData> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/travel/hotels/list-all-bookings`,
            {
                params: {
                    page: payload.currentPage,
                    itemsPerPage: 4,
                },
            }
        );
        return resp.data;
    } catch {
        return false;
    }
};

/**
 * Get full trip details from Cleartrip V4 GET /hotels/api/v4/trip.
 * Peko backend proxies using the stored tripId.
 */
export const getTripDetails = async (payload: {
    userId: number;
    userType: string;
    tripId: string;
}) => {
    try {
        const resp: SuccessGenericResponse<TripResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/travel/hotels/trip`,
            { params: { tripId: payload.tripId } }
        );
        return resp.data;
    } catch {
        return false;
    }
};

// ─── Refund Info (replaces cancellation-charge) ───────────────────────────────

/**
 * Get refund amount for a trip before cancelling.
 * Peko backend proxies to Cleartrip V4 GET /hotels/api/v4/refund-info/{tripID}.
 */
export const cancellationCharge = async (payload: cancellation) => {
    try {
        const resp: SuccessGenericResponse<cancellationData> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/travel/hotels/refund-info`,
            { params: { tripId: payload.tripId } }
        );
        return resp.data;
    } catch {
        return false;
    }
};

// ─── Cancel Booking ───────────────────────────────────────────────────────────

/**
 * Cancel a confirmed booking.
 * Peko backend proxies to Cleartrip V4 POST /hotels/api/v4/cancel/{tripID}.
 */
export const cancelbookings = async (payload: cancelBooking) => {
    try {
        const resp = await ApiClient.post(
            `${payload.userType}/${payload.userId}/travel/hotels/hotel-cancel`,
            { tripId: payload.tripId }
        );
        return resp;
    } catch {
        return false;
    }
};

// ─── Download Ticket ──────────────────────────────────────────────────────────

export const downloadTicket = async (payload: ticket) => {
    try {
        const resp = await ApiClient.get(
            `${payload.userType}/${payload.userId}/travel/hotels/download-bookingTicket?orderId=${payload.orderId}`
        );
        return resp.data;
    } catch {
        return false;
    }
};

// ─── Cancellation Policy ──────────────────────────────────────────────────────

export const cancellationPolicy = async (payload: {
    userId: number;
    userType: string;
    searchId: string;
    hotelId: string;
    rateId: string;
}) => {
    try {
        const resp = await ApiClient.get(
            `${payload.userType}/${payload.userId}/travel/hotels/cancellationPolicy`,
            {
                params: {
                    searchId: payload.searchId,
                    hotelId: payload.hotelId,
                    rateId: payload.rateId,
                },
            }
        );
        return resp.data;
    } catch {
        return false;
    }
};

// ─── OTP ──────────────────────────────────────────────────────────────────────

export const getotp = async (payload: { userId: number; userType: string; scope: string }) => {
    try {
        const resp: SuccessGenericResponse<{}> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/travel/hotels/hotel-cancel/get-otp`,
            { params: { scope: payload.scope } }
        );
        return resp.data;
    } catch {
        return false;
    }
};
