import React, { useEffect, useState } from 'react';

import { Button, Col, DatePicker, Flex, Row, Typography } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import dayjs from 'dayjs';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import location from '@domains/dashboard/Hotels/Assets/icons/locationIcon.svg';
import BookModal from '@src/domains/dashboard/Hotels/Components/GuestInfoModal/Modal';
import '@domains/dashboard/Hotels/styles/home.css';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import useDebounce from '@src/hooks/useDebounce';
import { showToast } from '@src/slices/apiSlice';

import useDateFields from '../../hooks/useDateField';
import useSearchCityApi from '../../hooks/useSearchCityApi';
import useTimeConvert from '../../hooks/useTimeConvertHook';
import {
    getHotels,
    resetData,
    resetRoomResponse,
    resetGetHotels,
    resetHotelArr,
    resetV4,
} from '../../slices/getHotelSlice';
import SelectCity from '../AutoComplete/SelectCity';
import '../../Assets/style.css';

const Bookingfields = () => {
    const dispatch = useAppDispatch();
    const { showModal, handleCancel, isModalOpen } = useDateFields();

    const { hotelsRequest } = useAppSelector(state => state.reducer.hotels);
    const { rooms } = hotelsRequest;
    const { convertToDateString } = useTimeConvert();
    const [roomData, setRoomData] = useState([]);

    const [searchText, setSearchText] = useState<string>('');
    const debounceSearchText = useDebounce(searchText, 300);

    const [selectedCityName, setSelectedCityName] = useState<string | undefined>('Dubai');
    const [selectedCountryName, setSelectedCountryName] = useState<string>('United Arab Emirates');
    const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(undefined);

    const tomorrow = dayjs().add(1, 'day');
    const dayAfterTomorrow = tomorrow.add(1, 'day');
    const [checkInDate, setCheckInDate] = useState<any>(tomorrow);
    const [checkOutDate, setCheckOutDate] = useState<any>(dayAfterTomorrow);

    const disabledDate = (current: any) => current && current < moment().startOf('day');
    const disabledEndDate = (current: any) =>
        current && current < moment(checkInDate).startOf('day');

    const checkInData = convertToDateString(checkInDate);
    const checkoutData = convertToDateString(checkOutDate);

    const { cityList, cityOptions } = useSearchCityApi();

    const handleCitySelect = (cityName: string, countryName: string, locationId?: number) => {
        setSelectedCityName(cityName);
        setSelectedCountryName(countryName);
        setSelectedLocationId(locationId);
    };

    let totalCount = 0;
    rooms.forEach((count: { adult: number; child: number }) => {
        totalCount += count.adult + count.child;
    });

    const getWeekday = (date: any) => dayjs(date).format('dddd');

    useEffect(() => {
        cityList(debounceSearchText);
        dispatch(resetGetHotels());
    }, [debounceSearchText, cityList, dispatch]);

    const navigate = useNavigate();

    const handleClick = () => {
        dispatch(resetData());
        dispatch(resetRoomResponse());
        dispatch(resetHotelArr());
        dispatch(resetV4());

        if (!selectedCityName) {
            dispatch(showToast({ description: 'City name should not be empty', variant: 'error' }));
        } else if (!checkInDate) {
            dispatch(showToast({ description: 'Check-In date should not be empty', variant: 'error' }));
        } else if (!checkOutDate) {
            dispatch(showToast({ description: 'Check-Out date should not be empty', variant: 'error' }));
        } else {
            dispatch(
                getHotels({
                    city: selectedCityName,
                    country: selectedCountryName,
                    locationId: selectedLocationId,
                    locationType: 'CITY',
                    checkIn: checkInData,
                    checkOut: checkoutData,
                })
            );
            navigate(`${paths.hotels.index}/${paths.hotels.details}`, {
                state: { key: 'searchHotels' },
            });
        }
    };

    return (
        <>
            <Row className="w-full">
                {/* Location */}
                <Col xs={24} sm={24} md={6} lg={7} className="w-full m-2 py-0">
                    <Flex className="flex-none text-xs text-gray-500 mt-1 ml-3">
                        <ReactSVG src={location} className="" />
                        <Paragraph className="text-xs ml-1 text-gray-500">Location</Paragraph>
                    </Flex>
                    <SelectCity
                        options={cityOptions}
                        onSelect={handleCitySelect}
                        searchKey={searchText}
                        setSearchKey={setSearchText}
                        defaultvalue={`${selectedCityName}, ${selectedCountryName}`}
                        textSize="text-xl"
                    />
                    <Flex className="h-2">
                        <Typography.Text className="text-xs text-start text-gray-500 mt-1 ms-3" />
                    </Flex>
                    <Col className="border-b-2 md:ms-3 mt-1 mr-3 md:mr-0" />
                </Col>

                {/* Check-In */}
                <Col xs={10} sm={10} md={4} lg={4} className="w-full m-2">
                    <Typography.Text className="text-xs text-gray-500 md:ml-4 ml-2 mt-1">
                        Check-In
                    </Typography.Text>
                    <Typography.Title level={4} className="text-sm text-gray-500 py-0 px-0">
                        <DatePicker
                            disabledDate={disabledDate}
                            onChange={(date: any) => {
                                const checkIn = date.format('YYYY-MM-DD');
                                const checkOut = dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD');
                                setCheckInDate(checkIn);
                                setCheckOutDate(checkOut);
                            }}
                            value={dayjs(checkInDate)}
                            style={{ border: 0 }}
                            className="custom_date text-lg md:ml-2 font-bold"
                            format="DD MMM YY"
                            suffixIcon={null}
                            size="small"
                            defaultValue={tomorrow}
                            allowClear={false}
                        />
                    </Typography.Title>
                    <Flex className="h-4 ml-1">
                        <Typography.Text className="text-xs text-gray-500 md:ms-3 ms-1 line-clamp-1">
                            {checkInDate && getWeekday(checkInDate)}
                        </Typography.Text>
                    </Flex>
                    <Col className="border-b-2 md:ms-3 mt-1" />
                </Col>

                {/* Check-Out */}
                <Col xs={11} sm={11} md={4} lg={4} className="w-full m-2">
                    <Typography.Text className="text-xs text-gray-500 ml-4 mt-1">
                        Check-Out
                    </Typography.Text>
                    <Typography.Title level={4} className="text-sm text-gray-500 py-0 px-0">
                        <DatePicker
                            disabledDate={disabledEndDate}
                            value={dayjs(checkOutDate)}
                            onChange={(date: any) => setCheckOutDate(date.format('YYYY-MM-DD'))}
                            style={{ border: 0 }}
                            className="custom_date text-lg ml-2 font-bold"
                            format="DD MMM YY "
                            suffixIcon={null}
                            size="small"
                            defaultValue={dayAfterTomorrow}
                            allowClear={false}
                        />
                    </Typography.Title>
                    <Flex className="h-4 ml-1">
                        <Typography.Text className="text-xs text-gray-500 ms-3 line-clamp-1">
                            {checkOutDate && getWeekday(checkOutDate)}
                        </Typography.Text>
                    </Flex>
                    <Col className="border-b-2 ms-3 mt-1" />
                </Col>

                {/* Guests */}
                <Col xs={24} sm={24} md={6} lg={7} className="w-full m-2 py-0" onClick={showModal}>
                    <Typography.Text className="text-xs text-gray-500 mx-1 mt-1 md:ml-3 ml-2">
                        Guests
                    </Typography.Text>
                    <Flex className="ml-2">
                        <Typography.Text
                            className="font-medium md:mx-1 md:ml-1 w-full mt-1"
                            style={{ fontSize: '19px' }}
                        >
                            {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'},&nbsp;
                            {totalCount} {totalCount === 1 ? 'Guest' : 'Guests'}
                        </Typography.Text>
                    </Flex>
                    <Flex className="h-2">
                        <Typography.Text className="text-xs text-start text-gray-500 ms-3" />
                    </Flex>
                    <Col className="border-b-2 md:ms-3 mt-2 mr-3 md:mr-0" />
                </Col>

                {/* Search button */}
                <Col md={5} xxl={4} className="mt-9">
                    <Button
                        onClick={handleClick}
                        danger
                        className="xxl:w-52 md:w-48 h-12 flex justify-center md:ml-9 items-center rounded-md"
                        type="primary"
                        size="middle"
                    >
                        <Typography.Text className="text-white text-base">
                            Search Hotels
                        </Typography.Text>
                    </Button>
                </Col>
            </Row>

            {isModalOpen && (
                <BookModal
                    isModalOpen={isModalOpen}
                    handleCancel={handleCancel}
                    setRoomData={setRoomData}
                />
            )}
        </>
    );
};

export default Bookingfields;
