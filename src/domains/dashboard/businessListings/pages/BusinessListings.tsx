import { useState } from 'react';

import {
    CheckCircleFilled,
    EnvironmentOutlined,
    LinkOutlined,
    MailOutlined,
    PhoneOutlined,
    RightOutlined,
    SearchOutlined,
    SendOutlined,
    StarFilled,
} from '@ant-design/icons';
import {
    Button,
    Col,
    Drawer,
    Flex,
    Form,
    Input,
    Rate,
    Row,
    Tabs,
    Tag,
    Typography,
} from 'antd';
import { Content } from 'antd/es/layout/layout';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const RED = '#FF3A3A';
const RED_LIGHT = '#FFF2F2';
const RED_MID = '#FFCFCF';
const BORDER = '#E4E7EC';
const TEXT = '#111827';
const MUTED = '#6B7280';
const CARD_BG = '#FFFFFF';

interface Business {
    id: string;
    name: string;
    initials: string;
    tagline: string;
    category: string;
    tags: string[];
    rating: number;
    reviews: number;
    location: string;
    featured: boolean;
    gradient: [string, string];
    phone: string;
    email: string;
    website: string;
    about: string;
    services: { name: string; desc: string }[];
    photos: string[];
}

const BUSINESSES: Business[] = [
    {
        id: 'emaar',
        name: 'Emaar Properties',
        initials: 'EP',
        tagline: 'Iconic communities shaping the Dubai skyline since 1997.',
        category: 'Real Estate',
        tags: ['Residential', 'Commercial', 'Off-Plan'],
        rating: 4.8,
        reviews: 342,
        location: 'Downtown Dubai',
        featured: true,
        gradient: ['#1e40af', '#1e3a8a'],
        phone: '+971 4 367 3333',
        email: 'info@emaar.ae',
        website: 'www.emaar.com',
        about: "Emaar Properties is one of the world's most valuable and admired real estate development companies. With proven expertise in properties, shopping malls & retail and hospitality & leisure, Emaar shapes new skylines and lifestyles.",
        services: [
            { name: 'Residential Sales', desc: "Apartments, villas and townhouses across Dubai's finest communities." },
            { name: 'Off-Plan Investments', desc: 'Early-access pricing on upcoming landmark developments.' },
            { name: 'Commercial Leasing', desc: 'Grade-A office and retail space in prime locations.' },
            { name: 'Property Management', desc: 'End-to-end management for investors and landlords.' },
        ],
        photos: ['#3B82F6,#1D4ED8', '#60A5FA,#3B82F6', '#93C5FD,#60A5FA', '#1D4ED8,#1E3A8A', '#2563EB,#1D4ED8', '#BFDBFE,#93C5FD'],
    },
    {
        id: 'damac',
        name: 'Damac Properties',
        initials: 'DP',
        tagline: 'Luxury living redefined across the UAE and beyond.',
        category: 'Real Estate',
        tags: ['Luxury', 'Branded', 'Villas'],
        rating: 4.6,
        reviews: 218,
        location: 'Business Bay, Dubai',
        featured: true,
        gradient: ['#d97706', '#b45309'],
        phone: '+971 4 301 9999',
        email: 'sales@damacgroup.com',
        website: 'www.damacproperties.com',
        about: "DAMAC Properties has been at the forefront of the Middle East's luxury real estate market since 2002, delivering award-winning residential, commercial and leisure properties across the region.",
        services: [
            { name: 'Luxury Apartments', desc: 'High-end residences with premium finishes and amenities.' },
            { name: 'Branded Residences', desc: 'Partnerships with global luxury brands including Versace and Cavalli.' },
            { name: 'Hotel Apartments', desc: 'Fully managed, furnished units with hotel-grade services.' },
            { name: 'Investment Advisory', desc: 'Expert guidance for maximising real estate ROI.' },
        ],
        photos: ['#F59E0B,#D97706', '#FBBF24,#F59E0B', '#FCD34D,#FBBF24', '#D97706,#B45309', '#92400E,#78350F', '#FEF3C7,#FDE68A'],
    },
    {
        id: 'alpha-pro',
        name: 'Alpha PRO Services',
        initials: 'AP',
        tagline: 'Your trusted partner for all UAE government transactions.',
        category: 'PRO Services',
        tags: ['Visa', 'Trade License', 'Attestation'],
        rating: 4.9,
        reviews: 412,
        location: 'Deira, Dubai',
        featured: true,
        gradient: ['#7c3aed', '#5b21b6'],
        phone: '+971 4 222 1010',
        email: 'info@alphapro.ae',
        website: 'www.alphapro.ae',
        about: "Alpha PRO Services is the UAE's most trusted PRO services firm with over 15 years of experience. We handle all government liaison activities so you can focus on growing your business.",
        services: [
            { name: 'Visa Processing', desc: 'Employment, investor and family visas processed efficiently.' },
            { name: 'Trade License Renewal', desc: 'All mainland and free zone license renewals handled end-to-end.' },
            { name: 'Document Attestation', desc: 'MOFA, embassy and court attestation services.' },
            { name: 'Company Formation', desc: 'New company setup across all UAE jurisdictions.' },
        ],
        photos: ['#7C3AED,#6D28D9', '#8B5CF6,#7C3AED', '#A78BFA,#8B5CF6', '#6D28D9,#5B21B6', '#4C1D95,#3B0764', '#EDE9FE,#DDD6FE'],
    },
    {
        id: 'gulf-tax',
        name: 'Gulf Tax Consultants',
        initials: 'GT',
        tagline: 'Expert VAT, corporate tax and accounting for UAE businesses.',
        category: 'VAT & Accounting',
        tags: ['VAT', 'Corporate Tax', 'Audit'],
        rating: 4.8,
        reviews: 156,
        location: 'DIFC, Dubai',
        featured: true,
        gradient: ['#059669', '#047857'],
        phone: '+971 4 388 4400',
        email: 'contact@gulftax.ae',
        website: 'www.gulftax.ae',
        about: 'Gulf Tax Consultants is a leading UAE tax and accounting firm providing comprehensive VAT registration, filing, corporate tax advisory and financial audit services to businesses of all sizes.',
        services: [
            { name: 'VAT Registration & Filing', desc: 'FTA registration, quarterly filing and compliance management.' },
            { name: 'Corporate Tax Advisory', desc: 'Strategic advice and compliance for UAE Corporate Tax.' },
            { name: 'Bookkeeping', desc: 'Monthly accounting, payroll and financial reporting.' },
            { name: 'Financial Audit', desc: 'Statutory and internal audit services for all sectors.' },
        ],
        photos: ['#059669,#047857', '#10B981,#059669', '#34D399,#10B981', '#047857,#065F46', '#064E3B,#022C22', '#D1FAE5,#A7F3D0'],
    },
    {
        id: 'printhub',
        name: 'PrintHub UAE',
        initials: 'PH',
        tagline: 'Premium print & branding solutions delivered across the UAE.',
        category: 'Printing & Branding',
        tags: ['Offset Print', 'Large Format', 'Branding'],
        rating: 4.7,
        reviews: 203,
        location: 'Al Quoz, Dubai',
        featured: true,
        gradient: ['#0891b2', '#0e7490'],
        phone: '+971 4 348 9955',
        email: 'orders@printhub.ae',
        website: 'www.printhub.ae',
        about: 'PrintHub UAE is a full-service print and branding house serving corporates, events companies and SMEs across the region. With state-of-the-art presses and a 48-hour turnaround, we deliver quality at scale.',
        services: [
            { name: 'Offset Printing', desc: 'High-quality business cards, brochures and catalogues.' },
            { name: 'Large Format', desc: 'Banners, signage, building wraps and exhibition displays.' },
            { name: 'Brand Identity', desc: 'Logo design, brand guidelines and corporate stationery.' },
            { name: 'Promotional Items', desc: 'Custom merchandise and corporate gifting solutions.' },
        ],
        photos: ['#0891B2,#0E7490', '#06B6D4,#0891B2', '#22D3EE,#06B6D4', '#0E7490,#155E75', '#164E63,#0C4A6E', '#CFFAFE,#A5F3FC'],
    },
    {
        id: 'altamimi',
        name: 'Al Tamimi & Company',
        initials: 'AT',
        tagline: "The region's largest law firm, trusted by global businesses.",
        category: 'Legal',
        tags: ['Corporate Law', 'Litigation', 'Banking & Finance'],
        rating: 4.9,
        reviews: 87,
        location: 'DIFC, Dubai',
        featured: true,
        gradient: ['#475569', '#334155'],
        phone: '+971 4 364 1641',
        email: 'info@tamimi.com',
        website: 'www.tamimi.com',
        about: 'Al Tamimi & Company is the largest law firm in the Middle East and North Africa, with over 350 lawyers across 15 offices in 9 countries. We provide comprehensive legal services for businesses operating in the region.',
        services: [
            { name: 'Corporate & Commercial', desc: 'M&A, joint ventures, contracts and corporate structuring.' },
            { name: 'Banking & Finance', desc: 'Islamic and conventional finance, project finance and sukuk.' },
            { name: 'Dispute Resolution', desc: 'Litigation, arbitration and mediation services.' },
            { name: 'Employment Law', desc: 'HR policies, employment contracts and labour disputes.' },
        ],
        photos: ['#475569,#334155', '#64748B,#475569', '#94A3B8,#64748B', '#334155,#1E293B', '#1E293B,#0F172A', '#E2E8F0,#CBD5E1'],
    },
    {
        id: 'fasttrack',
        name: 'FastTrack Gov Solutions',
        initials: 'FG',
        tagline: 'Speeding up your government processes across all UAE emirates.',
        category: 'PRO Services',
        tags: ['Express Visa', 'Labour Card', 'Emirates ID'],
        rating: 4.7,
        reviews: 267,
        location: 'Sharjah',
        featured: false,
        gradient: ['#dc2626', '#b91c1c'],
        phone: '+971 6 577 1100',
        email: 'hello@fasttrackgov.ae',
        website: 'www.fasttrackgov.ae',
        about: 'FastTrack Government Solutions specialises in express processing of UAE government transactions. Our team handles over 2,000 transactions per month with a same-day option for urgent cases.',
        services: [
            { name: 'Express Visa', desc: 'Same-day and 48-hour visa processing packages.' },
            { name: 'Labour Card', desc: 'MOHRE registration and labour card processing.' },
            { name: 'Emirates ID', desc: 'New and renewal Emirates ID applications.' },
            { name: 'Typing Services', desc: 'Official document typing and translation.' },
        ],
        photos: ['#DC2626,#B91C1C', '#EF4444,#DC2626', '#F87171,#EF4444', '#B91C1C,#991B1B', '#991B1B,#7F1D1D', '#FEE2E2,#FECACA'],
    },
    {
        id: 'pinnacle',
        name: 'Pinnacle Accounting',
        initials: 'PA',
        tagline: 'Trusted accounting and CFO services for growing SMEs.',
        category: 'VAT & Accounting',
        tags: ['CFO Services', 'Payroll', 'Financial Planning'],
        rating: 4.6,
        reviews: 98,
        location: 'Abu Dhabi',
        featured: false,
        gradient: ['#4f46e5', '#3730a3'],
        phone: '+971 2 678 9900',
        email: 'info@pinnacleacc.ae',
        website: 'www.pinnacleacc.ae',
        about: 'Pinnacle Accounting Group provides outsourced CFO, bookkeeping and payroll services to SMEs across Abu Dhabi and the UAE. Our team of chartered accountants helps you grow with clarity.',
        services: [
            { name: 'Outsourced CFO', desc: 'Part-time CFO services for strategic financial oversight.' },
            { name: 'Monthly Bookkeeping', desc: 'Accurate, timely accounts with cloud-based reporting.' },
            { name: 'Payroll Processing', desc: 'WPS-compliant payroll for all company sizes.' },
            { name: 'Financial Planning', desc: 'Budgeting, forecasting and business modelling.' },
        ],
        photos: ['#4F46E5,#4338CA', '#6366F1,#4F46E5', '#818CF8,#6366F1', '#4338CA,#3730A3', '#3730A3,#312E81', '#E0E7FF,#C7D2FE'],
    },
    {
        id: 'technova',
        name: 'TechNova IT Solutions',
        initials: 'TN',
        tagline: 'End-to-end IT infrastructure and digital transformation.',
        category: 'IT Services',
        tags: ['Cloud', 'Cybersecurity', 'ERP'],
        rating: 4.8,
        reviews: 134,
        location: 'Dubai Internet City',
        featured: false,
        gradient: ['#2563eb', '#1d4ed8'],
        phone: '+971 4 447 8833',
        email: 'sales@technova.ae',
        website: 'www.technova.ae',
        about: 'TechNova IT Solutions is a Microsoft Gold Partner delivering cloud infrastructure, cybersecurity and ERP implementations to enterprise clients across the UAE and wider GCC.',
        services: [
            { name: 'Cloud Migration', desc: 'Azure and Microsoft 365 deployment and management.' },
            { name: 'Cybersecurity', desc: 'Threat detection, SOC monitoring and compliance.' },
            { name: 'ERP Implementation', desc: 'Microsoft Dynamics 365 and SAP implementations.' },
            { name: 'IT Support', desc: '24/7 managed IT support and helpdesk.' },
        ],
        photos: ['#2563EB,#1D4ED8', '#3B82F6,#2563EB', '#60A5FA,#3B82F6', '#1D4ED8,#1E40AF', '#1E40AF,#1E3A8A', '#DBEAFE,#BFDBFE'],
    },
    {
        id: 'better-homes',
        name: 'Better Homes Real Estate',
        initials: 'BH',
        tagline: "Dubai's most experienced property brokerage for 35+ years.",
        category: 'Real Estate',
        tags: ['Sales', 'Rentals', 'Property Management'],
        rating: 4.5,
        reviews: 189,
        location: 'Jumeirah, Dubai',
        featured: false,
        gradient: ['#16a34a', '#15803d'],
        phone: '+971 4 344 7714',
        email: 'info@bhomes.com',
        website: 'www.bhomes.com',
        about: 'Better Homes Real Estate has been the trusted choice for property buyers, sellers and tenants in Dubai since 1986. Our team of 400+ consultants covers every corner of the market.',
        services: [
            { name: 'Property Sales', desc: 'Buying and selling across all Dubai communities.' },
            { name: 'Rentals', desc: 'Short-term and long-term rental management.' },
            { name: 'Property Management', desc: 'Full management for landlords and investors.' },
            { name: 'Valuation', desc: 'Professional property valuation and market reports.' },
        ],
        photos: ['#16A34A,#15803D', '#22C55E,#16A34A', '#4ADE80,#22C55E', '#15803D,#166534', '#166534,#14532D', '#DCFCE7,#BBF7D0'],
    },
    {
        id: 'design-district',
        name: 'Design District Interiors',
        initials: 'DD',
        tagline: 'Transforming spaces with award-winning interior design.',
        category: 'Interior Design',
        tags: ['Residential', 'Commercial', '3D Rendering'],
        rating: 4.7,
        reviews: 71,
        location: 'Dubai Design District',
        featured: false,
        gradient: ['#e11d48', '#be123c'],
        phone: '+971 4 456 0077',
        email: 'studio@designdistrict.ae',
        website: 'www.designdistrict.ae',
        about: 'Design District Interiors is a multi-award-winning studio known for creating stunning residential and commercial spaces that blend luxury, functionality and cultural identity.',
        services: [
            { name: 'Interior Design', desc: 'Concept to completion for homes and offices.' },
            { name: 'Space Planning', desc: 'Optimised layouts with detailed CAD drawings.' },
            { name: '3D Visualisation', desc: 'Photorealistic renders before work begins.' },
            { name: 'Fit-Out', desc: 'Full project management and site supervision.' },
        ],
        photos: ['#E11D48,#BE123C', '#F43F5E,#E11D48', '#FB7185,#F43F5E', '#BE123C,#9F1239', '#9F1239,#881337', '#FFE4E6,#FECDD3'],
    },
    {
        id: 'swiftlog',
        name: 'SwiftLog Logistics',
        initials: 'SL',
        tagline: 'Reliable freight and last-mile delivery across the UAE.',
        category: 'Logistics',
        tags: ['Freight', 'Last-Mile', 'Warehousing'],
        rating: 4.6,
        reviews: 159,
        location: 'Sharjah',
        featured: false,
        gradient: ['#ea580c', '#c2410c'],
        phone: '+971 6 533 7700',
        email: 'ops@swiftlog.ae',
        website: 'www.swiftlog.ae',
        about: 'SwiftLog Logistics is a full-service freight and logistics provider covering air, sea and road freight across the UAE and GCC, with a fleet of 200+ vehicles and 100,000+ sqft of warehousing.',
        services: [
            { name: 'Air Freight', desc: 'Express and economy air cargo to 120+ destinations.' },
            { name: 'Sea Freight', desc: 'FCL and LCL shipments with customs clearance.' },
            { name: 'Road Transport', desc: 'UAE-wide distribution with real-time tracking.' },
            { name: 'Warehousing', desc: 'Secure, climate-controlled storage and fulfilment.' },
        ],
        photos: ['#EA580C,#C2410C', '#F97316,#EA580C', '#FB923C,#F97316', '#C2410C,#9A3412', '#9A3412,#7C2D12', '#FFEDD5,#FED7AA'],
    },
];

const CATEGORIES = [
    'All',
    'Real Estate',
    'PRO Services',
    'VAT & Accounting',
    'Printing & Branding',
    'Legal',
    'IT Services',
    'Interior Design',
    'Logistics',
];

function LogoBadge({
    initials,
    gradient,
    size = 48,
}: {
    initials: string;
    gradient: [string, string];
    size?: number;
}) {
    return (
        <div style={{
            width: size, height: size, borderRadius: 12,
            background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 12px ${gradient[1]}55`,
        }}>
            <span style={{
                color: '#fff', fontWeight: 800,
                fontSize: size * 0.31, letterSpacing: '-0.02em',
            }}>
                {initials}
            </span>
        </div>
    );
}

function StarRow({ rating, reviews }: { rating: number; reviews: number }) {
    return (
        <Flex align="center" gap={6}>
            <Rate
                disabled
                defaultValue={rating}
                allowHalf
                style={{ fontSize: 12, color: '#F59E0B' }}
            />
            <Text style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>{rating}</Text>
            <Text style={{ fontSize: 12, color: MUTED }}>({reviews})</Text>
        </Flex>
    );
}

function BusinessCard({
    business,
    onClick,
}: {
    business: Business;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            style={{
                background: CARD_BG,
                border: `1.5px solid ${BORDER}`,
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                cursor: 'pointer',
                transition: 'box-shadow 0.18s, border-color 0.18s, transform 0.18s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
                (e.currentTarget as HTMLDivElement).style.borderColor = RED_MID;
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.borderColor = BORDER;
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
        >
            <Flex align="flex-start" gap={12}>
                <LogoBadge initials={business.initials} gradient={business.gradient} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 15, color: TEXT, display: 'block' }}>
                        {business.name}
                    </Text>
                    <Text style={{
                        fontSize: 12, color: MUTED,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {business.tagline}
                    </Text>
                </div>
            </Flex>

            <Flex gap={6} wrap="wrap">
                {business.tags.slice(0, 3).map(t => (
                    <Tag key={t} style={{
                        background: RED_LIGHT, color: RED,
                        border: `1px solid ${RED_MID}`,
                        borderRadius: 999, fontSize: 11, fontWeight: 600,
                        padding: '1px 10px', margin: 0,
                    }}>
                        {t}
                    </Tag>
                ))}
            </Flex>

            <StarRow rating={business.rating} reviews={business.reviews} />

            <Flex align="center" gap={5}>
                <EnvironmentOutlined style={{ fontSize: 12, color: MUTED }} />
                <Text style={{ fontSize: 12, color: MUTED }}>{business.location}</Text>
            </Flex>

            <Button
                type="primary"
                block
                style={{
                    marginTop: 4,
                    background: RED,
                    borderColor: RED,
                    borderRadius: 10,
                    fontWeight: 700,
                    height: 40,
                }}
                onClick={e => { e.stopPropagation(); onClick(); }}
            >
                View Profile <RightOutlined />
            </Button>
        </div>
    );
}

function DetailDrawer({
    business,
    onClose,
}: {
    business: Business | null;
    onClose: () => void;
}) {
    const [enquirySent, setEnquirySent] = useState(false);
    const [form] = Form.useForm();

    const handleSend = () => {
        form.validateFields().then(() => {
            setEnquirySent(true);
            form.resetFields();
        });
    };

    if (!business) return null;

    const photoColors = business.photos.map(p => p.split(','));

    return (
        <Drawer
            open={!!business}
            onClose={() => { setEnquirySent(false); onClose(); }}
            width={560}
            styles={{
                header: { padding: '18px 24px', borderBottom: `1px solid ${BORDER}` },
                body: { padding: 0 },
            }}
            title={
                <Flex align="center" gap={12}>
                    <LogoBadge initials={business.initials} gradient={business.gradient} size={40} />
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: TEXT }}>{business.name}</div>
                        <div style={{ fontSize: 12, color: MUTED, fontWeight: 400 }}>{business.category}</div>
                    </div>
                </Flex>
            }
        >
            <div style={{
                height: 120,
                background: `linear-gradient(135deg, ${business.gradient[0]}, ${business.gradient[1]})`,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {[
                    { w: 160, h: 160, top: -50, right: -30 },
                    { w: 100, h: 100, bottom: -30, left: 40 },
                ].map((c, i) => (
                    <div key={i} style={{
                        position: 'absolute', width: c.w, height: c.h,
                        borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
                        top: c.top, right: c.right, bottom: c.bottom, left: c.left,
                    }} />
                ))}
                <div style={{ position: 'absolute', bottom: 16, left: 24, right: 24 }}>
                    <StarRow rating={business.rating} reviews={business.reviews} />
                    <Flex align="center" gap={5} style={{ marginTop: 4 }}>
                        <EnvironmentOutlined style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }} />
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>{business.location}</Text>
                    </Flex>
                </div>
            </div>

            <Tabs
                defaultActiveKey="overview"
                style={{ padding: '0 24px' }}
                items={[
                    {
                        key: 'overview',
                        label: 'Overview',
                        children: (
                            <div style={{ paddingBottom: 32 }}>
                                <div style={{
                                    background: '#FAFAFA', border: `1px solid ${BORDER}`,
                                    borderRadius: 12, padding: 16, marginBottom: 20,
                                }}>
                                    <Text strong style={{ fontSize: 14, color: TEXT, display: 'block', marginBottom: 8 }}>
                                        About {business.name}
                                    </Text>
                                    <Paragraph style={{ fontSize: 13.5, color: MUTED, margin: 0, lineHeight: 1.7 }}>
                                        {business.about}
                                    </Paragraph>
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <Text strong style={{ fontSize: 13, color: TEXT, display: 'block', marginBottom: 10 }}>
                                        Specialisations
                                    </Text>
                                    <Flex gap={8} wrap="wrap">
                                        {business.tags.map(t => (
                                            <Tag key={t} style={{
                                                background: RED_LIGHT, color: RED,
                                                border: `1px solid ${RED_MID}`,
                                                borderRadius: 999, fontSize: 12,
                                                fontWeight: 600, padding: '3px 12px', margin: 0,
                                            }}>
                                                {t}
                                            </Tag>
                                        ))}
                                    </Flex>
                                </div>

                                <div>
                                    <Text strong style={{ fontSize: 13, color: TEXT, display: 'block', marginBottom: 10 }}>
                                        Photo Gallery
                                    </Text>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: 10,
                                    }}>
                                        {photoColors.map((colors, i) => (
                                            <div key={i} style={{
                                                height: 80, borderRadius: 10,
                                                background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: 'services',
                        label: 'Services',
                        children: (
                            <div style={{ paddingBottom: 32 }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 12,
                                }}>
                                    {business.services.map((svc, i) => (
                                        <div key={i} style={{
                                            background: '#FAFAFA',
                                            border: `1px solid ${BORDER}`,
                                            borderRadius: 12, padding: 16,
                                        }}>
                                            <Flex align="flex-start" gap={10}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: 8,
                                                    background: RED_LIGHT,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}>
                                                    <CheckCircleFilled style={{ color: RED, fontSize: 14 }} />
                                                </div>
                                                <div>
                                                    <Text strong style={{ fontSize: 13, color: TEXT, display: 'block' }}>
                                                        {svc.name}
                                                    </Text>
                                                    <Text style={{ fontSize: 12, color: MUTED }}>
                                                        {svc.desc}
                                                    </Text>
                                                </div>
                                            </Flex>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: 'contact',
                        label: 'Contact',
                        children: (
                            <div style={{ paddingBottom: 32 }}>
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <div style={{
                                            background: '#FAFAFA',
                                            border: `1px solid ${BORDER}`,
                                            borderRadius: 12, padding: 16, marginBottom: 16,
                                        }}>
                                            <Text strong style={{ fontSize: 14, color: TEXT, display: 'block', marginBottom: 14 }}>
                                                Contact Details
                                            </Text>
                                            {[
                                                {
                                                    icon: <PhoneOutlined style={{ color: RED }} />,
                                                    label: 'Phone', value: business.phone,
                                                    href: `tel:${business.phone}`,
                                                },
                                                {
                                                    icon: <MailOutlined style={{ color: RED }} />,
                                                    label: 'Email', value: business.email,
                                                    href: `mailto:${business.email}`,
                                                },
                                                {
                                                    icon: <LinkOutlined style={{ color: RED }} />,
                                                    label: 'Website', value: business.website,
                                                    href: `https://${business.website}`,
                                                },
                                                {
                                                    icon: <EnvironmentOutlined style={{ color: RED }} />,
                                                    label: 'Location', value: business.location,
                                                    href: undefined,
                                                },
                                            ].map((row, i) => (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', gap: 14,
                                                    padding: '10px 0',
                                                    borderBottom: i < 3 ? `1px solid ${BORDER}` : 'none',
                                                }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: 8,
                                                        background: RED_LIGHT,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}>
                                                        {row.icon}
                                                    </div>
                                                    <div>
                                                        <Text style={{ fontSize: 11, color: MUTED, display: 'block' }}>{row.label}</Text>
                                                        {row.href ? (
                                                            <a href={row.href} target="_blank" rel="noreferrer"
                                                                style={{ fontSize: 13.5, color: TEXT, fontWeight: 500 }}>
                                                                {row.value}
                                                            </a>
                                                        ) : (
                                                            <Text style={{ fontSize: 13.5, color: TEXT, fontWeight: 500 }}>{row.value}</Text>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div style={{
                                            background: '#FAFAFA',
                                            border: `1px solid ${BORDER}`,
                                            borderRadius: 12, padding: 16,
                                        }}>
                                            <Text strong style={{ fontSize: 14, color: TEXT, display: 'block', marginBottom: 14 }}>
                                                Send an Enquiry
                                            </Text>

                                            {enquirySent ? (
                                                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                                    <CheckCircleFilled style={{ color: '#16A34A', fontSize: 40, display: 'block', marginBottom: 14 }} />
                                                    <Text strong style={{ fontSize: 15, color: TEXT, display: 'block', marginBottom: 6 }}>
                                                        Enquiry Sent!
                                                    </Text>
                                                    <Text style={{ fontSize: 13, color: MUTED }}>
                                                        {business.name} will be in touch soon.
                                                    </Text>
                                                    <Button
                                                        style={{ marginTop: 16, borderRadius: 8 }}
                                                        onClick={() => setEnquirySent(false)}
                                                    >
                                                        Send another
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Form form={form} layout="vertical" size="large">
                                                    <Row gutter={12}>
                                                        <Col span={12}>
                                                            <Form.Item name="name" label="Your Name" rules={[{ required: true }]}>
                                                                <Input placeholder="John Smith" style={{ borderRadius: 8 }} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                                                <Input placeholder="john@company.ae" style={{ borderRadius: 8 }} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                    <Form.Item name="phone" label="Phone">
                                                        <Input placeholder="+971 5X XXX XXXX" style={{ borderRadius: 8 }} />
                                                    </Form.Item>
                                                    <Form.Item name="message" label="Message" rules={[{ required: true }]}>
                                                        <TextArea
                                                            rows={3}
                                                            placeholder={`Hello, I'd like to enquire about ${business.name}…`}
                                                            style={{ borderRadius: 8 }}
                                                        />
                                                    </Form.Item>
                                                    <Button
                                                        type="primary"
                                                        block
                                                        icon={<SendOutlined />}
                                                        onClick={handleSend}
                                                        style={{
                                                            background: RED, borderColor: RED,
                                                            borderRadius: 10, fontWeight: 700, height: 44,
                                                        }}
                                                    >
                                                        Send Enquiry
                                                    </Button>
                                                </Form>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        ),
                    },
                ]}
            />
        </Drawer>
    );
}

export default function BusinessListings() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [selected, setSelected] = useState<Business | null>(null);

    const filtered = BUSINESSES.filter(b => {
        const matchCat = activeCategory === 'All' || b.category === activeCategory;
        const q = search.toLowerCase().trim();
        const matchSearch = !q
            || b.name.toLowerCase().includes(q)
            || b.tagline.toLowerCase().includes(q)
            || b.category.toLowerCase().includes(q)
            || b.tags.some(t => t.toLowerCase().includes(q));
        return matchCat && matchSearch;
    });

    const featured = !search && activeCategory === 'All'
        ? BUSINESSES.filter(b => b.featured)
        : null;
    const showAll = search || activeCategory !== 'All';

    return (
        <Content>
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Business Listings</Title>
                <Text style={{ color: MUTED, fontSize: 14 }}>
                    Discover trusted UAE businesses across every industry.
                </Text>
            </div>

            <div style={{
                background: `linear-gradient(135deg, #1a0000 0%, #FF3A3A 100%)`,
                borderRadius: 20, padding: '32px 32px 28px', marginBottom: 28,
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -100, right: -60 }} />
                <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', bottom: -60, left: 200 }} />

                <Row gutter={[32, 24]} align="middle">
                    <Col xs={24} lg={15}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'rgba(255,255,255,0.15)', color: 'white',
                            fontWeight: 700, fontSize: 12, padding: '4px 12px',
                            borderRadius: 999, marginBottom: 12, border: '1px solid rgba(255,255,255,0.2)',
                        }}>
                            <StarFilled style={{ fontSize: 11 }} />
                            UAE's Business Directory
                        </span>
                        <Title level={2} style={{ color: 'white', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                            Find the best businesses<br />in the UAE
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, display: 'block', marginBottom: 20 }}>
                            Real estate, PRO services, legal, tech and more — all in one place.
                        </Text>

                        <Flex gap={10}>
                            <Input
                                size="large"
                                prefix={<SearchOutlined style={{ color: MUTED }} />}
                                placeholder="Search businesses, categories…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                allowClear
                                style={{
                                    borderRadius: 12, maxWidth: 400,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    background: 'rgba(255,255,255,0.95)',
                                    fontSize: 14,
                                }}
                            />
                        </Flex>

                        <Flex gap={8} wrap="wrap" style={{ marginTop: 16 }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                                        border: 'none', cursor: 'pointer', borderRadius: 999,
                                        padding: '6px 14px',
                                        background: activeCategory === cat ? 'white' : 'rgba(255,255,255,0.18)',
                                        color: activeCategory === cat ? RED : 'white',
                                        transition: 'background 0.15s, color 0.15s',
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </Flex>
                    </Col>

                    <Col xs={24} lg={9}>
                        <div style={{
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            borderRadius: 16, padding: '22px 22px 20px',
                            backdropFilter: 'blur(8px)',
                        }}>
                            <Text style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
                                display: 'block', marginBottom: 8,
                            }}>
                                For Businesses
                            </Text>
                            <Title level={4} style={{ color: 'white', margin: '0 0 8px' }}>
                                Grow Your Business
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, display: 'block', marginBottom: 16 }}>
                                Join 240+ UAE businesses already getting discovered by thousands of clients every day.
                            </Text>
                            <Button
                                block
                                size="large"
                                style={{
                                    background: 'white', borderColor: 'white',
                                    color: RED, fontWeight: 700,
                                    borderRadius: 10, height: 44,
                                }}
                            >
                                Set Up Your Listing →
                            </Button>
                            <Flex align="center" gap={8} style={{ marginTop: 14 }}>
                                {['#FF3A3A', '#3B82F6', '#059669', '#7C3AED'].map((c, i) => (
                                    <div key={i} style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: c, border: '2px solid rgba(255,255,255,0.7)',
                                        marginLeft: i > 0 ? -10 : 0, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 10, fontWeight: 700,
                                    }}>
                                        {['L', 'R', 'M', 'S'][i]}
                                    </div>
                                ))}
                                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginLeft: 8 }}>
                                    240+ businesses listed
                                </Text>
                            </Flex>
                        </div>
                    </Col>
                </Row>
            </div>

            {showAll ? (
                <>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 18 }}>
                        <div>
                            <Title level={5} style={{ margin: 0 }}>
                                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                                {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
                                {search ? ` for "${search}"` : ''}
                            </Title>
                        </div>
                        {(search || activeCategory !== 'All') && (
                            <Button
                                type="link"
                                style={{ color: RED, padding: 0 }}
                                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                            >
                                Clear filters
                            </Button>
                        )}
                    </Flex>

                    {filtered.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '60px 0',
                            background: CARD_BG, border: `1px dashed ${BORDER}`,
                            borderRadius: 16,
                        }}>
                            <Text style={{ fontSize: 15, color: MUTED }}>
                                No businesses match your search. Try different keywords.
                            </Text>
                        </div>
                    ) : (
                        <Row gutter={[20, 20]}>
                            {filtered.map(b => (
                                <Col key={b.id} xs={24} sm={12} lg={8}>
                                    <BusinessCard business={b} onClick={() => setSelected(b)} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            ) : (
                <>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 18 }}>
                        <div>
                            <Title level={5} style={{ margin: 0 }}>Featured Businesses</Title>
                            <Text style={{ fontSize: 13, color: MUTED }}>
                                Hand-picked top performers across the UAE
                            </Text>
                        </div>
                        <Button
                            type="link"
                            style={{ color: RED, padding: 0, fontWeight: 600 }}
                            onClick={() => setActiveCategory('All')}
                        >
                            Browse all →
                        </Button>
                    </Flex>
                    <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
                        {(featured ?? []).map(b => (
                            <Col key={b.id} xs={24} sm={12} lg={8}>
                                <BusinessCard business={b} onClick={() => setSelected(b)} />
                            </Col>
                        ))}
                    </Row>

                    <div style={{
                        background: `linear-gradient(135deg, #1a0000 0%, ${RED} 100%)`,
                        borderRadius: 20, padding: '40px 40px', textAlign: 'center',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -80, right: -60 }} />
                        <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', bottom: -40, left: 80 }} />
                        <Text style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                            color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
                            display: 'block', marginBottom: 10,
                        }}>
                            Join Peko Today
                        </Text>
                        <Title level={3} style={{ color: 'white', margin: '0 0 10px' }}>
                            Ready to grow your business?
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, display: 'block', marginBottom: 24 }}>
                            Thousands of UAE clients are searching for businesses just like yours every day.
                        </Text>
                        <Button
                            size="large"
                            style={{
                                background: 'white', borderColor: 'white',
                                color: RED, fontWeight: 700,
                                borderRadius: 12, height: 48, paddingInline: 32,
                            }}
                        >
                            Set Up Your Listing Account →
                        </Button>
                    </div>
                </>
            )}

            <DetailDrawer business={selected} onClose={() => setSelected(null)} />
        </Content>
    );
}
