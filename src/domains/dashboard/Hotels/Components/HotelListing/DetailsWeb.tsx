import { useEffect, useState } from 'react';

import { Col, Flex, Progress, Row, Select, Skeleton, Typography, Pagination } from 'antd';
import { Content } from 'antd/es/layout/layout';

import Detailshead from '@domains/dashboard/Hotels/Components/HotelListing/Detailshead';
import HotelList from '@domains/dashboard/Hotels/Components/HotelListing/HotelList';
import Filterhotel from '@src/domains/dashboard/Hotels/Components/HotelListing/Filterhotel';
import { useAppSelector } from '@src/hooks/store';
import useScrollUpOnPageChange from '@src/hooks/useScrollTopOnPageChange';

import { Hotels } from '../../types/types';
import { V4HotelDisplay } from '../../types/v4Types';
import Empty from '../Empty';
import '../../Assets/style.css';

interface hotelsProps {
    isLoading: boolean;
    originaldata?: Hotels[];
    conversationId: string;
    searchKey: string;
    hotelsSearch: () => void;
    // V4 props
    v4Hotels?: V4HotelDisplay[];
    v4SearchId?: string;
    isV4?: boolean;
}

const DetailsWeb = ({
    isLoading,
    originaldata,
    conversationId,
    searchKey,
    hotelsSearch,
    v4Hotels = [],
    v4SearchId = '',
    isV4 = false,
}: hotelsProps) => {
    const [ranges, setRange] = useState<[number, number]>([100, 10000]);

    const [priceRange, setPriceRange] = useState<[number, number]>([100, 10000]);
    const [filteredData, setFilteredData] = useState<Hotels[]>([]);
    const [progress, setProgress] = useState(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortOption, setSortOption] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const { hotelsRequest, hotelArr } = useAppSelector(state => state.reducer.hotels);
    if (!isV4 && hotelArr?.data?.length > 0) {
        isLoading = false;
        conversationId = hotelArr.conversationId;
        searchKey = hotelArr?.commonData?.searchKey;
    }

    // V4 path: use merged V4 hotels; legacy path: use originaldata or hotelArr
    const dataSource = isV4
        ? undefined
        : (originaldata && originaldata.length > 0 ? originaldata : hotelArr?.data);

    let numberOfDays: number = 1;
    if (!isV4 && dataSource && dataSource.length > 0) {
        try {
            const dateArrayLength = dataSource[0].rooms[0].roomRate.rates.length;
            const startDate = new Date(dataSource[0].rooms[0].roomRate.rates[0].from);
            const endDate = new Date(
                dataSource[0].rooms[0].roomRate.rates[dateArrayLength - 1].to
            );
            const timeDifference = endDate.getTime() - startDate.getTime();
            numberOfDays = Math.max(1, Math.ceil(timeDifference / (24 * 60 * 60 * 1000)));
        } catch {
            numberOfDays = 1;
        }
    }
    // V4 filtered data (separate state from legacy)
    const [v4FilteredData, setV4FilteredData] = useState<V4HotelDisplay[]>([]);
    useEffect(() => {
        if (isV4) setV4FilteredData(v4Hotels);
    }, [isV4, v4Hotels]);

    // Calculate current page data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = isV4
        ? v4FilteredData?.slice(startIndex, endIndex)
        : filteredData?.slice(startIndex, endIndex);

    useEffect(() => {
        const filterResults = (range: [number, number], query: string) => {
            if (isV4) {
                let filtered = v4Hotels.filter(
                    h => h.cheapestTotalPrice >= range[0] && h.cheapestTotalPrice <= range[1]
                );
                if (query) {
                    filtered = filtered.filter(h =>
                        h.name.toLowerCase().includes(query.toLowerCase())
                    );
                }
                setV4FilteredData(filtered);
                setCurrentPage(1);
                return;
            }

            let filtered = dataSource?.filter((item: any) => {
                const totalPrice = item.rooms.reduce(
                    (sum: any, room: any) => sum + room.roomRate.netAmount,
                    0
                );
                return totalPrice >= range[0] && totalPrice <= range[1];
            });

            if (query) {
                filtered = filtered.filter((item: any) =>
                    item.propertyInfo.hotelName.toLowerCase().includes(query.toLowerCase())
                );
            }

            setFilteredData(filtered);
            setCurrentPage(1); // Reset to first page
        };

        filterResults(priceRange, searchQuery);
    }, [priceRange, searchQuery, dataSource]);

    useEffect(() => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prevProgress => {
                if (prevProgress >= 90) {
                    clearInterval(interval);
                    return 100;
                }
                return prevProgress + 10;
            });
        }, 1000);
    }, [isLoading]);

    useEffect(() => {
        if (isV4) {
            if (sortOption === 'priceLowToHigh') {
                setV4FilteredData(prev =>
                    prev.slice().sort((a, b) => a.cheapestTotalPrice - b.cheapestTotalPrice)
                );
            } else if (sortOption === 'priceHighToLow') {
                setV4FilteredData(prev =>
                    prev.slice().sort((a, b) => b.cheapestTotalPrice - a.cheapestTotalPrice)
                );
            } else if (sortOption === 'popular') {
                setV4FilteredData(prev =>
                    prev.slice().sort((a, b) => b.starRating - a.starRating)
                );
            }
        } else {
            if (sortOption === 'priceLowToHigh') {
                setFilteredData(prevData =>
                    prevData.slice().sort((a, b) => {
                        const priceA = a.rooms.reduce(
                            (sum, room) => sum + room.roomRate.netAmount,
                            0
                        );
                        const priceB = b.rooms.reduce(
                            (sum, room) => sum + room.roomRate.netAmount,
                            0
                        );
                        return priceA - priceB;
                    })
                );
            } else if (sortOption === 'priceHighToLow') {
                setFilteredData(prevData =>
                    prevData.slice().sort((a, b) => {
                        const priceA = a.rooms.reduce(
                            (sum, room) => sum + room.roomRate.netAmount,
                            0
                        );
                        const priceB = b.rooms.reduce(
                            (sum, room) => sum + room.roomRate.netAmount,
                            0
                        );
                        return priceB - priceA;
                    })
                );
            } else if (sortOption === 'popular') {
                setFilteredData(prevData =>
                    prevData
                        .slice()
                        .sort(
                            (a, b) =>
                                Number(b.propertyInfo.starRating) -
                                Number(a.propertyInfo.starRating)
                        )
                );
            }
        }
        setCurrentPage(1);
    }, [sortOption, isV4]);

    const handleResetFilters = () => {
        setPriceRange([100, 10000]);
        setRange([100, 10000]);
        setSearchQuery('');
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useScrollUpOnPageChange(currentPage);

    return (
        <>
            <Flex>
                <Detailshead hotelsSearch={hotelsSearch} />
            </Flex>
            {(isV4 ? v4FilteredData?.length === 0 : filteredData?.length === 0) && !isLoading ? (
                <Empty />
            ) : (
                <Row gutter={16} className="py-3 mb-16">
                    {isLoading ? (
                        <Col className="" xl={24} sm={24}>
                            <Progress
                                className="w-full"
                                percent={progress}
                                status="exception"
                                showInfo={false}
                            />
                        </Col>
                    ) : (
                        <></>
                    )}
                    <Col className="gutter-row py-2" xl={6} sm={24}>
                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 20 }} />
                        ) : (
                            <Content className="border border-solid border-gray-200 rounded-md">
                                <Flex justify="space-between" className="p-4">
                                    <Typography.Text className="font-bold">Filter</Typography.Text>
                                    <Typography.Text
                                        className="font-medium text-bgOrange2 cursor-pointer"
                                        onClick={handleResetFilters}
                                    >
                                        Reset
                                    </Typography.Text>
                                </Flex>
                                <Filterhotel
                                    range={ranges}
                                    setRange={setRange}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    setPriceRange={setPriceRange}
                                />
                            </Content>
                        )}
                    </Col>
                    {isLoading ? (
                        <Col sm={24} xl={18}>
                            {Array.from({ length: 5 }, (_, index) => (
                                <Skeleton.Input
                                    key={index}
                                    style={{ height: '120px' }}
                                    className="w-full mt-4"
                                    active={isLoading}
                                    size="large"
                                    block
                                />
                            ))}
                        </Col>
                    ) : (
                        <Col className="gutter-row " xl={18} sm={24}>
                            <Flex justify="space-between">
                                <Typography.Text
                                    className="font-medium mt-2"
                                    data-testid="show-text"
                                >
                                    Showing {isV4 ? v4FilteredData?.length : filteredData?.length}{' '}
                                    Properties in {hotelsRequest.city}
                                </Typography.Text>
                                <Select
                                    defaultValue="Popular"
                                    className="custom_sort w-44 h-8"
                                    options={[
                                        { label: 'Price Low to High', value: 'priceLowToHigh' },
                                        { label: 'Price High to Low ', value: 'priceHighToLow' },
                                        { label: 'Popular', value: 'popular' },
                                    ]}
                                    onChange={value => setSortOption(value)} // Update sort option
                                />
                            </Flex>

                            <div className="py-1 my-1 bg-gray-100 rounded-md">
                                {isV4 ? (
                                    // V4 hotel list
                                    paginatedData?.length === 0 ? (
                                        <Empty />
                                    ) : (
                                        (paginatedData as V4HotelDisplay[])?.map((item, index) => (
                                            <HotelList
                                                key={item.hotelId}
                                                hotelKey={item.hotelId}
                                                image={item.imageUrl}
                                                name={item.name}
                                                facilities={item.address}
                                                reviews={String(item.starRating)}
                                                cancellationPolicy={
                                                    item.cheapestRate?.freeCancellation
                                                        ? 'FREE_CANCELLATION'
                                                        : 'NON_REFUNDABLE'
                                                }
                                                searchKey={v4SearchId}
                                                conversationId={''}
                                                price={item.cheapestTotalPrice}
                                                style={{
                                                    marginBottom:
                                                        index === paginatedData.length - 1
                                                            ? '1rem'
                                                            : '0',
                                                }}
                                            />
                                        ))
                                    )
                                ) : (
                                    // Legacy hotel list
                                    paginatedData?.length === 0 || !dataSource ? (
                                        <Empty />
                                    ) : (
                                        (paginatedData as Hotels[])?.map((item, index) => (
                                            <HotelList
                                                key={index}
                                                hotelKey={item.hotelKey}
                                                image={item.propertyInfo.imageUrl}
                                                name={item.propertyInfo.hotelName}
                                                facilities={item.propertyInfo.address}
                                                reviews={item.propertyInfo.starRating}
                                                cancellationPolicy={
                                                    item.rooms[0].ratePlan.cancelPolicyIndicator
                                                }
                                                searchKey={searchKey}
                                                conversationId={conversationId}
                                                price={
                                                    item.rooms.reduce(
                                                        (sum, room) =>
                                                            sum + room.roomRate.netAmount,
                                                        0
                                                    ) / numberOfDays
                                                }
                                                style={{
                                                    marginBottom:
                                                        index === paginatedData.length - 1
                                                            ? '1rem'
                                                            : '0',
                                                }}
                                            />
                                        ))
                                    )
                                )}
                            </div>
                            <Flex justify="end" className="py-4">
                                <Pagination
                                    current={currentPage}
                                    total={isV4 ? v4FilteredData?.length : filteredData?.length}
                                    pageSize={itemsPerPage}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                />
                            </Flex>
                        </Col>
                    )}
                </Row>
            )}
        </>
    );
};

export default DetailsWeb;
