import { useCallback, useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';

import { getHotels } from '../Api';
import { setV4SearchResult, sethotelArr } from '../slices/getHotelSlice';
import { Hotels, searchList } from '../types/types';
import { V4HotelDisplay } from '../types/v4Types';

export default function useSearchApi() {
    const location = useLocation();
    const { key } = location.state || {};
    const dispatch = useDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const { hotelsRequest } = useAppSelector(state => state.reducer.hotels);

    const [isLoading, setIsLoading] = useState(true);
    const [hotelData, setHotelData] = useState<Hotels[]>([]);
    const [searchKey, setSearchKey] = useState<string>('');
    const [conversationId, setConversationId] = useState<string>('');
    const [v4HotelData, setV4HotelData] = useState<V4HotelDisplay[]>([]);
    const [v4SearchId, setV4SearchId] = useState<string>('');

    const hotelsList = useCallback(async () => {
        setIsLoading(true);

        const data = await getHotels({
            userId: id,
            userType: role,
            locationId: hotelsRequest.locationId,
            locationName: hotelsRequest.city,
            countryName: hotelsRequest.country,
            checkIn: hotelsRequest.checkIn,
            checkOut: hotelsRequest.checkOut,
            rooms: hotelsRequest.v4Rooms,
        });

        if (data) {
            const result = data as searchList;

            // If the backend returns V4-enriched hotel data (v4Hotels array)
            if ((result as any).v4Hotels && (result as any).searchId) {
                const enriched = (result as any).v4Hotels as V4HotelDisplay[];
                const sid = (result as any).searchId as string;
                setV4SearchId(sid);
                setV4HotelData(enriched);
                dispatch(setV4SearchResult({ searchId: sid, hotels: enriched }));
            } else if (result.data) {
                // Legacy response
                const hotelArr = result.data as Hotels[];
                const search = result?.commonData?.searchKey ?? '';
                const convid = result.conversationId ?? '';
                dispatch(sethotelArr(result));
                setHotelData(hotelArr);
                setSearchKey(search);
                setConversationId(convid);
            }
        } else {
            setHotelData([]);
            setV4HotelData([]);
            setSearchKey('');
            setConversationId('');
        }
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, id, role]);

    useEffect(() => {
        if (key) {
            hotelsList();
        }
    }, [hotelsList, key]);

    return {
        data: hotelData,
        isLoading,
        searchKey,
        conversationId,
        hotelsList,
        v4HotelData,
        v4SearchId,
        isV4: !!hotelsRequest.locationId,
    };
}
