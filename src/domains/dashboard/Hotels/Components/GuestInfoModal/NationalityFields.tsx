import React from 'react';

import { Flex, Form, Select, Typography } from 'antd';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '@src/hooks/store';

import useSearchCountryApi from '../../hooks/useSearchCountryApi';
import { setTravelerNationality, setcountryOfResidence } from '../../slices/getHotelSlice';

const NationalityFields = () => {
    const { hotelsRequest } = useAppSelector(state => state.reducer.hotels);
    const dispatch = useDispatch();

    const { countryList, countryOptions } = useSearchCountryApi();

    // useEffect(() => {
    //     countryList();
    //     console.log("countries",countryOptions)
    // }, [nationalityText, countryList]);

    // useEffect(() => {
    //     countryList(residenceText);
    // }, [residenceText, countryList]);

    // Nationality and Country of Residence removed — not required by Cleartrip B2B V4 API
    return null;
};

export default NationalityFields;
