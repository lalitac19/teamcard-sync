import { Grid } from 'antd';
import { Content } from 'antd/es/layout/layout';

import DetailsWeb from '../Components/HotelListing/DetailsWeb';
import HotelListSm from '../Components/HotelListing/HotelListSm';
import useSearchApi from '../hooks/useSearchApi';

const { useBreakpoint } = Grid;

const Details = () => {
    const { isLoading, data, conversationId, searchKey, hotelsList, v4HotelData, v4SearchId, isV4 } =
        useSearchApi();
    const screens = useBreakpoint();

    return (
        <Content>
            {screens.md ? (
                <DetailsWeb
                    isLoading={isLoading}
                    originaldata={data}
                    conversationId={conversationId}
                    searchKey={searchKey}
                    hotelsSearch={hotelsList}
                    v4Hotels={v4HotelData}
                    v4SearchId={v4SearchId}
                    isV4={isV4}
                />
            ) : (
                <HotelListSm
                    isLoading={isLoading}
                    originaldata={data}
                    conversationId={conversationId}
                    searchKey={searchKey}
                />
            )}
        </Content>
    );
};

export default Details;
