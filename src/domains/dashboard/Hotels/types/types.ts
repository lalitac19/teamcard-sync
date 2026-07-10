// V4 room pax shape used in all V4 API calls
export type V4RoomPaxPayload = {
    adults: number;
    childAges?: number[];
};

export type getSearchListPayload = {
    userId: number;
    userType: string;
    // V4 fields
    locationId?: number;
    locationName?: string;
    countryName?: string;
    // legacy fallbacks
    country?: string | undefined;
    city?: string | undefined;
    checkIn: string;
    checkOut: string;
    rooms: V4RoomPaxPayload[];
    travelerNationality?: string;
    travelerCountryOfResidence?: string;
};
export type countrySearchPayload = {
    userId: number;
    userType: string;
    searchText: string;
};

export type searchListResponse = {
    data: searchList;
};

export type searchList = {
    conversationId: string;
    meta: {
        success: boolean;
        statusCode: number;
        statusMessage: string;
        actionType: string;
        conversationId: string;
    };
    commonData: {
        searchKey: string;
        culture: string;
    };
    data: Hotels[];
};

export type Hotels = {
    hotelKey: string;
    propertyInfo: PropertyInfo;
    rooms: Room[];
};

export type PropertyInfo = {
    hotelName: string;
    address: string;
    phoneNumber: string;
    location: string;
    latitude: string;
    longitude: string;
    imageUrl: string;
    facilities: string[]; // Assuming facilities are strings, modify as needed
    propertyType: string;
    starRating: string;
};

export type Room = {
    roomIndex: number;
    roomKey: string;
    roomId: string;
    roomTypeDesc: string;
    maxOccupancy: number;
    ratePlan: RatePlan;
    roomRate: RoomRate;
    rateNotes: string;
    financialInfo: FinancialInfo;
};
export type FinancialInfo = {
    supplier: string;
    payment: {
        paymentTypes: string[];
    };
};
export type RatePlan = {
    supplierCode: string;
    meal: string;
    availableStatus: string;
    cancelPolicyIndicator: string;
    code: string;
    isPackage: boolean;
    fixedCombo: boolean;
    gstAssured: boolean;
};
export type RoomRate = {
    currency: string;
    netAmount: number;
    rates: Rate[];
};
export type Rate = {
    name: string;
    amount: number;
    from: string;
    rateIndex: string;
    to: string;
};

// export type countries = {
//     cityName: string;
//     countryName: string;
// };
export type country = {
    label: string;
    value: string;
};
export type CityData = {
    cities: City[];
};

export type City = {
    cityName: string;
    countryName: string;
    id: number;
};

export type hotelListData = {
    hotelKey: string;
    hotelName: string;
    address: string;
    phoneNumber: string;
    hotelImage: string;
    hotelRating: string;
}[];

export type RoomInfo = {
    adult: number;
    child: number;
    roomIndex: number;
    childAge: number[] | [];
};

// V4 provisional-book payload
export type prebookPayload = {
    userId: number;
    userType: string;
    searchId: string;
    bookingCode: string;
    bookingAmount: number;
    hotelId: string;
    checkIn: string;
    checkOut: string;
    rooms: V4RoomPaxPayload[];
    contactPhone: string;
    contactEmail: string;
    travellers: { title: string; firstName: string; lastName: string }[];
    panCardNumber?: string;
    specialRequest?: string;
};

// legacy — kept for backward compat
export type prebookHotelsResponse = {
    userId: number;
    userType: string;
    rooms: roomData[];
    hotelKey: string;
    searchKey: string;
    conversationId: string;
};

export type roomData = {
    roomIndex: number;
    roomKey: string;
};

export type bookings = {
    userId: number;
    userType: string;
    currentPage: number;
};
export type ticket = {
    userId: number;
    userType: string;
    orderId: number;
};

// V4 cancel payload — tripId from Cleartrip
export type cancelBooking = {
    userId: number;
    userType: string;
    tripId: string;
    // legacy fallbacks
    bookingReferenceId?: string;
    conversationId?: string;
    selectedCorporateTxnId?: string;
    otp?: string;
    scope?: string;
};

// V4 refund-info payload
export type cancellation = {
    userId: number;
    userType: string;
    tripId: string;
    // legacy fallbacks
    bookingReferenceId?: string;
    conversationId?: string;
};
// V4 refund-info response
export type cancellationData = {
    refundAmount?: string;
    // legacy fields kept for compat
    conversationId?: string;
    meta?: {
        success: boolean;
        statusCode: number;
        statusMessage: string;
        actionType: string;
        conversationId: string;
    };
    commonData?: {
        productCode: string;
        culture: string;
    };
    data?: cancelArray[];
    version?: string;
};
export type cancelArray = {
    bookingStatus: string;
    bookingReferenceId: string;
    command: string;
    currency: string;
    cancellationCharge: [
        {
            supplierCancellationCharge: number;
            totalCancellationCharges: number;
            adminCancellationCharge: number;
        },
    ];
};

export type HotelBookCancelResponse = {
    data: {
        conversationId: string;
        meta: {
            success: boolean;
            statusCode: number;
            statusMessage: string;
            actionType: string;
            conversationId: string;
        };
        commonData: {
            productCode: string;
            culture: string;
        };
        data: {
            bookingStatus: string;
            bookingReferenceId: string;
            command: string;
        }[];
        version: string;
    };
};
