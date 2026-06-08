// Cleartrip B2B V4 API Types

// ---------- Request Types ----------

export type V4RoomPax = {
    adults: number; // min 1
    childAges?: number[]; // ages 0–11
};

export type V4CustomerInfo = {
    ip: string;
    userAgent: string;
};

export type V4CorpInfo = {
    corpId?: string;
};

export type V4SearchByLocationRequest = {
    location: {
        type: 'CITY';
        id: number;
    };
    checkInDate: string; // YYYY-MM-DD
    checkOutDate: string; // YYYY-MM-DD
    ratePlanFilter?: 'CHEAPEST' | 'ALL';
    customerInfo: V4CustomerInfo;
    corpInfo?: V4CorpInfo;
    rooms: V4RoomPax[];
    rateType?: ('SPECIFIC_CORPORATE' | 'GENERIC_CORPORATE' | 'THIRD_PARTY' | 'UNRECOGNIZED')[];
};

export type V4SearchByHotelIdsRequest = {
    hotelIds: string[];
    checkInDate: string;
    checkOutDate: string;
    ratePlanFilter?: 'CHEAPEST' | 'ALL';
    customerInfo: V4CustomerInfo;
    corpInfo?: V4CorpInfo;
    rooms: V4RoomPax[];
    rateType?: string[];
};

export type V4DetailRequest = {
    hotelId: string;
    checkInDate: string;
    checkOutDate: string;
    ratePlanFilter?: 'CHEAPEST' | 'ALL';
    customerInfo: V4CustomerInfo;
    corpInfo?: V4CorpInfo;
    rooms: V4RoomPax[];
    rateType?: string[];
};

export type V4ProvisionalBookRequest = {
    searchId: string;
    bookingInfo: {
        bookingAmount: number;
        bookingCode: string;
    };
    searchCriteria: {
        hotelId: string;
        checkInDate: string;
        checkOutDate: string;
        roomsData: {
            numOfRoom: number;
            roomPaxList: V4RoomPax[];
        };
    };
    customerInfo: {
        contactInfo: {
            phone: string;
            email: string;
        };
        travellers: {
            title: string;
            firstName: string;
            lastName: string;
        }[];
        ip: string;
        userAgent: string;
    };
    panCard?: {
        pancardType: 'PERSONAL' | 'COMPANY';
        panCardNumber: string;
    };
    additionalInfo?: {
        specialRequest?: string;
    };
    taxEntityInformation?: {
        gstDetails?: {
            number: string;
            companyName: string;
            companyAddress: string;
        };
    };
};

export type V4BookRequest = {
    affiliateTripReference: string;
    provisionalBookId: string;
    paymentDetails: {
        depositAccountId: string;
    };
};

// ---------- Response Types ----------

export type V4CancellationPolicySlab = {
    startTime: number; // epoch ms
    endTime: number;
    penaltyAmount: number;
};

export type V4CancellationPolicy = {
    text?: string | null;
    cancellationPolicySlabs?: V4CancellationPolicySlab[] | null;
};

export type V4PricingElement = {
    amount: number;
    category: 'BASE_FARE' | 'TAX' | 'DISCOUNT';
};

export type V4NightlyRate = {
    date: string;
    pricingElements: V4PricingElement[];
    strikeThrough?: number;
    strikeThroughInclusive?: number;
};

export type V4TotalPricing = {
    baseFare?: number;
    tax?: number;
    discount?: number;
    strikeThrough?: number;
    strikeThroughInclusive?: number;
};

export type V4Pricing = {
    nightly?: V4NightlyRate[];
    totals?: V4TotalPricing;
};

export type V4GstInfo = {
    gstAssured?: boolean;
};

export type V4Rate = {
    rateId: string;
    rateName?: string;
    bookingCode: string;
    freeCancellation?: boolean;
    freeBreakfast?: boolean;
    cancellationPolicy?: V4CancellationPolicy;
    bedTypes?: string[];
    inclusions?: string[];
    pricing?: V4Pricing;
    gstInfo?: V4GstInfo;
    additionalCharges?: {
        name: string;
        value: number;
        currency: string;
        frequency?: string;
        description?: string;
    }[];
};

export type V4SearchRoom = {
    roomId: string;
    rates: V4Rate[];
};

export type V4HotelAri = {
    hotelId: string;
    isDnd?: boolean;
    rooms: V4SearchRoom[];
};

export type V4SearchResponse = {
    searchId: string;
    hotels: V4HotelAri[];
};

export type V4DetailResponse = {
    searchId: string;
    hotel: V4HotelAri;
};

export type V4ProvisionalBookResponse = {
    provisionalBookId: string;
};

export type V4BookResponse = {
    tripId: string;
    confirmationNumber: string;
};

// ---------- Trip / Cancel Types ----------

export type V4TripResponse = {
    tripId: string;
    contactDetail?: {
        title?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        mobile?: string;
        landline?: string;
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
        cashback?: number;
        totalFare?: number;
        totalFee?: number;
        serviceTax?: number;
        currency?: string;
    };
    bookingInfo?: {
        bookingStatus?: string;
        voucherNumber?: string;
    };
    rooms?: {
        roomTypeName?: string;
        roomName?: string;
        guests?: {
            adults?: number;
            childrenAge?: string[];
        };
    }[];
    cancellationPolicy?: {
        text?: string;
        cancellationPolicySlabs?: {
            startTime?: number;
            endTime?: number;
        }[];
    };
    panCardNumber?: string;
};

export type V4RefundInfoResponse = {
    refundAmount: string;
};

export type V4CancelResponse = {
    cancelStatus: string;
};

// ---------- Content Types ----------

export type V4LocationMetadata = {
    type: string;
    name: string;
    coordinates?: {
        centerLatitude: number;
        centerLongitude: number;
    };
    searchEnabled: boolean;
    locationMetaData?: {
        locationVersion: string;
    };
};

export type V4LocationListResponse = {
    hasNextPage: boolean;
    nextPageToken?: string;
    locationType: string;
    locationsHierarchy: { id: number; parent?: any }[];
    locationIdToMetadataMap: Record<string, V4LocationMetadata>;
};

export type V4HotelMedia = {
    url: string;
    type: string;
    featured?: boolean;
    category?: string;
    subCategory?: string;
    caption?: string;
    thumbNailImagePath?: string;
};

export type V4HotelAmenity = {
    name: string;
    category?: string;
    standardAmenityName?: string;
};

export type V4HotelContent = {
    name: string;
    description?: string;
    property?: { name: string; code: string; type: string };
    hotelLocation?: {
        coordinates?: { latitude: number; longitude: number };
        pincode?: string;
        country?: { id: number; name: string; code?: string };
        city?: { id: number; name: string };
        state?: { id: number; name: string };
        area?: { name: string };
        locality?: { id: number; name: string };
    };
    media?: V4HotelMedia[];
    amenities?: V4HotelAmenity[];
    policyInfo?: {
        checkinTime?: string;
        checkoutTime?: string;
        guidelinesAndPolicies?: { title: string; description: string[] }[];
    };
    slugId?: string;
    ratings?: { starRating?: number };
};

export type V4HotelProfileResponse = {
    hotelId: string;
    hotelContent: V4HotelContent;
    roomsContent?: {
        rooms: {
            id: number;
            name: string;
            description?: string;
            views?: string[];
            amenities?: { name: string; category?: string }[];
            area?: { value: number; unit: string };
            media?: V4HotelMedia[];
            bedType?: string;
            maxOccupancy?: {
                totalMaxOccupancy: number;
                maxChildOccupancy?: number;
                maxAdultOccupancy?: number;
            };
        }[];
    };
};

export type V4HotelBatchProfileResponse = {
    hotels: V4HotelProfileResponse[];
};

// ---------- Merged display type ----------

export type V4HotelDisplay = {
    hotelId: string;
    isDnd?: boolean;
    // content fields
    name: string;
    address: string;
    starRating: number;
    imageUrl: string;
    city: string;
    latitude?: number;
    longitude?: number;
    amenities?: string[];
    // pricing fields
    rooms: V4SearchRoom[];
    cheapestTotalPrice: number;
    cheapestRate?: V4Rate;
    currency: string;
};

// ---------- Peko-proxied request wrapper ----------

export type V4SearchPayload = {
    userId: number;
    userType: string;
    locationId: number;
    locationType: 'CITY';
    checkIn: string;
    checkOut: string;
    rooms: V4RoomPax[];
    ratePlanFilter?: 'CHEAPEST' | 'ALL';
};
