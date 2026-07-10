// Provisional book response — contains provisionalBookId valid for 15 minutes
export type HotelBookingResponse = {
    provisionalBookId: string;
    // legacy fields kept for compatibility
    conversationId?: string;
    meta?: {
        success: boolean;
        statusCode: number;
        statusMessage: string;
        actionType: string;
        conversationId: string;
    };
    data?: HotelBooking[];
    cancellationPolicy?: any;
    version?: string;
};

// Final book response — Cleartrip V4 POST /hotels/api/v4/book
export type HotelFinalBookResponse = {
    tripId: string;
    confirmationNumber: string;
};

// Trip detail response — Cleartrip V4 GET /hotels/api/v4/trip
export type TripResponse = {
    tripId: string;
    contactDetail?: {
        title?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        mobile?: string;
    };
    paymentDetail?: {
        paymentType?: string;
        amount?: string;
        currency?: string;
        status?: string;
    };
    hotelDetail?: {
        hotelId?: string;
        name?: string;
        address?: string;
        city?: string;
        checkInDate?: string;
        checkOutDate?: string;
    };
    pricing?: {
        roomRate?: number;
        hotelTaxes?: number;
        discount?: number;
        totalFare?: number;
        currency?: string;
    };
    bookingInfo?: {
        bookingStatus?: string;
        voucherNumber?: string;
    };
    rooms?: {
        roomTypeName?: string;
        roomName?: string;
        guests?: { adults?: number; childrenAge?: string[] };
    }[];
    cancellationPolicy?: {
        text?: string;
        cancellationPolicySlabs?: { startTime?: number; endTime?: number; penaltyAmount?: number }[];
    };
    panCardNumber?: string;
};

export type HotelBooking = {
    hotel: {
        hotelKey: string;
        bookingKey: string;
        name: string;
        totalNet: number;
        currency: string;
        checkInDate: string;
        checkOutDate: string;
        priceChangeIndicator: boolean;
        rooms: HotelRoom[];
    };
    mandatoryBookData: {
        taxDetail: boolean;
        PassportDetails: passportType;
    };
};

export type passportType = {
    isPassportMandatory: boolean;
    isCrpPassportMandatory: boolean;
};

export type HotelRoom = {
    roomIndex: number;
    roomKey: string;
    roomId: string;
    roomTypeDesc: string;
    maxOccupancy: number;
    ratePlan: {
        supplierCode: string;
        meal: string;
        availableStatus: string;
        cancelPolicyIndicator: string;
        code: string;
        isPackage: boolean;
        fixedCombo: boolean;
        gstAssured: boolean;
    };
    roomRate: {
        currency: string;
        netAmount: number;
        rates: {
            name: string;
            amount: number;
            from: string;
            rateIndex: string;
            to: string;
        }[];
    };
    rateNotes: string;
    financialInfo: {
        supplier: string;
    };
};
