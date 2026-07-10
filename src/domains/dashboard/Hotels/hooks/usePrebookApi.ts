import { useCallback, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { prebookHotel } from '../Api';
import { HotelBookingResponse } from '../types/bookingTypes';
import { V4RoomPaxPayload } from '../types/types';

export default function usePrebookApi() {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);

    const PrebookDetails = useCallback(
        async (params: {
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
        }) => {
            setIsLoading(true);
            const data: HotelBookingResponse | false = await prebookHotel({
                userId: id,
                userType: role,
                ...params,
            });
            setIsLoading(false);
            return data as HotelBookingResponse;
        },
        [id, role]
    );

    return { isLoading, PrebookDetails };
}
