import { useState, useMemo, useEffect, useRef } from 'react';

import {
    Button,
    Card,
    Checkbox,
    Col,
    Collapse,
    Divider,
    Flex,
    Input,
    Progress,
    Radio,
    Row,
    Select,
    Skeleton,
    Steps,
    Tag,
    Typography,
    Upload,
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    FileSearchOutlined,
    InboxOutlined,
    RobotOutlined,
    UserAddOutlined,
    UserOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Dragger } = Upload;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service {
    id: string;
    name: string;
    category: string;
    desc: string;
    icon: string;
    requiredFields: string[];
}

interface QAQuestion {
    key: string;
    label: string;
    type: 'radio' | 'select' | 'input';
    options?: string[];
    placeholder?: string;
    note?: string;
    unlocks?: string[];
}

interface QASection {
    id: string;
    title: string;
    icon: string;
    sub: string;
    questions: QAQuestion[];
}

interface Owner {
    id: string;
    name: string;
    pct: number;
    role: string;
    nationality: string;
    initials: string;
    kyc: 'complete' | 'pending';
}

interface ExtractedField {
    key: string;
    label: string;
    val: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_ITEMS = [
    { title: 'Trade Licence' },
    { title: 'Business Details' },
    { title: 'Company Documents' },
    { title: 'Financials' },
    { title: 'Ownership' },
    { title: 'Review' },
    { title: 'Services' },
];

const SERVICES: Service[] = [
    { id: 'bank-account',    name: 'Business Bank Account', category: 'Banking',   icon: '🏦', desc: 'AED current account with UAEFTS & SWIFT',            requiredFields: ['legal_name','licence_no','authority','entity_type','trn','sh1_name','kyc_director'] },
    { id: 'working-capital', name: 'Working Capital',       category: 'Financing', icon: '💰', desc: 'Short-term financing up to AED 2M based on revenue', requiredFields: ['legal_name','licence_no','avg_monthly_inflow','avg_balance','annual_turnover','years_trading','kyc_director','sh1_name'] },
    { id: 'invoicing',       name: 'e-Invoicing (Peppol)',  category: 'Payments',  icon: '🧾', desc: 'UAE-compliant e-Invoicing with VAT filing',          requiredFields: ['legal_name','trn','vat_registered','activity'] },
    { id: 'corp-card',       name: 'Corporate Credit Card', category: 'Cards',     icon: '💳', desc: 'Visa Business card up to AED 250K limit',           requiredFields: ['legal_name','avg_monthly_inflow','avg_balance','bounce_count','years_trading','annual_turnover','kyc_director'] },
    { id: 'payroll',         name: 'WPS Payroll',           category: 'HR',        icon: '👥', desc: 'MOHRE-compliant payroll via Wages Protection System', requiredFields: ['legal_name','licence_no','employee_count','mol_registered'] },
    { id: 'payment-gateway', name: 'Payment Gateway',       category: 'Payments',  icon: '🌐', desc: 'Accept online & in-store payments, multi-currency',  requiredFields: ['legal_name','trn','avg_monthly_inflow','website_url','ecommerce_pct','avg_ticket_size'] },
    { id: 'trade-finance',   name: 'Trade Finance',         category: 'Trade',     icon: '🚢', desc: 'Letters of credit, bank guarantees, and SCF',       requiredFields: ['legal_name','avg_monthly_inflow','annual_turnover','intl_pct','trade_partners','years_trading','audited_accounts'] },
    { id: 'eor',             name: 'Employer of Record',   category: 'HR',        icon: '🤝', desc: 'Hire and pay employees across the UAE without a local entity', requiredFields: ['legal_name','licence_no','sh1_name','directors'] },
];

const QA_SECTIONS: QASection[] = [
    {
        id: 'basics', title: 'Business basics', icon: '🏢', sub: 'Pre-filled where possible from your trade licence',
        questions: [
            { key: 'years_trading',       label: 'Years in business',           type: 'radio',  options: ['< 1 year','1–2 years','2–5 years','5–10 years','10+ years'], note: 'Required by banks to assess lending risk.',   unlocks: ['working-capital','corp-card','trade-finance'] },
            { key: 'employee_count',      label: 'Number of employees',         type: 'radio',  options: ['1–5','6–20','21–50','51–200','200+'],                         note: 'Required for WPS payroll setup.',             unlocks: ['payroll'] },
            { key: 'monthly_revenue_band',label: 'Average monthly revenue',     type: 'radio',  options: ['< AED 100K','AED 100K–500K','AED 500K–2M','AED 2M–10M','> AED 10M'], note: 'Determines working capital limits.', unlocks: ['working-capital','corp-card','payment-gateway'] },
        ],
    },
    {
        id: 'banking', title: 'Banking & accounts', icon: '🏦', sub: 'Information for your business current account',
        questions: [
            { key: 'existing_bank',          label: 'Existing UAE business bank account?',    type: 'radio',  options: ['Yes – same bank','Yes – different bank','No – first account'], unlocks: ['bank-account'] },
            { key: 'expected_monthly_txns',  label: 'Expected monthly incoming transactions', type: 'select', options: ['Under 20','20–100','100–500','500–2,000','2,000+'],             unlocks: ['bank-account'] },
            { key: 'expected_intl',          label: 'Expect international wire transfers?',   type: 'radio',  options: ['Yes – regularly','Yes – occasionally','No'],                  unlocks: ['bank-account','trade-finance'] },
        ],
    },
    {
        id: 'financing', title: 'Financing & credit', icon: '💰', sub: 'For working capital and card eligibility',
        questions: [
            { key: 'finance_purpose',  label: 'Primary use for working capital',     type: 'radio',  options: ['Stock / inventory','Payroll bridging','Supplier payments','Expansion','Other'], unlocks: ['working-capital'] },
            { key: 'outstanding_loans',label: 'Existing bank facilities?',           type: 'radio',  options: ['None','Yes – one facility','Yes – multiple'],                                    unlocks: ['working-capital','corp-card'] },
            { key: 'desired_limit',    label: 'Desired working capital limit (AED)', type: 'select', options: ['Up to 100,000','100K–500K','500K–1M','1M–2M'],                                  unlocks: ['working-capital'] },
        ],
    },
    {
        id: 'invoicing', title: 'VAT & e-Invoicing', icon: '🧾', sub: 'Required for Peppol e-Invoicing registration',
        questions: [
            { key: 'vat_registered',  label: 'Is the business VAT registered?', type: 'radio', options: ['Yes','No – below threshold','In progress'], unlocks: ['invoicing'] },
            { key: 'avg_invoices_pm', label: 'Average invoices per month',       type: 'radio', options: ['< 10','10–50','50–200','200–1,000','1,000+'], unlocks: ['invoicing'] },
        ],
    },
    {
        id: 'payments', title: 'Payments & e-commerce', icon: '🌐', sub: 'For payment gateway setup',
        questions: [
            { key: 'website_url',     label: 'Business website URL',               type: 'input', placeholder: 'https://alnoor.ae', unlocks: ['payment-gateway'] },
            { key: 'ecommerce_pct',   label: '% of sales online',                  type: 'radio', options: ['< 10%','10–30%','30–60%','60–90%','> 90%'],                 unlocks: ['payment-gateway'] },
            { key: 'avg_ticket_size', label: 'Average customer transaction (AED)', type: 'radio', options: ['< AED 100','AED 100–500','AED 500–2K','AED 2K–10K','> AED 10K'], unlocks: ['payment-gateway'] },
        ],
    },
    {
        id: 'trade', title: 'Trade & international', icon: '🚢', sub: 'For trade finance and letters of credit',
        questions: [
            { key: 'trade_partners',       label: 'Primary trade corridors',     type: 'radio', options: ['GCC only','Asia (India/China/SE Asia)','Europe','USA/Americas','Global'], unlocks: ['trade-finance'] },
            { key: 'import_export',        label: 'The business is primarily',   type: 'radio', options: ['Importer','Exporter','Both'], unlocks: ['trade-finance'] },
            { key: 'has_audited_accounts', label: '2+ years of audited accounts?',type: 'radio', options: ['Yes – available','Yes – need 2–4 weeks','No'], unlocks: ['trade-finance'] },
        ],
    },
];

const MOCK_LICENCE_FIELDS: ExtractedField[] = [
    { key: 'legal_name',         label: 'Legal entity name',   val: 'Al Noor Trading LLC' },
    { key: 'trade_name',         label: 'Trade name',           val: 'Al Noor' },
    { key: 'licence_no',         label: 'Trade licence no.',    val: 'CN-1234567' },
    { key: 'authority',          label: 'Issuing authority',    val: 'Dubai Economy & Tourism (DED)' },
    { key: 'expiry',             label: 'Licence expiry',       val: '31 Dec 2025' },
    { key: 'activity',           label: 'Business activity',    val: 'General Trading' },
    { key: 'entity_type',        label: 'Entity type',          val: 'LLC' },
    { key: 'trn',                label: 'Tax Registration No.', val: '1000324789800003' },
    { key: 'emirate',            label: 'Emirate',              val: 'Dubai' },
    { key: 'incorporation_date', label: 'Incorporation date',   val: '14 Mar 2019' },
];

const MOCK_MOA_FIELDS: ExtractedField[] = [
    { key: 'share_capital', label: 'Share capital (AED)', val: '300,000' },
    { key: 'sh1_name',      label: 'Shareholder 1',       val: 'Ahmed Al Mansoori' },
    { key: 'sh1_pct',       label: 'Shareholder 1 %',     val: '60%' },
    { key: 'sh2_name',      label: 'Shareholder 2',       val: 'Gulf Holding Group LLC' },
    { key: 'sh2_pct',       label: 'Shareholder 2 %',     val: '40%' },
    { key: 'directors',     label: 'Director(s)',          val: 'Ahmed Al Mansoori' },
];

const MOCK_FIN_FIELDS: ExtractedField[] = [
    { key: 'avg_monthly_inflow', label: 'Avg monthly inflow (AED)',  val: '1,240,000' },
    { key: 'avg_balance',        label: 'Avg monthly balance (AED)', val: '420,000' },
    { key: 'annual_turnover',    label: 'Annualised revenue (AED)',   val: '14,880,000' },
    { key: 'bounce_count',       label: 'Returned cheques (6m)',      val: '0' },
    { key: 'intl_pct',           label: 'International txns %',       val: '28%' },
];

const MOCK_OWNERS: Owner[] = [
    { id: 'o1', name: 'Ahmed Al Mansoori', pct: 60, role: 'Managing Director', nationality: 'UAE',    initials: 'AM', kyc: 'complete' },
    { id: 'o2', name: 'Sara Rahman',       pct: 40, role: 'Director',          nationality: 'Indian', initials: 'SR', kyc: 'pending'  },
];

const DECLARATIONS = [
    'I confirm the business is not used for money laundering, terrorism financing, or proliferation financing.',
    'All beneficial owners disclosed are accurate under Cabinet Decision No. (109) of 2023.',
    'The business is not subject to any current regulatory sanctions or enforcement actions.',
    'I consent to ongoing monitoring, periodic KYB refresh, and sharing of verified status via OneKYB.',
];

const AI_LICENCE = `I can see this is a trade licence issued by Dubai Economy & Tourism (DED) for Al Noor Trading LLC, a Limited Liability Company registered on 14 March 2019. The licence covers General Trading activities and is valid until 31 Dec 2025. Tax Registration Number 1000324789800003 is present. 10 fields extracted — please review and confirm.`;
const AI_MOA     = `The Memorandum of Association shows 2 shareholders: Ahmed Al Mansoori (60%) and Gulf Holding Group LLC (40%). Share capital is AED 300,000. Ahmed Al Mansoori is listed as Managing Director.`;
const AI_FIN     = `Based on 6 months of statements, Al Noor Trading LLC shows an average monthly inflow of AED 1,240,000 with an average balance of AED 420,000. No returned cheques found. This profile qualifies for Corporate Credit Card up to AED 250,000 and Payment Gateway.`;

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useTypewriter(text: string, speed: number, trigger: boolean) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const idx = useRef(0);

    useEffect(() => {
        if (!trigger) { idx.current = 0; setDisplayed(''); setDone(false); return; }
        idx.current = 0;
        setDisplayed('');
        setDone(false);
        const id = setInterval(() => {
            idx.current += 1;
            setDisplayed(text.slice(0, idx.current));
            if (idx.current >= text.length) { clearInterval(id); setDone(true); }
        }, speed);
        return () => clearInterval(id);
    }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

    return { displayed, done };
}

// ─── Shared components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>
            {children}
        </Text>
    );
}

function InfoBox({ children }: { children: React.ReactNode }) {
    return <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#1E40AF', fontSize: 13, lineHeight: 1.6 }}>{children}</div>;
}
function SuccessBox({ children }: { children: React.ReactNode }) {
    return <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#065F46', fontSize: 13, lineHeight: 1.6 }}>{children}</div>;
}
function WarnBox({ children }: { children: React.ReactNode }) {
    return <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#92400E', fontSize: 13, lineHeight: 1.6 }}>{children}</div>;
}

function AIBox({ text, label }: { text: string; label: string }) {
    return (
        <div style={{ background: '#F0F7FF', border: '1px solid #BAE0FF', borderRadius: 6, padding: '14px 16px', marginBottom: 16 }}>
            <Flex align="center" gap={6} style={{ marginBottom: 8 }}>
                <RobotOutlined style={{ color: '#1677FF', fontSize: 13 }} />
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', color: '#1677FF' }}>{label}</Text>
            </Flex>
            <Text style={{ fontSize: 13, lineHeight: 1.7, color: '#595959' }}>{text}</Text>
        </div>
    );
}

function NavRow({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false }: {
    onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
    return (
        <Flex justify="space-between" align="center" style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid #F5F5F5' }}>
            {onBack
                ? <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ color: '#64748B' }}>Back</Button>
                : <div />
            }
            <Button type="primary" danger disabled={nextDisabled} onClick={onNext}>{nextLabel} →</Button>
        </Flex>
    );
}

function FieldRows({ fields }: { fields: ExtractedField[] }) {
    return (
        <>
            {fields.map((f, i) => (
                <div key={f.key} style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: 16, padding: '9px 0', borderBottom: i < fields.length - 1 ? '1px solid #F5F5F5' : 'none', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{f.label}</Text>
                    <Input size="small" defaultValue={f.val} />
                </div>
            ))}
        </>
    );
}

function EligibilityTracker({ filledFields, selectedServices }: { filledFields: Set<string>; selectedServices: Set<string> }) {
    const list = selectedServices.size > 0 ? SERVICES.filter(s => selectedServices.has(s.id)) : SERVICES;
    const readyCount = list.filter(s => s.requiredFields.every(f => filledFields.has(f))).length;
    return (
        <Card
            title={
                <Flex align="center" justify="space-between">
                    <Text strong style={{ fontSize: 13 }}>Services eligibility</Text>
                    <Tag color="red">{readyCount} ready</Tag>
                </Flex>
            }
            bodyStyle={{ padding: '14px 16px' }}
        >
            {list.map(svc => {
                const done  = svc.requiredFields.filter(f => filledFields.has(f)).length;
                const pct   = Math.round((done / svc.requiredFields.length) * 100);
                const color = pct === 100 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#D9D9D9';
                return (
                    <div key={svc.id} style={{ marginBottom: 12 }}>
                        <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
                            <Text style={{ fontSize: 12 }}>{svc.icon} {svc.name}</Text>
                            <Text style={{ fontSize: 11, fontWeight: 500, color }}>{pct === 100 ? '✓ Ready' : `${pct}%`}</Text>
                        </Flex>
                        <Progress percent={pct} showInfo={false} strokeColor={color} size="small" style={{ margin: 0 }} />
                    </div>
                );
            })}
        </Card>
    );
}

// ─── Step 0 ───────────────────────────────────────────────────────────────────

function StepLicence({ onNext, onExtracted }: { onNext: () => void; onExtracted: (f: Record<string, string>) => void }) {
    const [uploaded,    setUploaded]    = useState(false);
    const [extracting,  setExtracting]  = useState(false);
    const [aiTrigger,   setAiTrigger]   = useState(false);
    const [fieldsReady, setFieldsReady] = useState(false);
    const { displayed, done } = useTypewriter(AI_LICENCE, 14, aiTrigger);

    const handleUpload = () => {
        if (uploaded) return;
        setUploaded(true); setExtracting(true);
        setTimeout(() => { setExtracting(false); setAiTrigger(true); }, 1200);
    };

    useEffect(() => {
        if (!done) return;
        setTimeout(() => {
            const map: Record<string, string> = {};
            MOCK_LICENCE_FIELDS.forEach(f => { map[f.key] = f.val; });
            onExtracted(map);
            setFieldsReady(true);
        }, 400);
    }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <Text style={{ fontSize: 22, fontWeight: 600, display: 'block', marginBottom: 6 }}>Upload your trade licence</Text>
            <Paragraph type="secondary" style={{ marginBottom: 20 }}>
                Our AI reads your document and extracts all business details in seconds — no manual typing. You'll instantly see which services you're eligible for.
            </Paragraph>

            {!uploaded ? (
                <Dragger beforeUpload={() => { handleUpload(); return false; }} onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" style={{ marginBottom: 16 }}>
                    <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: '#FF3A3A' }} /></p>
                    <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Drop trade licence here</p>
                    <p style={{ fontSize: 12, color: '#94A3B8' }}>PDF, JPG, PNG · AI will extract all fields automatically</p>
                </Dragger>
            ) : (
                <div style={{ border: '1px solid #A7F3D0', borderRadius: 6, padding: '12px 16px', background: '#ECFDF5', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircleOutlined style={{ color: '#10B981', fontSize: 18 }} />
                    <div>
                        <Text strong>trade_licence.pdf</Text>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                            {fieldsReady ? `${MOCK_LICENCE_FIELDS.length} fields extracted` : 'AI is reading your document…'}
                        </Text>
                    </div>
                </div>
            )}

            {extracting && <Card bodyStyle={{ padding: '14px 16px' }} style={{ marginBottom: 16 }}><Skeleton active paragraph={{ rows: 3 }} /></Card>}
            {aiTrigger && !extracting && <AIBox text={displayed + (done ? '' : '|')} label="AI Analysis" />}

            {fieldsReady && (
                <>
                    <SuccessBox>
                        ✓ Based on your trade licence you're immediately eligible for <strong>Business Bank Account</strong>, <strong>e-Invoicing (Peppol)</strong>, and <strong>WPS Payroll</strong>. Upload financials to unlock credit products.
                    </SuccessBox>
                    <Card title={<Flex align="center" justify="space-between"><Text strong>Extracted fields</Text><Tag color="blue">Review &amp; confirm</Tag></Flex>} bodyStyle={{ padding: '0 16px' }}>
                        <FieldRows fields={MOCK_LICENCE_FIELDS} />
                    </Card>
                </>
            )}

            <NavRow onNext={onNext} nextDisabled={!fieldsReady} />
        </>
    );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function StepQA({ onBack, onNext, answers, setAnswers }: {
    onBack: () => void; onNext: () => void;
    answers: Record<string, string>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
    const [activeKeys, setActiveKeys] = useState<string[]>(['basics']);

    const items = QA_SECTIONS.map(section => {
        const answered = section.questions.filter(q => !!answers[q.key]).length;
        const total    = section.questions.length;
        return {
            key: section.id,
            style: { marginBottom: 10, border: '1px solid #E4E7EC', borderRadius: 8, overflow: 'hidden' as const },
            label: (
                <Flex align="center" gap={10} justify="space-between" style={{ width: '100%', paddingRight: 8 }}>
                    <Flex align="center" gap={10}>
                        <span style={{ fontSize: 18 }}>{section.icon}</span>
                        <div>
                            <Text strong style={{ display: 'block', fontSize: 13.5 }}>{section.title}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>{section.sub}</Text>
                        </div>
                    </Flex>
                    <Tag color={answered === total ? 'success' : 'default'}>{answered}/{total} answered</Tag>
                </Flex>
            ),
            children: (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
                    {section.questions.map(q => (
                        <div key={q.key}>
                            <Text strong style={{ display: 'block', marginBottom: q.note ? 2 : 8, fontSize: 13 }}>
                                {q.label} <span style={{ color: '#FF3A3A' }}>*</span>
                            </Text>
                            {q.note && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{q.note}</Text>}

                            {q.type === 'radio' && (
                                <Radio.Group value={answers[q.key]} onChange={e => setAnswers(p => ({ ...p, [q.key]: e.target.value }))}>
                                    <Flex wrap="wrap" gap={8}>
                                        {(q.options ?? []).map(opt => (
                                            <Radio.Button key={opt} value={opt} style={{ borderRadius: 6 }}>{opt}</Radio.Button>
                                        ))}
                                    </Flex>
                                </Radio.Group>
                            )}
                            {q.type === 'select' && (
                                <Select
                                    style={{ width: '100%', maxWidth: 380 }}
                                    value={answers[q.key] || undefined}
                                    placeholder="Select…"
                                    onChange={val => setAnswers(p => ({ ...p, [q.key]: val }))}
                                    options={(q.options ?? []).map(o => ({ value: o, label: o }))}
                                />
                            )}
                            {q.type === 'input' && (
                                <Input style={{ maxWidth: 380 }} placeholder={q.placeholder} value={answers[q.key] || ''} onChange={e => setAnswers(p => ({ ...p, [q.key]: e.target.value }))} />
                            )}

                            {q.unlocks && q.unlocks.length > 0 && (
                                <div style={{ marginTop: 8, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
                                    <Text style={{ fontSize: 12, color: '#92400E' }}>🔓 Unlocks:</Text>
                                    {q.unlocks.map(uid => {
                                        const svc = SERVICES.find(s => s.id === uid);
                                        return svc ? <Tag key={uid} style={{ fontSize: 11, margin: 0 }}>{svc.icon} {svc.name}</Tag> : null;
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ),
        };
    });

    return (
        <>
            <Text style={{ fontSize: 22, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tell us about your business</Text>
            <Paragraph type="secondary" style={{ marginBottom: 20 }}>
                A few questions to assess your eligibility for each service. The tracker on the right updates as you go.
            </Paragraph>
            <Collapse activeKey={activeKeys} onChange={keys => setActiveKeys(keys as string[])} items={items} style={{ background: 'transparent', border: 'none' }} />
            <NavRow onBack={onBack} onNext={onNext} />
        </>
    );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

const CORP_DOCS = [
    { key: 'moa',        icon: '📄', name: 'Memorandum & Articles of Association', sub: 'Shareholders, directors, company objects', required: true  },
    { key: 'coi',        icon: '📋', name: 'Certificate of Incorporation',          sub: 'Issued by registering authority',          required: true  },
    { key: 'incumbency', icon: '📃', name: 'Certificate of Incumbency',             sub: 'Current directors & officers',             required: false },
];

function StepCorpDocs({ onBack, onNext, onExtracted }: { onBack: () => void; onNext: () => void; onExtracted: (f: Record<string, string>) => void }) {
    const [uploaded,  setUploaded]  = useState<Set<string>>(new Set());
    const [aiTrigger, setAiTrigger] = useState(false);
    const [moaReady,  setMoaReady]  = useState(false);
    const { displayed, done } = useTypewriter(AI_MOA, 16, aiTrigger);

    const handleUpload = (key: string) => {
        setUploaded(p => new Set([...p, key]));
        if (key === 'moa') setTimeout(() => setAiTrigger(true), 1000);
    };

    useEffect(() => {
        if (!done) return;
        setTimeout(() => {
            const map: Record<string, string> = {};
            MOCK_MOA_FIELDS.forEach(f => { map[f.key] = f.val; });
            onExtracted(map);
            setMoaReady(true);
        }, 300);
    }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <Text style={{ fontSize: 22, fontWeight: 600, display: 'block', marginBottom: 6 }}>Corporate documents</Text>
            <Paragraph type="secondary" style={{ marginBottom: 20 }}>
                AI will extract shareholders, directors, and company structure from your MOA — pre-filling the ownership step automatically.
            </Paragraph>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {CORP_DOCS.map(doc => {
                    const isUp = uploaded.has(doc.key);
                    return (
                        <Dragger key={doc.key} beforeUpload={() => { handleUpload(doc.key); return false; }} showUploadList={false}>
                            <Flex align="center" gap={12} style={{ padding: '8px 16px' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 9, background: isUp ? '#ECFDF5' : '#FFF0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                    {isUp ? '✓' : doc.icon}
                                </div>
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <Text strong style={{ fontSize: 13, display: 'block' }}>{doc.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{isUp ? 'Uploaded · AI extraction complete' : `${doc.sub}${doc.required ? ' · Required' : ''}`}</Text>
                                </div>
                                <Button size="small" type={isUp ? 'default' : 'primary'} danger={!isUp}>{isUp ? 'Replace' : 'Upload'}</Button>
                            </Flex>
                        </Dragger>
                    );
                })}
            </div>
            {aiTrigger && <AIBox text={displayed + (done ? '' : '|')} label="Reading MOA…" />}
            {moaReady && (
                <>
                    <SuccessBox>✓ Corporate structure confirmed — shareholder data extracted. Ownership section pre-filled automatically.</SuccessBox>
                    <Card title={<Text strong>Extracted from MOA</Text>} bodyStyle={{ padding: '0 16px' }}><FieldRows fields={MOCK_MOA_FIELDS} /></Card>
                </>
            )}
            <NavRow onBack={onBack} onNext={onNext} />
        </>
    );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

const FIN_DOCS = [
    { key: 'statements', icon: '🏦', name: 'Bank statements (6 months)',           sub: 'All business accounts – PDF format',              required: true  },
    { key: 'audited',    icon: '📊', name: 'Audited financial accounts (2 years)',  sub: 'Required for trade finance and large facilities', required: false },
    { key: 'vat',        icon: '🧾', name: 'VAT returns (last 4 quarters)',         sub: 'Required for e-Invoicing and payment gateway',    required: false },
];

function StepFinancials({ onBack, onNext, onExtracted }: { onBack: () => void; onNext: () => void; onExtracted: (f: Record<string, string>) => void }) {
    const [uploaded,  setUploaded]  = useState<Set<string>>(new Set());
    const [aiTrigger, setAiTrigger] = useState(false);
    const [finReady,  setFinReady]  = useState(false);
    const { displayed, done } = useTypewriter(AI_FIN, 14, aiTrigger);

    const handleUpload = (key: string) => {
        setUploaded(p => new Set([...p, key]));
        if (key === 'statements') setTimeout(() => setAiTrigger(true), 1000);
    };

    useEffect(() => {
        if (!done) return;
        setTimeout(() => {
            const map: Record<string, string> = {};
            MOCK_FIN_FIELDS.forEach(f => { map[f.key] = f.val; });
            onExtracted(map);
            setFinReady(true);
        }, 300);
    }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <Text style={{ fontSize: 22, fontWeight: 600, display: 'block', marginBottom: 6 }}>Financial documents</Text>
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Bank statements and audited accounts unlock credit-based products. AI extracts turnover, average balance, and cash-flow indicators automatically.
            </Paragraph>
            <InfoBox>💡 Uploading 6 months of bank statements unlocks Corporate Credit Card, Payment Gateway, and Working Capital.</InfoBox>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {FIN_DOCS.map(doc => {
                    const isUp = uploaded.has(doc.key);
                    return (
                        <Dragger key={doc.key} beforeUpload={() => { handleUpload(doc.key); return false; }} showUploadList={false}>
                            <Flex align="center" gap={12} style={{ padding: '8px 16px' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 9, background: isUp ? '#ECFDF5' : '#FFF0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                    {isUp ? '✓' : doc.icon}
                                </div>
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <Text strong style={{ fontSize: 13, display: 'block' }}>{doc.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{isUp ? 'Uploaded · AI extraction complete' : `${doc.sub}${doc.required ? ' · Required' : ''}`}</Text>
                                </div>
                                <Button size="small" type={isUp ? 'default' : 'primary'} danger={!isUp}>{isUp ? 'Replace' : 'Upload'}</Button>
                            </Flex>
                        </Dragger>
                    );
                })}
            </div>
            {aiTrigger && <AIBox text={displayed + (done ? '' : '|')} label="Analysing financial data…" />}
            {finReady && (
                <>
                    <SuccessBox>💡 Financial data extracted — credit products unlocked! Corporate Credit Card up to AED 250,000 and Payment Gateway now eligible.</SuccessBox>
                    <Card title={<Text strong>Extracted financial indicators</Text>} bodyStyle={{ padding: '0 16px' }}><FieldRows fields={MOCK_FIN_FIELDS} /></Card>
                </>
            )}
            <NavRow onBack={onBack} onNext={onNext} />
        </>
    );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

function StepOwnership({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
    const [owners,   setOwners]   = useState<Owner[]>(MOCK_OWNERS);
    const [expanded, setExpanded] = useState<string | null>('o1');

    return (
        <>
            <Text style={{ fontSize: 22, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ownership &amp; identity</Text>
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Pre-filled from your MOA. UBOs with ≥25% ownership must pass identity verification under UAE AML Law.
            </Paragraph>
            <InfoBox>ℹ️ Cabinet Decision No. (109) of 2023 requires disclosure of all persons with ≥25% ownership. UAEPass verification links are sent on submission.</InfoBox>
            <div style={{ marginBottom: 12 }}>
                {owners.map(owner => (
                    <Card key={owner.id} style={{ marginBottom: 10, border: '1px solid #E4E7EC' }} bodyStyle={{ padding: 0 }}>
                        <div style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setExpanded(expanded === owner.id ? null : owner.id)}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: owner.pct >= 25 ? '#FFF0EE' : '#EFF6FF', color: owner.pct >= 25 ? '#FF3A3A' : '#1890FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                {owner.initials}
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text strong style={{ display: 'block', fontSize: 13 }}>{owner.name}</Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>{owner.role} · {owner.pct}% ownership{owner.pct >= 25 ? ' · UBO' : ''}</Text>
                            </div>
                            <Flex gap={6}>
                                <Tag color={owner.pct >= 25 ? 'red' : 'blue'}>{owner.pct >= 25 ? 'UBO – ID required' : 'Shareholder'}</Tag>
                                <Tag color={owner.kyc === 'complete' ? 'success' : 'warning'}>{owner.kyc === 'complete' ? '✓ Verified' : 'Pending KYC'}</Tag>
                            </Flex>
                        </div>
                        {expanded === owner.id && (
                            <div style={{ padding: '14px 16px', borderTop: '1px solid #F5F5F5', background: '#FAFAFA' }}>
                                <Row gutter={[16, 12]} style={{ marginBottom: owner.pct >= 25 ? 14 : 8 }}>
                                    {[{ label: 'Full name', val: owner.name }, { label: 'Nationality', val: owner.nationality }, { label: 'Ownership %', val: `${owner.pct}%` }, { label: 'Role', val: owner.role }].map(f => (
                                        <Col span={12} key={f.label}>
                                            <SectionLabel>{f.label}</SectionLabel>
                                            <Input size="small" defaultValue={f.val} />
                                        </Col>
                                    ))}
                                </Row>
                                {owner.pct >= 25 && <WarnBox>⚠️ Holds ≥25% — a UAEPass verification link will be sent on submission.</WarnBox>}
                                {owner.kyc === 'pending' && (
                                    <Flex justify="flex-end">
                                        <Button size="small" type="primary" danger icon={<UserOutlined />}
                                            onClick={() => setOwners(p => p.map(o => o.id === owner.id ? { ...o, kyc: 'complete' as const } : o))}>
                                            Upload ID document
                                        </Button>
                                    </Flex>
                                )}
                            </div>
                        )}
                    </Card>
                ))}
                <Button type="dashed" block icon={<UserAddOutlined />}>Add shareholder</Button>
            </div>
            <NavRow onBack={onBack} onNext={onNext} />
        </>
    );
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

function StepReview({ onBack, onNext, extracted, answers }: {
    onBack: () => void; onNext: () => void;
    extracted: Record<string, Record<string, string>>;
    answers: Record<string, string>;
}) {
    const [checked, setChecked] = useState<Set<number>>(new Set());
    const [amlDone, setAmlDone] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAmlDone(true), 2400); return () => clearTimeout(t); }, []);

    const lic = extracted.licence    ?? {};
    const fin = extracted.statements ?? {};
    const docCount = Object.keys(extracted).length + 2;
    const filledCount = Object.values(extracted).reduce((a, v) => a + Object.keys(v).length, 0) + Object.keys(answers).filter(k => answers[k]).length;
    const pct = Math.min(100, Math.round(filledCount / 24 * 100));

    const toggleDecl = (i: number) => setChecked(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });

    return (
        <>
            <Text style={{ fontSize: 22, fontWeight: 600, display: 'block', marginBottom: 6 }}>Application Summary</Text>
            <Paragraph type="secondary" style={{ marginBottom: 20 }}>Automated screening is running. Review your information — then choose which services to apply for.</Paragraph>

            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                {[
                    { label: 'Services available', value: 7,         color: '#FF3A3A', bg: '#FFF0EE' },
                    { label: 'Individuals',         value: 2,         color: '#1890FF', bg: '#EFF6FF' },
                    { label: 'Documents',           value: docCount,  color: '#F59E0B', bg: '#FFFBEB' },
                    { label: 'Complete',            value: `${pct}%`, color: '#10B981', bg: '#ECFDF5' },
                ].map(s => (
                    <Col span={6} key={s.label}>
                        <Card bodyStyle={{ padding: 14 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <FileSearchOutlined />
                            </div>
                            <SectionLabel>{s.label}</SectionLabel>
                            <Text strong style={{ fontSize: 22, color: s.color }}>{s.value}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card title={<Flex align="center" gap={8}><Text strong>AML Screening</Text><Tag color="processing">Live</Tag></Flex>} style={{ marginBottom: 16 }}>
                {['Ahmed Al Mansoori', 'Sara Rahman'].map((name, i) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i === 0 ? '1px solid #F5F5F5' : 'none' }}>
                        <div>
                            <Text strong style={{ display: 'block', fontSize: 13 }}>{name}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>OFAC · UN · EU sanctions · PEP check</Text>
                        </div>
                        <Tag color={amlDone ? 'success' : 'processing'}>{amlDone ? '✓ Clear' : 'Screening…'}</Tag>
                    </div>
                ))}
            </Card>

            <Card title={<Text strong>Statutory declarations</Text>} style={{ marginBottom: 16 }}>
                {DECLARATIONS.map((decl, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < DECLARATIONS.length - 1 ? '1px solid #F5F5F5' : 'none', cursor: 'pointer' }} onClick={() => toggleDecl(i)}>
                        <Checkbox checked={checked.has(i)} style={{ marginTop: 2 }} />
                        <Text style={{ fontSize: 13, lineHeight: 1.5 }}>{decl}</Text>
                    </div>
                ))}
            </Card>

            <Card title={<Text strong>Application summary</Text>} style={{ marginBottom: 16 }}>
                <SectionLabel>Business</SectionLabel>
                {[
                    { label: 'Legal name',    value: lic.legal_name  || 'Al Noor Trading LLC' },
                    { label: 'Trade licence', value: `${lic.licence_no || 'CN-1234567'} · ${lic.authority || 'Dubai DED'}` },
                    { label: 'TRN',           value: lic.trn          || '1000324789800003' },
                    { label: 'Entity type',   value: lic.entity_type  || 'LLC' },
                ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F5F5F5' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{r.label}</Text>
                        <Text style={{ fontSize: 13 }}>{r.value}</Text>
                    </div>
                ))}
                {fin.avg_monthly_inflow && (
                    <>
                        <Divider style={{ margin: '12px 0 8px' }} />
                        <SectionLabel>Financial profile</SectionLabel>
                        {[
                            { label: 'Avg monthly inflow', value: `AED ${fin.avg_monthly_inflow}` },
                            { label: 'Avg balance',         value: `AED ${fin.avg_balance}` },
                            { label: 'Annual revenue',      value: `AED ${fin.annual_turnover}` },
                        ].map(r => (
                            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F5F5F5' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>{r.label}</Text>
                                <Text style={{ fontSize: 13 }}>{r.value}</Text>
                            </div>
                        ))}
                    </>
                )}
            </Card>

            <InfoBox>🔒 All information is encrypted and verified against UAE regulatory databases before submission.</InfoBox>
            <NavRow onBack={onBack} onNext={onNext} nextLabel="Select services" />
        </>
    );
}

// ─── Step 6 ───────────────────────────────────────────────────────────────────

function StepServices({ onBack, filledFields, selectedServices, setSelectedServices }: {
    onBack: () => void;
    filledFields: Set<string>;
    selectedServices: Set<string>;
    setSelectedServices: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
    const [submitted, setSubmitted] = useState(false);
    const categories = Array.from(new Set(SERVICES.map(s => s.category)));

    if (submitted) {
        const approved = SERVICES.filter(s => selectedServices.has(s.id));
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32, color: '#fff', boxShadow: '0 0 30px rgba(16,185,129,.2)' }}>
                    <CheckCircleOutlined />
                </div>
                <Text style={{ fontSize: 26, fontWeight: 700, display: 'block', marginBottom: 8 }}>Application submitted!</Text>
                <Paragraph type="secondary" style={{ maxWidth: 420, margin: '0 auto 24px' }}>
                    Your OneKYB ID is live. Share it with any connected institution — they'll see your verified status instantly.
                </Paragraph>
                <div style={{ background: '#FFF0EE', border: '1px solid #FFCCC7', borderRadius: 12, padding: '14px 28px', display: 'inline-block', marginBottom: 24 }}>
                    <SectionLabel>Your OneKYB ID</SectionLabel>
                    <Text style={{ fontSize: 22, fontWeight: 700, color: '#FF3A3A', letterSpacing: 1 }}>OKYB-AE-2026-00123456</Text>
                </div>
                <div>
                    <SectionLabel>Services approved</SectionLabel>
                    <Row gutter={[8, 8]} justify="center" style={{ maxWidth: 520, margin: '12px auto 28px' }}>
                        {(approved.length ? approved : SERVICES.slice(0, 3)).map(s => (
                            <Col key={s.id}>
                                <div style={{ background: '#fff', border: '1px solid #A7F3D0', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <Text strong style={{ fontSize: 12, display: 'block' }}>{s.name}</Text>
                                        <Text style={{ fontSize: 11, color: '#10B981' }}>✓ Submitted</Text>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                    <Button type="primary" danger size="large">Go to dashboard →</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Text style={{ fontSize: 22, fontWeight: 600, display: 'block', marginBottom: 6 }}>Select services to apply for</Text>
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Based on the information you've provided, here's what you're eligible for. Select the services you'd like to apply for.
            </Paragraph>
            <SuccessBox>✓ You've provided enough information to assess your eligibility. Green services are ready to apply for right now.</SuccessBox>

            {categories.map(cat => (
                <div key={cat}>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', margin: '16px 0 10px' }}>{cat}</Text>
                    <Row gutter={[10, 10]}>
                        {SERVICES.filter(s => s.category === cat).map(svc => {
                            const done  = svc.requiredFields.filter(f => filledFields.has(f)).length;
                            const pct   = Math.round((done / svc.requiredFields.length) * 100);
                            const isSel = selectedServices.has(svc.id);
                            const eligColor = pct === 100 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#94A3B8';
                            return (
                                <Col key={svc.id} xs={24} sm={12}>
                                    <div
                                        style={{ border: isSel ? '1.5px solid #FF3A3A' : '1px solid #E4E7EC', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', background: isSel ? '#FFF7F6' : '#fff', transition: 'all .14s' }}
                                        onClick={() => setSelectedServices(p => { const n = new Set(p); n.has(svc.id) ? n.delete(svc.id) : n.add(svc.id); return n; })}
                                    >
                                        <Flex justify="space-between" align="flex-start" style={{ marginBottom: 8 }}>
                                            <span style={{ fontSize: 22 }}>{svc.icon}</span>
                                            <div style={{ width: 22, height: 22, borderRadius: '50%', border: isSel ? 'none' : '1.5px solid #E4E7EC', background: isSel ? '#FF3A3A' : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                                                {isSel ? '✓' : ''}
                                            </div>
                                        </Flex>
                                        <Text strong style={{ display: 'block', fontSize: 13, marginBottom: 2 }}>{svc.name}</Text>
                                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>{svc.desc}</Text>
                                        <Progress percent={pct} showInfo={false} strokeColor={eligColor} size="small" style={{ margin: '0 0 4px' }} />
                                        <Text style={{ fontSize: 11, fontWeight: 500, color: eligColor }}>
                                            {pct === 100 ? '✓ Ready to apply' : pct >= 50 ? `${pct}% of info complete` : 'More information needed'}
                                        </Text>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            ))}

            <Divider />
            <Flex justify="space-between" align="center">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ color: '#64748B' }}>Back</Button>
                <Flex align="center" gap={12}>
                    {selectedServices.size > 0 && (
                        <Text type="secondary" style={{ fontSize: 13 }}>{selectedServices.size} service{selectedServices.size > 1 ? 's' : ''} selected</Text>
                    )}
                    <Button type="primary" danger size="large" disabled={selectedServices.size === 0} onClick={() => setSubmitted(true)}>
                        Submit application →
                    </Button>
                </Flex>
            </Flex>
        </>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function OneKYB() {
    const [step,             setStep]             = useState(0);
    const [extracted,        setExtracted]        = useState<Record<string, Record<string, string>>>({});
    const [answers,          setAnswers]          = useState<Record<string, string>>({});
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

    const filledFields = useMemo(() => {
        const fields = new Set<string>();
        Object.values(extracted).forEach(v => Object.keys(v).forEach(k => fields.add(k)));
        Object.keys(answers).forEach(k => { if (answers[k]) fields.add(k); });
        if (MOCK_OWNERS.some(o => o.kyc === 'complete')) fields.add('kyc_director');
        if (extracted.moa) { fields.add('audited_accounts'); fields.add('sh1_name'); }
        return fields;
    }, [extracted, answers]);

    const mergeExtracted = (key: string) => (fields: Record<string, string>) =>
        setExtracted(p => ({ ...p, [key]: { ...(p[key] ?? {}), ...fields } }));

    return (
        <div style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}>
            <Card bodyStyle={{ padding: '16px 24px' }} style={{ marginBottom: 20 }}>
                <Steps
                    current={step}
                    size="small"
                    items={STEP_ITEMS}
                    onChange={n => { if (n < step) setStep(n); }}
                />
            </Card>

            <Row gutter={[20, 16]}>
                <Col xs={24} xl={17}>
                    <Card bodyStyle={{ padding: '28px 32px' }}>
                        {step === 0 && <StepLicence    onNext={() => setStep(1)} onExtracted={mergeExtracted('licence')} />}
                        {step === 1 && <StepQA          onBack={() => setStep(0)} onNext={() => setStep(2)} answers={answers} setAnswers={setAnswers} />}
                        {step === 2 && <StepCorpDocs    onBack={() => setStep(1)} onNext={() => setStep(3)} onExtracted={mergeExtracted('moa')} />}
                        {step === 3 && <StepFinancials  onBack={() => setStep(2)} onNext={() => setStep(4)} onExtracted={mergeExtracted('statements')} />}
                        {step === 4 && <StepOwnership   onBack={() => setStep(3)} onNext={() => setStep(5)} />}
                        {step === 5 && <StepReview      onBack={() => setStep(4)} onNext={() => setStep(6)} extracted={extracted} answers={answers} />}
                        {step === 6 && <StepServices    onBack={() => setStep(5)} filledFields={filledFields} selectedServices={selectedServices} setSelectedServices={setSelectedServices} />}
                    </Card>
                </Col>
                <Col xs={24} xl={7}>
                    <div style={{ position: 'sticky', top: 20 }}>
                        <EligibilityTracker filledFields={filledFields} selectedServices={selectedServices} />
                    </div>
                </Col>
            </Row>
        </div>
    );
}
