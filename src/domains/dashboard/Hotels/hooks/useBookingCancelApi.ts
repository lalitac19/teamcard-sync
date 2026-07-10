import { useCallback, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { cancelbookings } from '../Api';

export default function useBookingCancelApi() {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const { corporateTxnId } = useAppSelector(state => state.reducer.hotels);
    const [isLoading, setIsLoading] = useState(false);

    const cancelBooked = useCallback(
        async (tripId: string, _conversationid?: string, _otp?: string, _scope?: string) => {
            setIsLoading(true);
            const data = await cancelbookings({
                userId: id,
                userType: role,
                tripId,
            });
            let success = false;
            if (data && data.status) {
                success = true;
            }

            setIsLoading(false);
            return success;
        },
        [id, role, corporateTxnId]
    );
    return { cancelBooked, loader: isLoading };
}
