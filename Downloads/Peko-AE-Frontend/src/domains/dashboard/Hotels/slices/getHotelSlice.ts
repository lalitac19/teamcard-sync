import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { HotelRoom } from '../types/bookingTypes';
import { HotelCancellationPolicy } from '../types/cancellationTypes';
import { HotelSearch, Room } from '../types/hotelTypes';
import { RoomInfo, V4RoomPaxPayload } from '../types/types';
import { V4HotelDisplay } from '../types/v4Types';

interface formDetails {
    FirstName: string;
    LastName: string;
    Country: string;
    Mobile: string;
}

interface getHotelState {
    country: string | undefined;
    city: string | undefined;
    locationId: number | undefined;
    locationType: 'CITY';
    checkIn: string;
    checkOut: string;
    rooms: RoomInfo[];
    // V4 room pax (parallel array, same index)
    v4Rooms: V4RoomPaxPayload[];
}
interface handleSubmit {
    country: string | undefined;
    city: string | undefined;
    locationId: number | undefined;
    locationType: 'CITY';
    checkIn: string;
    checkOut: string;
}

interface count {
    type: 'adult' | 'child';
    increment: boolean;
    index: number;
}

interface roomdata {
    roomIndex: number;
    name: string;
    price: number;
    roomKey: string;
}

interface keys {
    hotelKey: string;
    conversationId: string;
    searchKey: string;
}

interface BookingRoom {
    roomIndex: number;
    roomKey: string;
    passengerArray?: any[]; // Replace 'any[]' with the actual type of your passenger data
}

interface InitialState {
    hotelsRequest: getHotelState;
    hotelResponse: HotelSearch | {};
    roomResponse: roomdata[];
    reservedData: Room[];
    formData: formDetails;
    bookingRoom: BookingRoom[];
    keyData: keys;
    cancelPolicy: HotelCancellationPolicy | {};
    corporateTxnId: string;
    bookingKey: string;
    prebookRoomData: HotelRoom[];
    userdetails: any[];
    formCount: any[];
    hotelArr: any;
    nationality: string;
    countryOfResidence: string;
    prebookResponse: any;
    netAmount: number;
    // V4 fields
    v4SearchId: string;
    v4Hotels: V4HotelDisplay[];
    v4ProvisionalBookId: string;
    v4TripId: string;
}

const initialState: InitialState = {
    hotelsRequest: {
        country: '',
        city: '',
        locationId: undefined,
        locationType: 'CITY',
        checkIn: '',
        checkOut: '',
        rooms: [{ adult: 1, child: 0, roomIndex: 1, childAge: [] }],
        v4Rooms: [{ adults: 1 }],
    },
    bookingRoom: [],
    hotelResponse: {},
    roomResponse: [],
    reservedData: [],
    formData: {
        FirstName: '',
        LastName: '',
        Country: '',
        Mobile: '',
    },

    keyData: {
        searchKey: '',
        conversationId: '',
        hotelKey: '',
    },
    cancelPolicy: {},
    corporateTxnId: '',
    bookingKey: '',
    prebookRoomData: [],
    userdetails: [],
    formCount: [],
    hotelArr: {},
    nationality: '',
    countryOfResidence: '',
    prebookResponse: {},
    netAmount: 0,
    v4SearchId: '',
    v4Hotels: [],
    v4ProvisionalBookId: '',
    v4TripId: '',
};

export const getHotelSlice = createSlice({
    name: 'hotels',
    initialState,
    reducers: {
        setRoom: (state, action: PayloadAction<any>) => {
            if (action.payload.isAdd) {
                state.roomResponse.push(action.payload.roomInfo);
            } else {
                state.roomResponse = state.roomResponse.filter(
                    room => room.roomKey !== action.payload.roomInfo.roomKey
                );
            }
        },

        setRoomDetails: (state, action: PayloadAction<any>) => {
            state.reservedData = action.payload;
        },

        setKeys: (state, action: PayloadAction<keys>) => {
            state.keyData = action.payload;
        },
        getTxnId: (state, action: PayloadAction<string>) => {
            state.corporateTxnId = action.payload;
        },

        getBookingKey: (state, action: PayloadAction<string>) => {
            state.bookingKey = action.payload;
        },

        addRoom: state => {
            const index = state.hotelsRequest.rooms.length + 1;
            state.hotelsRequest = {
                ...state.hotelsRequest,
                rooms: [
                    ...state.hotelsRequest.rooms,
                    { adult: 1, child: 0, roomIndex: index, childAge: [] },
                ],
                v4Rooms: [...state.hotelsRequest.v4Rooms, { adults: 1 }],
            };
        },

        addChildAge: (
            state,
            action: PayloadAction<{ roomIndex: number; childAge: number; ageIndex: number }>
        ) => {
            const { roomIndex, childAge, ageIndex } = action.payload;
            state.hotelsRequest.rooms[roomIndex].childAge[ageIndex] = childAge;
            // sync into v4Rooms (age capped at 11 per V4 API constraint)
            const ages = [...(state.hotelsRequest.v4Rooms[roomIndex]?.childAges ?? [])];
            ages[ageIndex] = Math.min(childAge, 11);
            state.hotelsRequest.v4Rooms[roomIndex] = {
                ...state.hotelsRequest.v4Rooms[roomIndex],
                childAges: ages,
            };
        },
        handleCount: (state, action: PayloadAction<count>) => {
            const { type, increment, index } = action.payload;

            const { rooms } = state.hotelsRequest;
            state.hotelsRequest.rooms[index] = {
                ...state.hotelsRequest.rooms[index],
                [type]: increment
                    ? state.hotelsRequest.rooms[index][type] + 1
                    : state.hotelsRequest.rooms[index][type] - 1,
                ...(type === 'child' && {
                    childAge: increment
                        ? [...(rooms[index].childAge as number[]), 2]
                        : rooms[index].childAge.slice(0, -1),
                }),
            };
            // sync v4Rooms
            const v4Room = state.hotelsRequest.v4Rooms[index] ?? { adults: 1 };
            if (type === 'adult') {
                state.hotelsRequest.v4Rooms[index] = {
                    ...v4Room,
                    adults: Math.max(1, increment ? v4Room.adults + 1 : v4Room.adults - 1),
                };
            } else {
                const ages = v4Room.childAges ?? [];
                state.hotelsRequest.v4Rooms[index] = {
                    ...v4Room,
                    childAges: increment ? [...ages, 2] : ages.slice(0, -1),
                };
            }
        },

        deleteRoom: (state, action: PayloadAction<{ index: number }>) => {
            const { rooms } = state.hotelsRequest;
            rooms.splice(action.payload.index, 1);
            const v4Rooms = [...state.hotelsRequest.v4Rooms];
            v4Rooms.splice(action.payload.index, 1);
            state.hotelsRequest = { ...state.hotelsRequest, rooms, v4Rooms };
        },

        getHotels: (state, action: PayloadAction<handleSubmit>) => {
            state.hotelsRequest = { ...state.hotelsRequest, ...action.payload };
            return state;
        },

        getDetails: (state, action: PayloadAction<HotelSearch>) => {
            state.hotelResponse = { ...state.hotelResponse, ...action.payload };
        },

        getCancelPolicy: (state, action: PayloadAction<HotelCancellationPolicy>) => {
            state.cancelPolicy = { ...state.cancelPolicy, ...action.payload };
        },

        setFormDetails: (state, action: PayloadAction<formDetails>) => {
            state.formData = { ...state.formData, ...action.payload };
        },

        getPrebookData: (state, action: PayloadAction<any>) => {
            state.prebookRoomData = action.payload;
        },

        addPassengersData: (state, action: PayloadAction<any>) => {
            state.bookingRoom = action.payload;
        },

        addUserData: (state, action: PayloadAction<any>) => {
            if (state.userdetails.find(user => user.roomIndex === action.payload.roomIndex)) {
                const details = state.userdetails.find(
                    user => user.roomIndex === action.payload.roomIndex
                );

                const roomIndex = state.userdetails.findIndex(
                    user => user.roomIndex === action.payload.roomIndex
                );

                if (
                    details.passengers.find(
                        (passenger: any) =>
                            passenger.passengerKey === action.payload.userdetails.passengerKey
                    )
                ) {
                    const index = details.passengers.findIndex(
                        (passenger: any) =>
                            passenger.passengerKey === action.payload.userdetails.passengerKey
                    );

                    state.userdetails[roomIndex].passengers[index] = action.payload.userdetails;
                } else {
                    state.userdetails[roomIndex].passengers.push(action.payload.userdetails);
                }
            } else {
                state.userdetails.push({
                    roomKey: action.payload.roomKey,
                    roomIndex: action.payload.roomIndex,
                    passengers: [action.payload.userdetails],
                });
            }
        },
        TotalFormCount: (state, action: PayloadAction<any>) => {
            state.formCount = action.payload;
        },
        resetData: state => {
            state.hotelResponse = initialState.hotelResponse;
            return state;
        },
        resetUserDetails: state => {
            state.formCount = initialState.formCount;
            return state;
        },
        resetRoomResponse: state => {
            state.roomResponse = initialState.roomResponse;
            return state;
        },
        resetGetHotels: state => {
            state.hotelsRequest = initialState.hotelsRequest;
            return state;
        },
        sethotelArr: (state, action: PayloadAction<any>) => {
            state.hotelArr = action.payload;
        },
        resetHotelArr: state => {
            state.hotelArr = initialState.hotelArr;
            return state;
        },
        setTravelerNationality: (state, action: PayloadAction<any>) => {
            state.nationality = action.payload;
        },
        setcountryOfResidence: (state, action: PayloadAction<any>) => {
            state.countryOfResidence = action.payload;
        },
        setPrebookResponse: (state, action: PayloadAction<any>) => {
            state.prebookResponse = action.payload;
        },
        setNetAmount: (state, action: PayloadAction<any>) => {
            state.netAmount = action.payload;
        },
        resetNationality: state => {
            state.nationality = initialState.nationality;
            return state;
        },
        resetResidence: state => {
            state.countryOfResidence = initialState.countryOfResidence;
            return state;
        },
        setV4SearchResult: (
            state,
            action: PayloadAction<{ searchId: string; hotels: V4HotelDisplay[] }>
        ) => {
            state.v4SearchId = action.payload.searchId;
            state.v4Hotels = action.payload.hotels;
        },
        setV4ProvisionalBookId: (state, action: PayloadAction<string>) => {
            state.v4ProvisionalBookId = action.payload;
        },
        setV4TripId: (state, action: PayloadAction<string>) => {
            state.v4TripId = action.payload;
        },
        resetV4: state => {
            state.v4SearchId = initialState.v4SearchId;
            state.v4Hotels = initialState.v4Hotels;
            state.v4ProvisionalBookId = initialState.v4ProvisionalBookId;
            state.v4TripId = initialState.v4TripId;
        },
    },
});

export const {
    getHotels,
    getDetails,
    addRoom,
    deleteRoom,
    setRoom,
    handleCount,
    setFormDetails,
    setKeys,
    getCancelPolicy,
    getTxnId,
    getBookingKey,
    addChildAge,
    setRoomDetails,
    addPassengersData,
    getPrebookData,
    addUserData,
    TotalFormCount,
    resetData,
    resetUserDetails,
    resetRoomResponse,
    resetGetHotels,
    sethotelArr,
    resetHotelArr,
    setTravelerNationality,
    setcountryOfResidence,
    setPrebookResponse,
    setNetAmount,
    resetNationality,
    resetResidence,
    setV4SearchResult,
    setV4ProvisionalBookId,
    setV4TripId,
    resetV4,
} = getHotelSlice.actions;
export default getHotelSlice.reducer;
