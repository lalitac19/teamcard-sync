import { useEffect } from 'react';

import { Button, Card, Flex, Typography } from 'antd';
import { Content } from 'antd/es/layout/layout';
import clevertap from 'clevertap-web-sdk';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import Bookingfields from '@src/domains/dashboard/Hotels/Components/HotelSearch/Bookingfields';
import { useAppSelector, useAppDispatch } from '@src/hooks/store';

import FlightSVG from '@components/molecular/corporate-travel-card/assets/icons/airplane-card.svg';
import EsimSVG from '@components/molecular/corporate-travel-card/assets/icons/esim-card.svg';
import HotelSVG from '@components/molecular/corporate-travel-card/assets/icons/hotel-card.svg';

import SearchFlight from '../../Airline/components/SearchFlight';
import Redirect from '../../esimV2/components/home/Redirect';
import { updateSelectedType } from '../slices/corporateTravel';
import { links } from '../utils/data';

const tabs = [
    { key: '1', label: 'Air Tickets', icon: FlightSVG },
    { key: '2', label: 'Hotel Booking', icon: HotelSVG },
    { key: '3', label: 'Travel eSIM', icon: EsimSVG },
];

const CorporateTravel = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const active = params.get('active');
    if (active && (active === '1' || active === '2' || active === '3')) {
        dispatch(updateSelectedType(active));
        const clearActive = () => {
            params.delete('active');
            navigate(`${location.pathname}?${params.toString()}`);
        };
        clearActive();
    }

    const { selectedType } = useAppSelector(state => state.reducer.corporateTravel);

    const handleChange = (key: string) => {
        dispatch(updateSelectedType(key));
        let eventName = '';
        switch (key) {
            case '1': eventName = 'SearchFlight'; break;
            case '2': eventName = 'Bookingfields'; break;
            case '3': eventName = 'SearchEsim'; break;
            default: break;
        }
        clevertap.event.push(eventName, {
            Page: 'CorporateTravel',
            Action: `${eventName} clicked`,
        });
    };

    useEffect(() => {
        clevertap.event.push('SearchFlight', {
            Page: 'CorporateTravel',
            Action: 'SearchFlight clicked',
        });
    }, []);

    const renderContent = (key: string) => {
        switch (key) {
            case '1': return <SearchFlight />;
            case '2': return <Bookingfields />;
            case '3':
                dispatch(updateSelectedType('1'));
                return <Redirect />;
            default: return '';
        }
    };

    return (
        <Content className="pb-16">
            {/* Page title */}
            <Typography.Title
                level={3}
                className="text-center font-bold mt-6 mb-0"
                style={{ fontSize: '1.6rem' }}
            >
                The modern way to manage corporate travel - all in one place
            </Typography.Title>

            {/* Tab selector + Manage Booking */}
            <Flex justify="center" className="mt-8 relative">
                {/* Tabs card */}
                <div
                    className="rounded-2xl px-6 py-3"
                    style={{
                        background: '#F5F5F5',
                        boxShadow: '0px 2px 16px 0px rgba(0,0,0,0.08)',
                    }}
                >
                    <Flex gap={8} align="center">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleChange(tab.key)}
                                style={{
                                    background: selectedType === tab.key ? '#FFF0EE' : 'transparent',
                                    border: 'none',
                                    borderRadius: '1rem',
                                    padding: '10px 24px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <ReactSVG
                                    src={tab.icon}
                                    style={{ width: 28, height: 28 }}
                                    className={selectedType === tab.key ? 'selected-svg' : ''}
                                />
                                <Typography.Text
                                    style={{
                                        color: selectedType === tab.key ? '#FF3A3A' : '#595959',
                                        fontWeight: selectedType === tab.key ? 600 : 400,
                                        fontSize: '0.95rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {tab.label}
                                </Typography.Text>
                            </button>
                        ))}
                    </Flex>
                </div>

                {/* Manage Booking button — absolutely positioned top-right of the tab row */}
                <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
                    <Link to={links[Number(selectedType)]}>
                        <Button
                            danger
                            ghost
                            style={{ borderRadius: '0.5rem' }}
                        >
                            {selectedType === '3' ? 'Order History' : 'Manage Booking'}
                        </Button>
                    </Link>
                </div>
            </Flex>

            {/* Content card */}
            <Card
                className="mt-0 rounded-2xl"
                style={{
                    boxShadow: '0px 2px 20px 0px rgba(0, 0, 0, 0.10)',
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    padding: '2rem 1.5rem',
                }}
                styles={{ body: { padding: '2rem 1rem' } }}
            >
                {renderContent(selectedType)}
            </Card>

            {/* Footer */}
            <Flex justify="space-between" className="mt-8 px-2">
                <Typography.Text className="text-xs text-gray-400">
                    © 2024-2026 Peko Payment Services LLC. All Rights Reserved.
                </Typography.Text>
                <Flex gap={12}>
                    {['Peko Platform Agreement', 'Privacy Policy', 'Refund Policy', 'Cookie Policy'].map(
                        (item, i) => (
                            <Typography.Text key={item} className="text-xs text-gray-400">
                                {i > 0 && <span className="mr-3 text-gray-300">|</span>}
                                {item}
                            </Typography.Text>
                        )
                    )}
                </Flex>
            </Flex>
        </Content>
    );
};

export default CorporateTravel;
