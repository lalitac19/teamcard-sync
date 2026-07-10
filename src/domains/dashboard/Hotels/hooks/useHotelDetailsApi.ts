import { useCallback, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';

import { hotelAndRoomDetails } from '../Api';
import { getDetails } from '../slices/getHotelSlice';
import { HotelSearch } from '../types/hotelTypes';
import { V4RoomPaxPayload } from '../types/types';

export default function useHotelDetailsApi() {
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(true);
    const { hotelsRequest } = useAppSelector(state => state.reducer.hotels);

    const hotelDetails = useCallback(
        async (hotelId: string, searchId: string, _legacyConvId?: string) => {
            const data: HotelSearch | false = await hotelAndRoomDetails({
                userId: id,
                userType: role,
                hotelId,
                searchId,
                checkIn: hotelsRequest.checkIn,
                checkOut: hotelsRequest.checkOut,
                rooms: hotelsRequest.v4Rooms,
            });

            if (data) {
                setIsLoading(false);
                dispatch(getDetails(data as HotelSearch));
            } else {
                setIsLoading(false);
            }
        },
        [dispatch, id, role, hotelsRequest]
    );

    return { isLoading, hotelDetails };
}
