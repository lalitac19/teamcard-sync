import { useState } from 'react';

import {
    ArrowRightOutlined,
    CheckCircleFilled,
    ClockCircleFilled,
    CloseCircleFilled,
    CopyOutlined,
    ExclamationCircleFilled,
    FileTextOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Flex, Progress, Row, Tag, Tooltip, Typography } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useLocation, useNavigate } from 'react-router-dom';

const { Text, Paragraph } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = 'approved' | 'under_review' | 'pending_docs' | 'rejected';

interface AppliedService {
    id: string;
    name: string;
    category: string;
    icon: string;
    status: AppStatus;
    statusLabel: string;
    submittedDate: string;
    nextStep?: string;
    approvedLimit?: string;
}

interface AvailableService {
    id: string;
    name: string;
    category: string;
    icon: string;
    desc: string;
    eligibilityPct: number;
    missingFields: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RED = '#FF3A3A';
const RED_LIGHT = '#FFF0EE';
const BORDER = '#E4E7EC';

const STATUS_CONFIG: Record<AppStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    approved:      { color: '#10B981', bg: '#ECFDF5', icon: <CheckCircleFilled />,      label: 'Approved' },
    under_review:  { color: '#F59E0B', bg: '#FFFBEB', icon: <SyncOutlined spin />,       label: 'Under Review' },
    pending_docs:  { color: '#6366F1', bg: '#EEF2FF', icon: <ExclamationCircleFilled />, label: 'Pending Documents' },
    rejected:      { color: '#EF4444', bg: '#FEF2F2', icon: <CloseCircleFilled />,       label: 'Not Eligible' },
};

const ALL_APPLIED: AppliedService[] = [
    { id: 'bank-account',    name: 'Business Bank Account', category: 'Banking',   icon: '🏦', status: 'approved',     statusLabel: 'Account active',       submittedDate: '10 Jul 2026', approvedLimit: 'AED current account' },
    { id: 'corp-card',       name: 'Corporate Credit Card', category: 'Cards',     icon: '💳', status: 'approved',     statusLabel: 'Card being printed',    submittedDate: '10 Jul 2026', approvedLimit: 'Up to AED 250,000' },
    { id: 'payroll',         name: 'WPS Payroll',           category: 'HR',        icon: '👥', status: 'under_review', statusLabel: '2–3 business days',     submittedDate: '10 Jul 2026', nextStep: 'MOHRE verification in progress' },
    { id: 'invoicing',       name: 'e-Invoicing (Peppol)',  category: 'Payments',  icon: '🧾', status: 'under_review', statusLabel: 'Awaiting TRN match',    submittedDate: '10 Jul 2026', nextStep: 'FTA cross-check running' },
    { id: 'working-capital', name: 'Working Capital',       category: 'Financing', icon: '💰', status: 'pending_docs', statusLabel: 'Upload audited accounts',submittedDate: '10 Jul 2026', nextStep: 'Upload 2 years of audited financials to proceed' },
    { id: 'payment-gateway', name: 'Payment Gateway',       category: 'Payments',  icon: '🌐', status: 'pending_docs', statusLabel: 'Website verification',  submittedDate: '10 Jul 2026', nextStep: 'Add a DNS TXT record to verify domain ownership' },
];

const ALL_AVAILABLE: AvailableService[] = [
    {
        id: 'eor', name: 'Employer of Record', category: 'HR', icon: '🤝',
        desc: 'Hire and pay employees across the UAE without a local entity',
        eligibilityPct: 60,
        missingFields: ['Shareholding structure (directors field)', 'Registered POA document'],
    },
];

// ─── Components ───────────────────────────────────────────────────────────────

function StatTile({ label, value, color, bg, icon }: { label: string; value: string | number; color: string; bg: string; icon: React.ReactNode }) {
    return (
        <Card bodyStyle={{ padding: 18 }} style={{ border: `1px solid ${BORDER}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 10 }}>
                {icon}
            </div>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 2 }}>{label}</Text>
            <Text strong style={{ fontSize: 24, color, lineHeight: 1.1 }}>{value}</Text>
        </Card>
    );
}

function StatusBadge({ status }: { status: AppStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <Flex align="center" gap={5} style={{ background: cfg.bg, borderRadius: 20, padding: '4px 10px', width: 'fit-content' }}>
            <span style={{ color: cfg.color, fontSize: 12 }}>{cfg.icon}</span>
            <Text style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>{cfg.label}</Text>
        </Flex>
    );
}

function AppliedCard({ svc }: { svc: AppliedService }) {
    const cfg = STATUS_CONFIG[svc.status];
    return (
        <Card
            bodyStyle={{ padding: '18px 20px' }}
            style={{ border: `1px solid ${BORDER}`, borderRadius: 12, height: '100%' }}
        >
            <Flex justify="space-between" align="flex-start" style={{ marginBottom: 12 }}>
                <Flex align="center" gap={10}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: RED_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {svc.icon}
                    </div>
                    <div>
                        <Text strong style={{ display: 'block', fontSize: 14 }}>{svc.name}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{svc.category}</Text>
                    </div>
                </Flex>
                <StatusBadge status={svc.status} />
            </Flex>

            {svc.status === 'approved' && svc.approvedLimit && (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, color: '#065F46' }}>✓ {svc.approvedLimit}</Text>
                </div>
            )}

            {(svc.status === 'under_review' || svc.status === 'pending_docs') && svc.nextStep && (
                <div style={{ background: svc.status === 'pending_docs' ? '#EEF2FF' : '#FFFBEB', border: `1px solid ${svc.status === 'pending_docs' ? '#C7D2FE' : '#FDE68A'}`, borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, color: svc.status === 'pending_docs' ? '#4338CA' : '#92400E' }}>
                        {svc.status === 'pending_docs' ? '📎 ' : '⏱ '}{svc.nextStep}
                    </Text>
                </div>
            )}

            <Flex justify="space-between" align="center" style={{ marginTop: 'auto' }}>
                <Flex align="center" gap={4}>
                    <ClockCircleFilled style={{ color: '#CBD5E1', fontSize: 11 }} />
                    <Text type="secondary" style={{ fontSize: 11 }}>Submitted {svc.submittedDate}</Text>
                </Flex>
                {svc.status === 'pending_docs' && (
                    <Button size="small" type="primary" danger icon={<FileTextOutlined />}>
                        Upload docs
                    </Button>
                )}
            </Flex>
        </Card>
    );
}

function AvailableCard({ svc, onApply, onComplete }: {
    svc: AvailableService;
    onApply: () => void;
    onComplete: () => void;
}) {
    const isReady = svc.eligibilityPct === 100;
    const color   = isReady ? '#10B981' : svc.eligibilityPct >= 60 ? '#F59E0B' : '#94A3B8';

    return (
        <Card
            bodyStyle={{ padding: '18px 20px' }}
            style={{ border: `1px solid ${BORDER}`, borderRadius: 12, height: '100%' }}
        >
            <Flex align="center" gap={10} style={{ marginBottom: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#F8FAFC', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {svc.icon}
                </div>
                <div>
                    <Text strong style={{ display: 'block', fontSize: 14 }}>{svc.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{svc.category}</Text>
                </div>
            </Flex>

            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12, lineHeight: 1.5 }}>{svc.desc}</Text>

            <Progress percent={svc.eligibilityPct} showInfo={false} strokeColor={color} size="small" style={{ marginBottom: 4 }} />
            <Text style={{ fontSize: 12, color, fontWeight: 500, display: 'block', marginBottom: 12 }}>
                {isReady ? '✓ Ready to apply' : `${svc.eligibilityPct}% profile complete`}
            </Text>

            {!isReady && svc.missingFields.length > 0 && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                    <Text style={{ fontSize: 11, color: '#92400E', display: 'block', marginBottom: 4, fontWeight: 600 }}>Missing information:</Text>
                    {svc.missingFields.map((f, i) => (
                        <Text key={i} style={{ fontSize: 11, color: '#92400E', display: 'block' }}>• {f}</Text>
                    ))}
                </div>
            )}

            {isReady ? (
                <Button type="primary" danger block icon={<ArrowRightOutlined />} onClick={onApply}>
                    Apply now
                </Button>
            ) : (
                <Button block icon={<ArrowRightOutlined />} onClick={onComplete}
                    style={{ borderColor: '#F59E0B', color: '#92400E', background: '#FFFBEB' }}>
                    Complete profile to apply
                </Button>
            )}
        </Card>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OneKYBDashboard() {
    const location  = useLocation();
    const navigate  = useNavigate();
    const [copied,  setCopied]  = useState(false);
    const [activeFilter, setActiveFilter] = useState<AppStatus | 'all'>('all');

    const passedIds: string[] = (location.state as { appliedIds?: string[] })?.appliedIds ?? [];
    const appliedServices = passedIds.length > 0
        ? ALL_APPLIED.filter(s => passedIds.includes(s.id))
        : ALL_APPLIED;

    const filtered = activeFilter === 'all'
        ? appliedServices
        : appliedServices.filter(s => s.status === activeFilter);

    const counts = {
        approved:     appliedServices.filter(s => s.status === 'approved').length,
        under_review: appliedServices.filter(s => s.status === 'under_review').length,
        pending_docs: appliedServices.filter(s => s.status === 'pending_docs').length,
        total:        appliedServices.length,
    };

    const OKYB_ID = 'OKYB-AE-2026-00123456';

    const copyId = () => {
        navigator.clipboard?.writeText(OKYB_ID).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const goToQA = () => navigate('/more-services/one-kyb', { state: { jumpToStep: 1 } });

    return (
        <Content>
            {/* ── Header banner ── */}
            <div style={{
                background: 'linear-gradient(135deg, #FF3A3A 0%, #C0392B 100%)',
                borderRadius: 16,
                padding: '28px 32px',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
                <div style={{ position: 'absolute', right: 60, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
                <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
                    <div>
                        <Flex align="center" gap={8} style={{ marginBottom: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 0 3px rgba(74,222,128,.3)' }} />
                            <Text style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, fontWeight: 500 }}>OneKYB Verified</Text>
                        </Flex>
                        <Text style={{ color: '#fff', fontSize: 26, fontWeight: 700, display: 'block', marginBottom: 4 }}>Al Noor Trading LLC</Text>
                        <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>CN-1234567 · Dubai Economy & Tourism · LLC</Text>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 12, padding: '14px 20px', backdropFilter: 'blur(8px)', minWidth: 220 }}>
                        <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>Your OneKYB ID</Text>
                        <Flex align="center" gap={8}>
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: .5 }}>{OKYB_ID}</Text>
                            <Tooltip title={copied ? 'Copied!' : 'Copy ID'}>
                                <CopyOutlined
                                    style={{ color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 14 }}
                                    onClick={copyId}
                                />
                            </Tooltip>
                        </Flex>
                        <Text style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, marginTop: 4, display: 'block' }}>Share with any connected institution</Text>
                    </div>
                </Flex>
            </div>

            {/* ── Stats row ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
                <Col xs={12} sm={6}>
                    <StatTile label="Applied" value={counts.total} color={RED} bg={RED_LIGHT} icon="📋" />
                </Col>
                <Col xs={12} sm={6}>
                    <StatTile label="Approved" value={counts.approved} color="#10B981" bg="#ECFDF5" icon={<CheckCircleFilled />} />
                </Col>
                <Col xs={12} sm={6}>
                    <StatTile label="In Review" value={counts.under_review} color="#F59E0B" bg="#FFFBEB" icon={<SyncOutlined />} />
                </Col>
                <Col xs={12} sm={6}>
                    <StatTile label="Needs Action" value={counts.pending_docs} color="#6366F1" bg="#EEF2FF" icon={<ExclamationCircleFilled />} />
                </Col>
            </Row>

            {/* ── Applied services ── */}
            <Flex align="center" justify="space-between" style={{ marginBottom: 16 }} wrap="wrap" gap={10}>
                <Text strong style={{ fontSize: 16 }}>My Applications</Text>
                <Flex gap={6} wrap="wrap">
                    {(['all', 'approved', 'under_review', 'pending_docs'] as const).map(f => (
                        <Button
                            key={f}
                            size="small"
                            type={activeFilter === f ? 'primary' : 'default'}
                            danger={activeFilter === f}
                            onClick={() => setActiveFilter(f)}
                            style={{ borderRadius: 20 }}
                        >
                            {f === 'all' ? `All (${counts.total})` :
                             f === 'approved' ? `Approved (${counts.approved})` :
                             f === 'under_review' ? `In Review (${counts.under_review})` :
                             `Needs Action (${counts.pending_docs})`}
                        </Button>
                    ))}
                </Flex>
            </Flex>

            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                {filtered.map(svc => (
                    <Col key={svc.id} xs={24} sm={12} xl={8}>
                        <AppliedCard svc={svc} />
                    </Col>
                ))}
            </Row>

            {/* ── Available services ── */}
            {ALL_AVAILABLE.length > 0 && (
                <>
                    <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
                        <div>
                            <Text strong style={{ fontSize: 16, display: 'block' }}>More Services Available</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Complete your profile to unlock additional services — no re-submission required.
                            </Text>
                        </div>
                    </Flex>

                    <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16 }}>💡</span>
                        <div>
                            <Text style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>Some services need more information. </Text>
                            <Text
                                style={{ fontSize: 13, color: RED, cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={goToQA}
                            >
                                Complete your business profile →
                            </Text>
                        </div>
                    </div>

                    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                        {ALL_AVAILABLE.map(svc => (
                            <Col key={svc.id} xs={24} sm={12} xl={8}>
                                <AvailableCard
                                    svc={svc}
                                    onApply={() => navigate('/more-services/one-kyb', { state: { jumpToStep: 6 } })}
                                    onComplete={goToQA}
                                />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* ── Verified identity panel ── */}
            <Card
                bodyStyle={{ padding: '20px 24px' }}
                style={{ border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 24 }}
            >
                <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
                    <div>
                        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>OneKYB Verified Identity</Text>
                        <Paragraph type="secondary" style={{ margin: 0, fontSize: 12, maxWidth: 520 }}>
                            Your verified status is active and can be shared with any connected institution — banks, payment processors, and regulators — without re-submitting documents.
                        </Paragraph>
                    </div>
                    <Flex gap={8}>
                        <Button icon={<CopyOutlined />} onClick={copyId}>
                            {copied ? 'Copied!' : 'Copy OneKYB ID'}
                        </Button>
                        <Button type="primary" danger onClick={() => navigate('/more-services/one-kyb')}>
                            Update profile
                        </Button>
                    </Flex>
                </Flex>

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                    <Row gutter={[24, 12]}>
                        {[
                            { label: 'Legal entity', value: 'Al Noor Trading LLC' },
                            { label: 'Licence no.',  value: 'CN-1234567' },
                            { label: 'TRN',          value: '1000324789800003' },
                            { label: 'KYB status',   value: '✓ Verified', color: '#10B981' },
                            { label: 'Last updated', value: '10 Jul 2026' },
                            { label: 'Expires',      value: '10 Jul 2027' },
                        ].map(r => (
                            <Col key={r.label} xs={12} sm={8} md={4}>
                                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 2 }}>{r.label}</Text>
                                <Text strong style={{ fontSize: 12, color: r.color }}>{r.value}</Text>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Card>
        </Content>
    );
}
