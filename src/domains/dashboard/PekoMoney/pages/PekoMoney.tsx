import { useState } from 'react';

import {
    Alert,
    Badge,
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Divider,
    Flex,
    Form,
    Input,
    Modal,
    Progress,
    Radio,
    Row,
    Select,
    Statistic,
    Steps,
    Table,
    Tag,
    Timeline,
    Typography,
    Upload,
} from 'antd';
import {
    ArrowLeftOutlined,
    BankOutlined,
    CheckCircleOutlined,
    CheckOutlined,
    CreditCardOutlined,
    DollarOutlined,
    DownloadOutlined,
    FileTextOutlined,
    InboxOutlined,
    PlusOutlined,
    ReloadOutlined,
    RocketOutlined,
    SendOutlined,
    SettingOutlined,
    TeamOutlined,
    TransactionOutlined,
    UploadOutlined,
    UserOutlined,
    WalletOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

type Screen = 'landing' | 'prereq' | 'onboarding' | 'submitted' | 'dashboard';

// ── Mock data ─────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS = [
    { id: 1, date: '12 May 2026', desc: 'Office Supplies – Staples', amount: -245.5, status: 'completed', type: 'card' },
    { id: 2, date: '11 May 2026', desc: 'Inbound – Tata Digital LLC', amount: 12500, status: 'completed', type: 'incoming' },
    { id: 3, date: '10 May 2026', desc: 'Rent – Al Mansoor Properties', amount: -8500, status: 'completed', type: 'transfer' },
    { id: 4, date: '09 May 2026', desc: 'Tech Gadgets – Electroworld', amount: -1250, status: 'completed', type: 'card' },
    { id: 5, date: '08 May 2026', desc: 'Payroll – May batch', amount: -32000, status: 'completed', type: 'payroll' },
];

const FEATURES = [
    { icon: <RocketOutlined style={{ fontSize: 24, color: '#FF3A3A' }} />, title: '100% Digital', desc: 'No branch visits required. Open your account entirely online.' },
    { icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#FF3A3A' }} />, title: "Sharīʿah Compliant", desc: "Certified ethical banking. Compliant by design, not by exception." },
    { icon: <DollarOutlined style={{ fontSize: 24, color: '#FF3A3A' }} />, title: 'Transparent Fees', desc: 'AED 79/month. No minimum balance, no hidden charges. Ever.' },
    { icon: <CreditCardOutlined style={{ fontSize: 24, color: '#FF3A3A' }} />, title: 'Corporate Card Link', desc: 'Connect your card. Spend, transfers and invoices — all in one place.' },
];

const COMPARE_ROWS = [
    { label: 'Account opening',     peko: '100% Digital',       bank: 'Branch visit required' },
    { label: 'Minimum balance',     peko: 'Zero minimum',       bank: 'AED 25,000+' },
    { label: 'Monthly fee',         peko: 'AED 79 flat',        bank: 'Variable + hidden fees' },
    { label: "Sharīʿah compliant",  peko: 'Certified',          bank: 'Not guaranteed' },
    { label: 'Digital invoicing',   peko: 'Built-in',           bank: 'Separate tool needed' },
    { label: 'Corporate Card Link', peko: 'Native integration', bank: 'Manual reconciliation' },
];

const PREREQ_DOCS = [
    'Valid Trade Licence or equivalent',
    'Memorandum / Articles of Association',
    'Emirates ID and Passport of shareholder(s) & signatories',
    'Proof of office / resident address',
    'Other business documents',
];

// ── Root component ─────────────────────────────────────────────────────────

export default function PekoMoney() {
    const [screen, setScreen] = useState<Screen>('landing');
    const [whyOpen, setWhyOpen] = useState(false);

    return (
        <div>
            {screen === 'landing'   && <Landing    onApply={() => setScreen('prereq')} onWhy={() => setWhyOpen(true)} />}
            {screen === 'prereq'    && <Prereq     onBack={() => setScreen('landing')} onStart={() => setScreen('onboarding')} />}
            {screen === 'onboarding'&& <Onboarding onBack={() => setScreen('prereq')}  onSubmit={() => setScreen('submitted')} />}
            {screen === 'submitted' && <Submitted  onDone={() => setScreen('dashboard')} />}
            {screen === 'dashboard' && <Dashboard  onBack={() => setScreen('landing')} />}

            <Modal open={whyOpen} onCancel={() => setWhyOpen(false)} footer={null} title="Why Peko Money?" width={640}>
                <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                    How Peko Money compares to traditional business banking
                </Paragraph>
                <Table
                    size="small"
                    pagination={false}
                    dataSource={COMPARE_ROWS.map((r, i) => ({ ...r, key: i }))}
                    columns={[
                        { title: '', dataIndex: 'label', key: 'label', width: '34%', render: v => <Text type="secondary">{v}</Text> },
                        { title: <Text style={{ color: '#FF3A3A', fontWeight: 600 }}>Peko Money</Text>, dataIndex: 'peko', key: 'peko',
                          render: v => <Tag color="success">{v}</Tag> },
                        { title: 'Traditional Bank', dataIndex: 'bank', key: 'bank',
                          render: v => <Tag color="default">{v}</Tag> },
                    ]}
                />
                <Flex justify="center" style={{ marginTop: 20 }}>
                    <Button type="primary" danger onClick={() => setWhyOpen(false)}>Got it</Button>
                </Flex>
            </Modal>
        </div>
    );
}

// ── Landing ────────────────────────────────────────────────────────────────

function Landing({ onApply, onWhy }: { onApply: () => void; onWhy: () => void }) {
    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 0' }}>
            <Flex vertical align="center" style={{ marginBottom: 32 }}>
                <Title level={2} style={{ marginBottom: 4 }}>
                    Peko <span style={{ fontWeight: 300 }}>Money</span>
                </Title>
                <Text type="secondary">Powered by ruya Bank</Text>
            </Flex>

            <Paragraph style={{ textAlign: 'center', fontSize: 15, marginBottom: 28 }}>
                Apply for your business bank account issued by ruya in just a few steps:
            </Paragraph>

            <Row gutter={[16, 16]} style={{ marginBottom: 36 }}>
                {FEATURES.map(f => (
                    <Col key={f.title} span={6}>
                        <Card size="small" style={{ height: '100%' }}>
                            <div style={{ marginBottom: 12 }}>{f.icon}</div>
                            <Text strong style={{ display: 'block', marginBottom: 6 }}>{f.title}</Text>
                            <Text type="secondary" style={{ fontSize: 12.5 }}>{f.desc}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Journey tracker */}
            <Card style={{ marginBottom: 32 }}>
                <Text strong style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>Your onboarding journey</Text>
                <Steps
                    items={[
                        { title: 'Peko Account', description: 'Logged in', status: 'finish', icon: <CheckOutlined /> },
                        { title: 'Apply', description: 'Upload trade licence & ID', status: 'process' },
                        { title: 'Verification', description: 'Digital review', status: 'wait' },
                        { title: 'Account Live', description: 'Ready to use', status: 'wait' },
                    ]}
                />
            </Card>

            <Flex gap={12} justify="center" style={{ marginBottom: 24 }}>
                <Button type="primary" danger size="large" shape="round" style={{ padding: '0 36px' }} onClick={onApply}>
                    Apply Now
                </Button>
                <Button size="large" shape="round" style={{ border: '1.5px solid #FF3A3A', color: '#FF3A3A', padding: '0 28px' }} onClick={onWhy}>
                    Why Peko Money?
                </Button>
            </Flex>

            <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 11.5, maxWidth: 560, margin: '0 auto' }}>
                <strong>Disclaimer:</strong> Banking services are provided by ruya. Peko does not hold or manage customer funds.
                Ruya Community Islamic Bank LLC is licensed by the Central Bank of UAE.
            </Text>
        </div>
    );
}

// ── Prerequisites ──────────────────────────────────────────────────────────

function Prereq({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 0' }}>
            <Button icon={<ArrowLeftOutlined />} type="text" onClick={onBack} style={{ marginBottom: 16 }}>Back</Button>

            <Flex vertical align="center" style={{ marginBottom: 28 }}>
                <Title level={3} style={{ marginBottom: 4 }}>Peko <span style={{ fontWeight: 300 }}>Money</span></Title>
            </Flex>

            <Card style={{ marginBottom: 16 }}>
                <Paragraph style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                    Let's get you started with a business bank account issued by ruya.
                    The application takes about <strong>5 minutes</strong>. You will need:
                </Paragraph>
                {PREREQ_DOCS.map(doc => (
                    <Flex key={doc} align="flex-start" gap={12} style={{ marginBottom: 14 }}>
                        <div style={{
                            width: 22, height: 22, borderRadius: '50%', background: '#15803d',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                        }}>
                            <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
                        </div>
                        <Text style={{ fontSize: 14 }}>{doc}</Text>
                    </Flex>
                ))}
            </Card>

            <Alert
                type="warning"
                showIcon
                message={<>Fees and charges apply. Please review the <a href="#">Schedule of fees</a> before proceeding.</>}
                style={{ marginBottom: 32 }}
            />

            <Flex justify="center" style={{ marginBottom: 28 }}>
                <Button type="primary" danger size="large" shape="round" style={{ padding: '0 40px' }} onClick={onStart}>
                    Let's get started
                </Button>
            </Flex>

            <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 11.5 }}>
                <strong>Disclaimer:</strong> Banking services are provided by ruya. Peko does not hold or manage customer funds.
            </Text>
        </div>
    );
}

// ── Onboarding ─────────────────────────────────────────────────────────────

const STEP_TITLES = ['Initiator Details', 'Company Profile', 'Financial Details', 'Shareholders', 'Review'];

function Onboarding({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
    const [step, setStep] = useState(0);
    const [form] = Form.useForm();
    const [shareholders, setShareholders] = useState([
        { name: 'Ahmed Al Rashidi', role: 'Shareholder', ownership: 100, signatory: true },
    ]);
    const [uploads, setUploads] = useState<Record<string, boolean>>({
        tradeLicense: false, moa: false, address: false, financials: false,
    });

    const fakeUpload = (key: string) => {
        setTimeout(() => setUploads(u => ({ ...u, [key]: true })), 600);
    };

    const next = () => { if (step < 4) setStep(s => s + 1); else onSubmit(); };
    const prev = () => { if (step > 0) setStep(s => s - 1); else onBack(); };

    return (
        <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 100 }}>
            {/* Breadcrumb */}
            <Flex align="center" gap={6} style={{ marginBottom: 20, fontSize: 13 }}>
                <Button type="text" size="small" style={{ color: '#FF3A3A', padding: 0 }} onClick={onBack}>Peko Money</Button>
                <Text type="secondary">›</Text>
                <Text strong>Register</Text>
            </Flex>

            {/* Step indicator */}
            <Card style={{ marginBottom: 24 }}>
                <Steps current={step} size="small" items={STEP_TITLES.map(t => ({ title: t }))} />
            </Card>

            {/* Step content */}
            {step === 0 && <StepInitiator form={form} uploads={uploads} onUpload={fakeUpload} />}
            {step === 1 && <StepCompany form={form} uploads={uploads} onUpload={fakeUpload} />}
            {step === 2 && <StepFinancial form={form} uploads={uploads} onUpload={fakeUpload} />}
            {step === 3 && <StepShareholders shareholders={shareholders} onChange={setShareholders} />}
            {step === 4 && <StepReview form={form} shareholders={shareholders} uploads={uploads} onEdit={setStep} />}

            {/* Footer navigation */}
            <div style={{
                position: 'sticky', bottom: 0, background: '#f5f5f5', borderTop: '1px solid #E4E7EC',
                padding: '12px 0', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <Button icon={<ArrowLeftOutlined />} type="text" onClick={prev} disabled={step === 0}>Back</Button>
                <Text type="secondary" style={{ fontSize: 11.5 }}>
                    Your information is processed in accordance with ruya's Privacy Policy.
                </Text>
                <Button type="primary" danger shape="round" onClick={next} style={{ padding: '0 28px' }}>
                    {step === 4 ? 'Submit Application' : 'Next →'}
                </Button>
            </div>
        </div>
    );
}

// ── Step 1: Initiator ──────────────────────────────────────────────────────

function StepInitiator({ form, uploads, onUpload }: any) {
    const [role, setRole] = useState('shareholder');
    return (
        <div>
            <Alert showIcon type="warning" message="You must be an authorised signatory, shareholder, or have legal authority to apply on behalf of the company." style={{ marginBottom: 16 }} />
            <Card title="Initiator Details">
                <Form form={form} layout="vertical" initialValues={{ role: 'shareholder', businessType: 'LLC', isSignatory: 'yes' }}>
                    <Form.Item label="Who is completing this application?" name="role">
                        <Radio.Group onChange={e => setRole(e.target.value)}>
                            <Radio value="shareholder">Shareholder</Radio>
                            <Radio value="authorised">Authorised Person</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="Are you an authorised signatory?" name="isSignatory">
                        <Radio.Group>
                            <Radio value="yes">Yes</Radio>
                            <Radio value="no">No</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="First name" name="firstName" rules={[{ required: true }]} initialValue="Ahmed">
                                <Input placeholder="Ahmed" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Last name" name="lastName" rules={[{ required: true }]} initialValue="Al Rashidi">
                                <Input placeholder="Al Rashidi" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]} initialValue="ahmed@savolluae.com">
                                <Input placeholder="ahmed@company.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Mobile number" name="mobile" rules={[{ required: true }]} initialValue="501234567">
                                <Input addonBefore="+971" placeholder="50 XXX XXXX" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Business type" name="businessType" rules={[{ required: true }]}>
                                <Select placeholder="Select business type" options={[
                                    { value: 'LLC', label: 'LLC – Mainland' },
                                    { value: 'LLCFZ', label: 'LLC – Free Zone' },
                                    { value: 'FZE', label: 'Free Zone Establishment (FZE)' },
                                    { value: 'FZCO', label: 'Free Zone Company (FZCO)' },
                                    { value: 'SP', label: 'Sole Proprietorship' },
                                    { value: 'PJSC', label: 'Public Joint Stock Company' },
                                ]} />
                            </Form.Item>
                        </Col>
                    </Row>
                    {role === 'authorised' && (
                        <UploadBlock icon="📄" title="Power of Attorney (POA)" desc="Upload your notarised POA document." uploaded={uploads.poa} onUpload={() => onUpload('poa')} />
                    )}
                </Form>
            </Card>
        </div>
    );
}

// ── Step 2: Company profile ────────────────────────────────────────────────

function StepCompany({ form, uploads, onUpload }: any) {
    const [vatReg, setVatReg] = useState('no');
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card title="A – Company Registration">
                <Alert showIcon type="info" message="Upload your document to extract information automatically. Review before continuing." style={{ marginBottom: 16 }} />
                <UploadBlock icon="📋" title="Trade License" desc="Current valid UAE trade license." uploaded={uploads.tradeLicense} onUpload={() => onUpload('tradeLicense')} />
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Company name" name="companyName" rules={[{ required: true }]} initialValue="SAVOLL LLC">
                                <Input placeholder="SAVOLL LLC" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Trade license number" name="tradeLicenseNum" rules={[{ required: true }]} initialValue="CN-2023-98745">
                                <Input placeholder="CN-2023-98745" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Emirate of registration" name="emirateReg" rules={[{ required: true }]} initialValue="Dubai">
                                <Select options={['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Umm Al Quwain'].map(v=>({value:v,label:v}))} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Issuing authority" name="issuingAuthority" rules={[{ required: true }]} initialValue="Dubai Economy (DED)">
                                <Select options={['Dubai Economy (DED)','ADGM','DIFC','DMCC','JAFZA','SPC Free Zone'].map(v=>({value:v,label:v}))} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="License issue date" name="licenseIssue" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="License expiry date" name="licenseExpiry" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Date of incorporation" name="incorporation">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card title="B – Business Profile">
                <UploadBlock icon="📄" title="Memorandum / Articles of Association" desc="Latest signed MoA / AoA." uploaded={uploads.moa} onUpload={() => onUpload('moa')} />
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Industry" name="industry" rules={[{ required: true }]} initialValue="Technology">
                                <Select options={['Technology','Finance','Real Estate','Healthcare','Retail','Logistics','Manufacturing'].map(v=>({value:v,label:v}))} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Nature of business" name="natureBusiness" rules={[{ required: true }]} initialValue="Services">
                                <Select options={['Services','Trading','Manufacturing','Consulting','Financial Services'].map(v=>({value:v,label:v}))} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Customer segment" name="customerSegment" rules={[{ required: true }]} initialValue="Corporate">
                                <Select options={['Corporate','SME','Government','Retail'].map(v=>({value:v,label:v}))} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Company profile" name="companyProfile" rules={[{ required: true }]} initialValue="SAVOLL LLC delivers enterprise technology consulting and software solutions to corporate clients across the UAE.">
                                <TextArea rows={3} placeholder="Describe your company's primary business activities…" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card title="C – Registered Address">
                <UploadBlock icon="🏢" title="Proof of Office Address" desc="Upload utility bill or tenancy contract." uploaded={uploads.address} onUpload={() => onUpload('address')} />
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={24}><Form.Item label="Address line 1" name="addrLine1" rules={[{ required: true }]} initialValue="Office 1204, The Opus by Omniyat"><Input /></Form.Item></Col>
                        <Col span={24}><Form.Item label="Address line 2" name="addrLine2" initialValue="Business Bay"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item label="City" name="city" rules={[{ required: true }]} initialValue="Dubai"><Input /></Form.Item></Col>
                        <Col span={8}>
                            <Form.Item label="Emirate" name="emirate" rules={[{ required: true }]} initialValue="Dubai">
                                <Select options={['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah'].map(v=>({value:v,label:v}))} />
                            </Form.Item>
                        </Col>
                        <Col span={8}><Form.Item label="Nearest landmark" name="landmark" rules={[{ required: true }]} initialValue="Business Bay Metro"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item label="Mobile" name="addrMobile" rules={[{ required: true }]} initialValue="0420000001"><Input addonBefore="+971" /></Form.Item></Col>
                        <Col span={8}><Form.Item label="Email" name="addrEmail" rules={[{ required: true, type: 'email' }]} initialValue="info@savolluae.com"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item label="Postal code" name="postal" initialValue="500001"><Input /></Form.Item></Col>
                    </Row>
                </Form>
            </Card>

            <Card title="D – VAT Information">
                <Form form={form} layout="vertical">
                    <Form.Item label="Is this company VAT registered?" name="vatReg" initialValue="no">
                        <Radio.Group onChange={e => setVatReg(e.target.value)}>
                            <Radio value="yes">Yes</Radio>
                            <Radio value="no">No</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {vatReg === 'yes' && (
                        <Row gutter={16}>
                            <Col span={12}><Form.Item label="TRN number" name="trn" rules={[{ required: true }]}><Input placeholder="15-digit TRN" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="VAT registration date" name="vatDate" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                        </Row>
                    )}
                </Form>
            </Card>
        </div>
    );
}

// ── Step 3: Financial ──────────────────────────────────────────────────────

function StepFinancial({ form, uploads, onUpload }: any) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card title="A – Revenue Details">
                <Alert showIcon type="info" message="Upload your latest audited financials or bank statement for automatic data extraction." style={{ marginBottom: 16 }} />
                <UploadBlock icon="📊" title="Audited Financials / Bank Statement" desc="Upload latest 6-month bank statement or audited financials." uploaded={uploads.financials} onUpload={() => onUpload('financials')} />
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item label="Main source of funds" name="sourceOfFunds" rules={[{ required: true }]} initialValue="Business Earnings"><Select options={['Business Earnings','Investment Income','Salary','Property Rental','Personal Savings','Other'].map(v=>({value:v,label:v}))} /></Form.Item></Col>
                        <Col span={12}><Form.Item label="Current turnover (AED)" name="turnover" rules={[{ required: true }]} initialValue="750,000"><Input placeholder="AED 750,000" /></Form.Item></Col>
                        <Col span={12}><Form.Item label="Annual revenue (AED)" name="annualRevenue" rules={[{ required: true }]} initialValue="2,500,000"><Input placeholder="AED 2,500,000" /></Form.Item></Col>
                        <Col span={12}><Form.Item label="Number of employees" name="employees" initialValue="12"><Input placeholder="12" /></Form.Item></Col>
                        <Col span={12}><Form.Item label="Avg. expected transaction / annum" name="avgTxn" rules={[{ required: true }]} initialValue="50000">
                            <Select options={[{value:'3m',label:'Up to AED 3 Million'},{value:'10m',label:'AED 3M – 10M'},{value:'above',label:'Above AED 10 Million'}]} />
                        </Form.Item></Col>
                    </Row>
                </Form>
            </Card>

            <Card title="B – Transaction Volumes (Monthly)">
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}><Form.Item label="Expected transactions / month" name="monthlyTxns" rules={[{ required: true }]} initialValue="50-100">
                            <Select options={['Less than 50','50–200','200–500','Above 500'].map(v=>({value:v,label:v}))} />
                        </Form.Item></Col>
                        <Col span={8}><Form.Item label="Money coming in / month (AED)" name="inward" rules={[{ required: true }]} initialValue="300000"><Input placeholder="300,000" /></Form.Item></Col>
                        <Col span={8}><Form.Item label="Money going out / month (AED)" name="outward" rules={[{ required: true }]} initialValue="150000"><Input placeholder="150,000" /></Form.Item></Col>
                    </Row>
                </Form>
            </Card>

            <Card title="C – Top 5 Suppliers">
                <SupplierCustomerSection form={form} type="supplier" />
            </Card>

            <Card title="D – Top 5 Customers">
                <SupplierCustomerSection form={form} type="customer" />
            </Card>

            <Card title="E – Existing Bank Accounts">
                <Form form={form} layout="vertical">
                    <Form.Item label="Do you have an existing bank account?" name="hasBank" initialValue="yes">
                        <Radio.Group>
                            <Radio value="yes">Yes</Radio>
                            <Radio value="no">No</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item label="Bank name" name="bankName" initialValue="Emirates NBD"><Input placeholder="e.g. Emirates NBD, ADCB" /></Form.Item></Col>
                        <Col span={12}><Form.Item label="IBAN" name="bankIban" initialValue="AE070331234567890123456"><Input placeholder="AE07 0330 0000 0001 2345 678" /></Form.Item></Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}

function SupplierCustomerSection({ form, type }: { form: any; type: 'supplier' | 'customer' }) {
    const [has, setHas] = useState('yes');
    const label = type === 'supplier' ? 'Supplier' : 'Customer';
    return (
        <Form form={form} layout="vertical">
            <Form.Item label={`Do you have ${type}s?`} name={`has${label}`} initialValue="yes">
                <Radio.Group onChange={e => setHas(e.target.value)}>
                    <Radio value="yes">Yes, I have {type}s</Radio>
                    <Radio value="no">No {type}s</Radio>
                </Radio.Group>
            </Form.Item>
            {has === 'yes' && (
                <Row gutter={16}>
                    <Col span={10}><Form.Item label={`${label} name`} name={`${type}Name1`} initialValue={type === 'supplier' ? 'Al Fardan Exchange' : 'Tata Digital LLC'}><Input /></Form.Item></Col>
                    <Col span={8}><Form.Item label="Country" name={`${type}Country1`} initialValue="UAE"><Select options={['UAE','India','Saudi Arabia','UK','USA','China','Other'].map(v=>({value:v,label:v}))} /></Form.Item></Col>
                    <Col span={6}><Form.Item label="% of business" name={`${type}Pct1`} initialValue="40"><Input placeholder="%" /></Form.Item></Col>
                </Row>
            )}
        </Form>
    );
}

// ── Step 4: Shareholders ────────────────────────────────────────────────────

function StepShareholders({ shareholders, onChange }: { shareholders: any[]; onChange: (s: any[]) => void }) {
    const [adding, setAdding] = useState(false);
    const [newSh, setNewSh] = useState({ name: '', role: 'Shareholder', ownership: '', signatory: true });

    const total = shareholders.reduce((s, sh) => s + Number(sh.ownership || 0), 0);

    const handleAdd = () => {
        if (!newSh.name) return;
        onChange([...shareholders, { ...newSh }]);
        setNewSh({ name: '', role: 'Shareholder', ownership: '', signatory: true });
        setAdding(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Alert showIcon type="warning" message="At least 1 shareholder and 1 authorised signatory must be added." />

            <Card title="Ownership Allocation">
                <div style={{ marginBottom: 8 }}>
                    <Flex justify="space-between">
                        <Text>Total Ownership Allocated</Text>
                        <Text strong>{total}%</Text>
                    </Flex>
                    <Progress percent={Math.min(total, 100)} strokeColor={total > 100 ? '#ff4d4f' : '#52c41a'} showInfo={false} />
                    <Text type="secondary" style={{ fontSize: 12 }}>{100 - total > 0 ? `${100 - total}% remaining` : 'Fully allocated'}</Text>
                </div>

                {shareholders.map((sh, i) => (
                    <Card key={i} size="small" style={{ marginBottom: 8 }}>
                        <Flex align="center" justify="space-between">
                            <Flex align="center" gap={12}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', background: '#FFF0EE',
                                    color: '#FF3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                                }}>{sh.name.charAt(0)}</div>
                                <div>
                                    <Text strong style={{ display: 'block' }}>{sh.name}</Text>
                                    <Flex gap={4}>
                                        <Tag color="default" style={{ fontSize: 10 }}>{sh.role}</Tag>
                                        {sh.signatory && <Tag color="red" style={{ fontSize: 10 }}>Authorised Signatory</Tag>}
                                        <Tag style={{ fontSize: 10 }}>{sh.ownership}%</Tag>
                                    </Flex>
                                </div>
                            </Flex>
                            {!sh.isInitiator && (
                                <Button danger type="text" size="small" onClick={() => onChange(shareholders.filter((_, j) => j !== i))}>Remove</Button>
                            )}
                        </Flex>
                    </Card>
                ))}

                {!adding ? (
                    <Button icon={<PlusOutlined />} type="dashed" block style={{ color: '#FF3A3A', borderColor: '#FF3A3A' }} onClick={() => setAdding(true)}>
                        Add another shareholder
                    </Button>
                ) : (
                    <Card size="small" style={{ background: '#FAFAFA', marginTop: 8 }}>
                        <Row gutter={12}>
                            <Col span={10}><Input placeholder="Full name" value={newSh.name} onChange={e => setNewSh(p => ({ ...p, name: e.target.value }))} /></Col>
                            <Col span={6}>
                                <Select style={{ width: '100%' }} value={newSh.role} onChange={v => setNewSh(p => ({ ...p, role: v }))}
                                    options={['Shareholder','Director','Manager','Partner'].map(v => ({ value: v, label: v }))} />
                            </Col>
                            <Col span={4}><Input placeholder="%" value={newSh.ownership} onChange={e => setNewSh(p => ({ ...p, ownership: e.target.value }))} /></Col>
                            <Col span={4}>
                                <Flex gap={4}>
                                    <Button type="primary" danger size="small" onClick={handleAdd}>Add</Button>
                                    <Button size="small" onClick={() => setAdding(false)}>Cancel</Button>
                                </Flex>
                            </Col>
                        </Row>
                        <Checkbox checked={newSh.signatory} onChange={e => setNewSh(p => ({ ...p, signatory: e.target.checked }))} style={{ marginTop: 8 }}>
                            Is authorised signatory
                        </Checkbox>
                    </Card>
                )}
            </Card>

            {/* Identity verification for each shareholder */}
            <Card title="Identity Verification">
                <Alert showIcon type="info" message="Upload Emirates ID (front & back) for UAE residents, or Passport for non-residents." style={{ marginBottom: 16 }} />
                {shareholders.map((sh, i) => (
                    <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < shareholders.length - 1 ? '1px solid #E4E7EC' : 'none' }}>
                        <Text strong style={{ display: 'block', marginBottom: 12 }}>{sh.name}</Text>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Dragger name="eid-front" multiple={false} beforeUpload={() => false} style={{ marginBottom: 8 }}>
                                    <p><UploadOutlined /></p>
                                    <p style={{ fontSize: 12 }}>Emirates ID – Front</p>
                                </Dragger>
                            </Col>
                            <Col span={12}>
                                <Dragger name="eid-back" multiple={false} beforeUpload={() => false}>
                                    <p><UploadOutlined /></p>
                                    <p style={{ fontSize: 12 }}>Emirates ID – Back</p>
                                </Dragger>
                            </Col>
                        </Row>
                    </div>
                ))}
            </Card>
        </div>
    );
}

// ── Step 5: Review ─────────────────────────────────────────────────────────

function StepReview({ form, shareholders, uploads, onEdit }: any) {
    const [consent, setConsent] = useState({ terms: true, aecb: true, confirm: true });
    const vals = form.getFieldsValue();

    const ReviewSection = ({ title, step, children }: { title: string; step: number; children: React.ReactNode }) => (
        <Card
            title={<Flex align="center" gap={8}><CheckCircleOutlined style={{ color: '#52c41a' }} /><Text>{title}</Text></Flex>}
            extra={<Button type="link" size="small" style={{ color: '#FF3A3A' }} onClick={() => onEdit(step)}>Edit</Button>}
            style={{ marginBottom: 12 }}
        >
            {children}
        </Card>
    );

    return (
        <div>
            <Alert showIcon type="success" message="Ready for submission. Review all information carefully before submitting." style={{ marginBottom: 16 }} />

            <ReviewSection title="Initiator Details" step={0}>
                <Row gutter={[16, 8]}>
                    {[
                        ['Business Type', vals.businessType],
                        ['Name', `${vals.firstName || ''} ${vals.lastName || ''}`],
                        ['Email', vals.email],
                        ['Mobile', vals.mobile ? `+971 ${vals.mobile}` : '—'],
                    ].map(([k, v]) => (
                        <Col span={12} key={k as string}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{k}</Text>
                            <Text strong>{v || '—'}</Text>
                        </Col>
                    ))}
                </Row>
            </ReviewSection>

            <ReviewSection title="Company Profile" step={1}>
                <Row gutter={[16, 8]}>
                    {[
                        ['Company', vals.companyName],
                        ['Trade Licence', vals.tradeLicenseNum],
                        ['Emirate', vals.emirateReg],
                        ['Authority', vals.issuingAuthority],
                    ].map(([k, v]) => (
                        <Col span={12} key={k as string}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{k}</Text>
                            <Text strong>{v || '—'}</Text>
                        </Col>
                    ))}
                </Row>
                <Divider style={{ margin: '12px 0' }} />
                <Flex gap={8} wrap="wrap">
                    {Object.entries(uploads).filter(([, v]) => v).map(([k]) => (
                        <Tag key={k} color="success" icon={<CheckOutlined />}>{k}</Tag>
                    ))}
                    {Object.values(uploads).every(v => !v) && <Text type="secondary" style={{ fontSize: 12 }}>No documents uploaded yet</Text>}
                </Flex>
            </ReviewSection>

            <ReviewSection title="Financial Details" step={2}>
                <Row gutter={[16, 8]}>
                    {[
                        ['Turnover', vals.turnover ? `AED ${vals.turnover}` : '—'],
                        ['Annual Revenue', vals.annualRevenue ? `AED ${vals.annualRevenue}` : '—'],
                        ['Employees', vals.employees || '—'],
                        ['Monthly Transactions', vals.monthlyTxns || '—'],
                    ].map(([k, v]) => (
                        <Col span={12} key={k as string}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{k}</Text>
                            <Text strong>{v}</Text>
                        </Col>
                    ))}
                </Row>
            </ReviewSection>

            <ReviewSection title="Shareholders & Signatories" step={3}>
                {shareholders.map((sh: any, i: number) => (
                    <Flex key={i} align="center" gap={12} style={{ marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFF0EE', color: '#FF3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {sh.name.charAt(0)}
                        </div>
                        <div>
                            <Text strong>{sh.name}</Text>
                            <Flex gap={4} style={{ marginTop: 2 }}>
                                <Tag style={{ fontSize: 10 }}>{sh.role}</Tag>
                                {sh.signatory && <Tag color="red" style={{ fontSize: 10 }}>Signatory</Tag>}
                                <Tag style={{ fontSize: 10 }}>{sh.ownership}%</Tag>
                            </Flex>
                        </div>
                    </Flex>
                ))}
            </ReviewSection>

            {/* Compliance forms */}
            <Card title="Compliance Forms" style={{ marginBottom: 12 }}>
                <Flex vertical gap={8}>
                    <Flex align="center" justify="space-between" style={{ padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, cursor: 'pointer' }}>
                        <Text>📄 FATCA Self-Certification Form</Text>
                        <Tag color="warning">Click to complete →</Tag>
                    </Flex>
                    <Flex align="center" justify="space-between" style={{ padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, cursor: 'pointer' }}>
                        <Text>📄 CRS Self-Certification Form</Text>
                        <Tag color="warning">Click to complete →</Tag>
                    </Flex>
                </Flex>
            </Card>

            {/* Consent */}
            <Card title="Declarations & Consent">
                <Flex vertical gap={12}>
                    <Checkbox checked={consent.terms} onChange={e => setConsent(c => ({ ...c, terms: e.target.checked }))}>
                        I confirm that all information provided is accurate, complete, and up to date.
                    </Checkbox>
                    <Checkbox checked={consent.aecb} onChange={e => setConsent(c => ({ ...c, aecb: e.target.checked }))}>
                        I authorise ruya Bank to collect, process, and verify the information and documents provided.
                    </Checkbox>
                    <Checkbox checked={consent.confirm} onChange={e => setConsent(c => ({ ...c, confirm: e.target.checked }))}>
                        I acknowledge that account opening is subject to ruya Bank's internal policies and KYC/AML compliance checks.
                    </Checkbox>
                </Flex>
            </Card>
        </div>
    );
}

// ── Submitted ──────────────────────────────────────────────────────────────

function Submitted({ onDone }: { onDone: () => void }) {
    const ref = 'KYC-' + Math.floor(Math.random() * 90000 + 10000);
    return (
        <div style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center', padding: '0 16px' }}>
            <div style={{
                width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4',
                border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, margin: '0 auto 20px',
            }}>✓</div>

            <Title level={3} style={{ marginBottom: 8 }}>Application Submitted!</Title>
            <Text type="success" strong style={{ display: 'block', marginBottom: 8 }}>
                We're thrilled to have you on board — exciting things are ahead! 🎉
            </Text>
            <Paragraph type="secondary" style={{ marginBottom: 6 }}>
                Your business account application has been submitted to <strong>ruya Bank</strong> for review.
            </Paragraph>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 20px', display: 'inline-block', margin: '16px 0 32px' }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', display: 'block' }}>Application Reference</Text>
                <Text strong style={{ fontSize: 15 }}>{ref}</Text>
            </div>

            {/* Progress steps */}
            <Card style={{ marginBottom: 28 }}>
                <Steps
                    items={[
                        { title: 'Submitted', description: "Application received", status: 'finish', icon: <CheckOutlined /> },
                        { title: 'Under Review', description: 'ruya Bank reviewing', status: 'process' },
                        { title: 'Processed', description: 'Decision made', status: 'wait' },
                    ]}
                />
            </Card>

            <Alert
                type="warning"
                showIcon
                message="What happens next?"
                description={`ruya Bank's team will review your application within 2–3 business days. You'll receive an email notification once a decision has been made.`}
                style={{ textAlign: 'left', marginBottom: 24 }}
            />

            <Button type="primary" danger size="large" shape="round" style={{ padding: '0 36px' }} onClick={onDone}>
                Open Peko Money Dashboard →
            </Button>
        </div>
    );
}

// ── Dashboard ──────────────────────────────────────────────────────────────

type DashView = 'main' | 'send' | 'transactions' | 'add-funds' | 'beneficiaries';

function Dashboard({ onBack }: { onBack: () => void }) {
    const [view, setView] = useState<DashView>('main');
    const [balanceHidden, setBalanceHidden] = useState(false);
    const [balance] = useState(111240);

    const QUICK_ACTIONS = [
        { key: 'send',          label: 'Send Money',    icon: <SendOutlined /> },
        { key: 'add-funds',     label: 'Add Funds',     icon: <WalletOutlined /> },
        { key: 'transactions',  label: 'Transactions',  icon: <TransactionOutlined /> },
        { key: 'beneficiaries', label: 'Beneficiaries', icon: <TeamOutlined /> },
        { key: 'invoice',       label: 'Invoicing',     icon: <FileTextOutlined /> },
        { key: 'settings',      label: 'Settings',      icon: <SettingOutlined /> },
    ];

    if (view === 'send')         return <SendMoney balance={balance} onBack={() => setView('main')} />;
    if (view === 'transactions') return <Transactions onBack={() => setView('main')} />;
    if (view === 'add-funds')    return <AddFunds onBack={() => setView('main')} />;
    if (view === 'beneficiaries') return <Beneficiaries onBack={() => setView('main')} />;

    return (
        <div>
            <Flex align="center" justify="space-between" style={{ marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0 }}>Peko Money</Title>
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ color: '#8C8C8C' }}>Exit to More Services</Button>
            </Flex>

            <Row gutter={[20, 20]}>
                {/* Left column */}
                <Col xs={24} xl={17}>
                    <Row gutter={[20, 20]}>
                        {/* Balance card */}
                        <Col xs={24} md={10}>
                            <Card style={{ height: '100%' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFF0EE', color: '#FF3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <WalletOutlined />
                                </div>
                                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Account balance</Text>
                                <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                                    <Title level={3} style={{ margin: 0 }}>
                                        {balanceHidden ? 'AED ••••••' : `AED ${balance.toLocaleString()}`}
                                    </Title>
                                    <Button type="text" size="small" onClick={() => setBalanceHidden(h => !h)}>
                                        {balanceHidden ? '👁' : '🙈'}
                                    </Button>
                                </Flex>
                                <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace', display: 'block', marginBottom: 4 }}>
                                    IBAN: GB29 NWBK 6016 1331 9268 19
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.04em' }}>1234 5678 9234</Text>
                                <Divider style={{ margin: '12px 0' }} />
                                <Button type="link" style={{ padding: 0, color: '#FF3A3A', fontSize: 12 }}>📤 Share account details</Button>
                            </Card>
                        </Col>

                        {/* Quick actions */}
                        <Col xs={24} md={14}>
                            <Card title="Quick Actions" style={{ height: '100%' }}>
                                <Row gutter={[12, 12]}>
                                    {QUICK_ACTIONS.map(a => (
                                        <Col span={8} key={a.key}>
                                            <div
                                                onClick={() => setView(a.key as DashView)}
                                                style={{
                                                    background: '#F9F9F9', border: '1px solid #E4E7EC', borderRadius: 12,
                                                    padding: '14px 8px', display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', gap: 8, cursor: 'pointer',
                                                    transition: 'all .15s',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.background = '#FFF0EE')}
                                                onMouseLeave={e => (e.currentTarget.style.background = '#F9F9F9')}
                                            >
                                                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #FFC4C4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF3A3A', fontSize: 18 }}>
                                                    {a.icon}
                                                </div>
                                                <Text style={{ fontSize: 12, fontWeight: 500, textAlign: 'center' }}>{a.label}</Text>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    {/* Recent transactions */}
                    <Card title="Recent Transactions" extra={<Button type="link" style={{ color: '#FF3A3A' }} onClick={() => setView('transactions')}>See all →</Button>} style={{ marginTop: 20 }}>
                        <Table
                            size="small"
                            pagination={false}
                            dataSource={MOCK_TRANSACTIONS.map(t => ({ ...t, key: t.id }))}
                            columns={[
                                { title: 'Date', dataIndex: 'date', key: 'date', render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
                                { title: 'Description', dataIndex: 'desc', key: 'desc', render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
                                {
                                    title: 'Amount', dataIndex: 'amount', key: 'amount',
                                    render: (v: number) => (
                                        <Text strong style={{ color: v > 0 ? '#15803d' : '#ef4444' }}>
                                            {v > 0 ? '+' : ''}AED {Math.abs(v).toLocaleString()}
                                        </Text>
                                    ),
                                },
                                {
                                    title: 'Status', dataIndex: 'status', key: 'status',
                                    render: (v: string) => <Tag color={v === 'completed' ? 'success' : 'warning'}>{v}</Tag>,
                                },
                            ]}
                            onRow={() => ({ style: { cursor: 'pointer' } })}
                        />
                    </Card>
                </Col>

                {/* Right column — promo */}
                <Col xs={24} xl={7}>
                    <Card>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>Peko</Text>
                        <Title level={4} style={{ color: '#FF3A3A', marginBottom: 8 }}>Corporate Card</Title>
                        <Paragraph type="secondary" style={{ fontSize: 13 }}>
                            The all-in-one corporate card built for modern businesses. Spend, track, and reconcile — all in one place.
                        </Paragraph>
                        <Divider />
                        <div style={{ background: 'linear-gradient(135deg, #5C1212 0%, #2A0707 100%)', borderRadius: 12, padding: '20px', color: '#fff', marginBottom: 16 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Control expenses, track spending</div>
                            <div style={{ fontSize: 12, opacity: .85 }}>One card to manage it all — issue virtual & physical cards instantly.</div>
                        </div>
                        <Button type="primary" danger block shape="round">Apply Now</Button>
                    </Card>

                    <Card style={{ marginTop: 16 }}>
                        <Statistic title="This Month's Spend" value={41995.5} prefix="AED" precision={2} valueStyle={{ color: '#ef4444', fontSize: 22 }} />
                        <Divider />
                        <Statistic title="Money Received" value={12500} prefix="AED" precision={2} valueStyle={{ color: '#15803d', fontSize: 22 }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

// ── Send Money ─────────────────────────────────────────────────────────────

function SendMoney({ balance, onBack }: { balance: number; onBack: () => void }) {
    const [step, setStep] = useState<'select' | 'amount' | 'otp' | 'success'>('select');
    const [selected, setSelected] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [otp, setOtp] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [beneficiaries, setBeneficiaries] = useState([
        { id: 1, name: 'Ajmal Grocery',          bank: 'RAK Bank',     iban: 'AE67 0400 0003 3272 9247 001' },
        { id: 2, name: 'Shyam Kunhikannan',       bank: 'Mashreq Bank', iban: 'AE07 0331 2345 6789 0123 456' },
        { id: 3, name: 'Al Mansoor Properties',   bank: 'Emirates NBD', iban: 'AE12 5678 9012 3456 7890 100' },
    ]);
    const [addForm] = Form.useForm();

    const handleAddBeneficiary = () => {
        addForm.validateFields().then(vals => {
            setBeneficiaries(prev => [...prev, { id: Date.now(), ...vals }]);
            addForm.resetFields();
            setAddOpen(false);
        });
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>Send Money</Title>

            <Steps current={['select','amount','otp','success'].indexOf(step)} size="small"
                items={['Select Beneficiary','Enter Amount','Verify','Done'].map(t => ({ title: t }))}
                style={{ marginBottom: 24 }}
            />

            {step === 'select' && (
                <>
                    <Row gutter={20}>
                        <Col span={14}>
                            <Card
                                title="Saved Beneficiaries"
                                extra={
                                    <Button
                                        type="primary"
                                        danger
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={() => setAddOpen(true)}
                                    >
                                        Add Beneficiary
                                    </Button>
                                }
                            >
                                {beneficiaries.map(b => (
                                    <div
                                        key={b.id}
                                        onClick={() => { setSelected(b); setStep('amount'); }}
                                        style={{
                                            padding: '12px 14px', border: '1px solid #E4E7EC', borderRadius: 8,
                                            marginBottom: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF3A3A'; e.currentTarget.style.background = '#FFF0EE'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4E7EC'; e.currentTarget.style.background = '#fff'; }}
                                    >
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF0EE', color: '#FF3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{b.name.charAt(0)}</div>
                                        <div>
                                            <Text strong style={{ display: 'block' }}>{b.name}</Text>
                                            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>{b.bank} • {b.iban}</Text>
                                        </div>
                                    </div>
                                ))}
                            </Card>
                        </Col>
                        <Col span={10}>
                            <Card title="Upload Invoice (Optional)">
                                <Dragger beforeUpload={() => false} style={{ padding: '12px 0' }}>
                                    <p><InboxOutlined style={{ fontSize: 24, color: '#FF3A3A' }} /></p>
                                    <p style={{ fontSize: 12 }}>Upload to auto-extract beneficiary details</p>
                                </Dragger>
                            </Card>
                        </Col>
                    </Row>

                    {/* Add Beneficiary modal */}
                    <Modal
                        open={addOpen}
                        title="Add New Beneficiary"
                        onCancel={() => { setAddOpen(false); addForm.resetFields(); }}
                        footer={[
                            <Button key="cancel" onClick={() => { setAddOpen(false); addForm.resetFields(); }}>Cancel</Button>,
                            <Button key="save" type="primary" danger onClick={handleAddBeneficiary}>Save Beneficiary</Button>,
                        ]}
                    >
                        <Form form={addForm} layout="vertical" style={{ marginTop: 8 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Beneficiary name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
                                        <Input placeholder="e.g. Ajmal Grocery" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Bank name" name="bank" rules={[{ required: true, message: 'Bank is required' }]}>
                                        <Input placeholder="e.g. RAK Bank" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Account number" name="account" rules={[{ required: true, message: 'Account number is required' }]}>
                                        <Input placeholder="0332729247001" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="IBAN" name="iban" rules={[{ required: true, message: 'IBAN is required' }]}>
                                        <Input placeholder="AE67 0400 ..." />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Modal>
                </>
            )}

            {step === 'amount' && selected && (
                <Card style={{ maxWidth: 500, margin: '0 auto' }}>
                    <Flex align="center" gap={12} style={{ marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFF0EE', color: '#FF3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>{selected.name.charAt(0)}</div>
                        <div>
                            <Text strong style={{ fontSize: 16 }}>{selected.name}</Text>
                            <Text type="secondary" style={{ display: 'block', fontSize: 11, fontFamily: 'monospace' }}>{selected.iban}</Text>
                        </div>
                    </Flex>
                    <Form layout="vertical">
                        <Form.Item label="Amount (AED)">
                            <Input size="large" prefix="AED" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} style={{ fontSize: 20, fontWeight: 700 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>Available: AED {balance.toLocaleString()}</Text>
                        </Form.Item>
                        <Form.Item label="Purpose">
                            <Select defaultValue="Supplier payment" options={['Supplier payment','Salary','Rent','Service payment','Other'].map(v => ({ value: v, label: v }))} />
                        </Form.Item>
                    </Form>
                    <Flex gap={12} justify="flex-end">
                        <Button onClick={() => setStep('select')}>Back</Button>
                        <Button type="primary" danger disabled={!amount} onClick={() => setStep('otp')}>Continue →</Button>
                    </Flex>
                </Card>
            )}

            {step === 'otp' && (
                <Card style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
                    <Title level={5}>Verify Transaction</Title>
                    <Paragraph type="secondary">Enter the 6-digit OTP sent to your registered mobile</Paragraph>
                    <Alert type="info" message={<>Demo OTP: <strong>123456</strong></>} style={{ marginBottom: 16 }} />
                    <Input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="Enter 6-digit OTP" size="large" style={{ textAlign: 'center', letterSpacing: '.5em', fontSize: 20, marginBottom: 20 }} />
                    <Flex gap={12} justify="center">
                        <Button onClick={() => setStep('amount')}>Back</Button>
                        <Button type="primary" danger onClick={() => setStep('success')}>Submit</Button>
                    </Flex>
                </Card>
            )}

            {step === 'success' && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckOutlined style={{ color: '#fff', fontSize: 28 }} />
                    </div>
                    <Title level={4}>Transfer Successful!</Title>
                    <Paragraph type="secondary">AED {Number(amount).toLocaleString()} sent to {selected?.name}</Paragraph>
                    <Flex gap={12} justify="center">
                        <Button onClick={() => { setStep('select'); setSelected(null); setAmount(''); }}>Send Another</Button>
                        <Button type="primary" danger onClick={onBack}>Go to Dashboard</Button>
                    </Flex>
                </div>
            )}
        </div>
    );
}

// ── Transactions ───────────────────────────────────────────────────────────

function Transactions({ onBack }: { onBack: () => void }) {
    return (
        <div>
            <Flex align="center" gap={12} style={{ marginBottom: 20 }}>
                <Button icon={<ArrowLeftOutlined />} type="text" onClick={onBack}>Back</Button>
                <Title level={4} style={{ margin: 0 }}>All Transactions</Title>
            </Flex>
            <Row gutter={16} style={{ marginBottom: 20 }}>
                {[
                    { title: 'Balance', value: 111240, color: '#111', prefix: 'AED' },
                    { title: 'Money In', value: 12500, color: '#15803d', prefix: '+AED' },
                    { title: 'Money Out', value: 42945.5, color: '#ef4444', prefix: '-AED' },
                ].map(s => (
                    <Col span={8} key={s.title}>
                        <Card><Statistic title={s.title} value={s.value} prefix={s.prefix} precision={2} valueStyle={{ color: s.color }} /></Card>
                    </Col>
                ))}
            </Row>
            <Card>
                <Table
                    size="small"
                    dataSource={MOCK_TRANSACTIONS.map(t => ({ ...t, key: t.id }))}
                    columns={[
                        { title: 'Date', dataIndex: 'date', key: 'date' },
                        { title: 'Description', dataIndex: 'desc', key: 'desc', render: (v: string) => <Text strong>{v}</Text> },
                        {
                            title: 'Amount', dataIndex: 'amount', key: 'amount',
                            render: (v: number) => <Text strong style={{ color: v > 0 ? '#15803d' : '#ef4444' }}>{v > 0 ? '+' : ''}AED {Math.abs(v).toLocaleString()}</Text>,
                        },
                        {
                            title: 'Status', dataIndex: 'status', key: 'status',
                            render: (v: string) => <Tag color="success">{v}</Tag>,
                        },
                        { title: '', key: 'action', render: () => <Button type="link" size="small" style={{ color: '#FF3A3A' }}>View</Button> },
                    ]}
                />
            </Card>
        </div>
    );
}

// ── Add Funds ──────────────────────────────────────────────────────────────

function AddFunds({ onBack }: { onBack: () => void }) {
    const [method, setMethod] = useState<'bank' | 'card' | 'cash'>('bank');
    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <Button icon={<ArrowLeftOutlined />} type="text" onClick={onBack} style={{ marginBottom: 16 }}>Back</Button>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>Add Funds</Title>

            <Row gutter={16} style={{ marginBottom: 28 }}>
                {[
                    { key: 'bank', icon: <BankOutlined style={{ fontSize: 28 }} />, label: 'Bank Transfer', hint: 'Free • 1–2 business days' },
                    { key: 'card', icon: <CreditCardOutlined style={{ fontSize: 28 }} />, label: 'Debit Card', hint: 'Instant • 1.5% fee' },
                    { key: 'cash', icon: <DollarOutlined style={{ fontSize: 28 }} />, label: 'Cash / Cheque', hint: 'Visit branch • Same day' },
                ].map(m => (
                    <Col span={8} key={m.key}>
                        <div
                            onClick={() => setMethod(m.key as any)}
                            style={{
                                border: `1.5px solid ${method === m.key ? '#FF3A3A' : '#E4E7EC'}`,
                                background: method === m.key ? '#FFF0EE' : '#fff',
                                borderRadius: 12, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                            }}
                        >
                            <div style={{ color: '#FF3A3A', marginBottom: 10 }}>{m.icon}</div>
                            <Text strong style={{ display: 'block' }}>{m.label}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{m.hint}</Text>
                        </div>
                    </Col>
                ))}
            </Row>

            {method === 'bank' && (
                <Card title="Share Your Bank Details">
                    <Flex justify="flex-end" style={{ marginBottom: 12 }}>
                        <Button icon={<DownloadOutlined />} size="small">Copy details</Button>
                    </Flex>
                    <Table size="small" pagination={false} showHeader={false}
                        dataSource={[
                            { key: 1, label: 'Account name', value: 'SAVOLL LLC' },
                            { key: 2, label: 'Account number', value: '1234567890123' },
                            { key: 3, label: 'IBAN', value: 'GB29 NWBK 6016 1331 9268 19' },
                            { key: 4, label: 'Bank name', value: 'Ruya Bank' },
                            { key: 5, label: 'SWIFT', value: 'PEHRPOI' },
                        ]}
                        columns={[
                            { dataIndex: 'label', key: 'label', render: (v: string) => <Text type="secondary">{v}</Text>, width: '40%' },
                            { dataIndex: 'value', key: 'value', render: (v: string) => <Text strong style={{ fontFamily: 'monospace' }}>{v}</Text> },
                        ]}
                    />
                </Card>
            )}

            {method === 'card' && (
                <Card>
                    <Form layout="vertical">
                        <Form.Item label="Amount to add (AED)"><Input size="large" type="number" placeholder="0" style={{ fontSize: 20, fontWeight: 700 }} /></Form.Item>
                        <Form.Item label="Card number"><Input placeholder="1234 5678 9123 4567" /></Form.Item>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item label="Expiry"><Input placeholder="MM / YY" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="CVC"><Input placeholder="•••" /></Form.Item></Col>
                        </Row>
                        <Button type="primary" danger block size="large" shape="round">Top Up</Button>
                    </Form>
                </Card>
            )}

            {method === 'cash' && (
                <Alert type="info" showIcon message="Visit any Ruya Bank branch with your trade licence and a deposit slip. Your wallet is credited the same day." />
            )}
        </div>
    );
}

// ── Beneficiaries ──────────────────────────────────────────────────────────

function Beneficiaries({ onBack }: { onBack: () => void }) {
    const [addOpen, setAddOpen] = useState(false);
    const BENS = [
        { id: 1, name: 'Ajmal Grocery',        bank: 'RAK Bank',     iban: 'AE67 0400 0003 3272 9247 001', address: 'A7, DSO, Dubai' },
        { id: 2, name: 'Shyam Kunhikannan',     bank: 'Mashreq Bank', iban: 'AE07 0331 2345 6789 0123 456', address: 'Business Bay' },
        { id: 3, name: 'Al Mansoor Properties', bank: 'Emirates NBD', iban: 'AE12 5678 9012 3456 7890 100', address: 'Sheikh Zayed Rd' },
    ];
    return (
        <div>
            <Flex align="center" justify="space-between" style={{ marginBottom: 20 }}>
                <Flex align="center" gap={12}><Button icon={<ArrowLeftOutlined />} type="text" onClick={onBack}>Back</Button><Title level={4} style={{ margin: 0 }}>Beneficiaries</Title></Flex>
                <Button type="primary" danger icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>Add Beneficiary</Button>
            </Flex>
            <Card>
                <Table
                    size="small"
                    dataSource={BENS.map(b => ({ ...b, key: b.id }))}
                    columns={[
                        { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
                        { title: 'IBAN', dataIndex: 'iban', key: 'iban', render: (v: string) => <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</Text> },
                        { title: 'Bank', dataIndex: 'bank', key: 'bank' },
                        { title: '', key: 'actions', render: () => <Button type="primary" danger size="small">Send Money</Button> },
                    ]}
                />
            </Card>
            <Modal open={addOpen} onCancel={() => setAddOpen(false)} title="Add New Beneficiary" footer={[
                <Button key="cancel" onClick={() => setAddOpen(false)}>Cancel</Button>,
                <Button key="save" type="primary" danger onClick={() => setAddOpen(false)}>Save Beneficiary</Button>,
            ]}>
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}><Form.Item label="Beneficiary name" rules={[{ required: true }]}><Input placeholder="e.g. Ajmal Grocery" /></Form.Item></Col>
                        <Col span={12}><Form.Item label="Bank name" rules={[{ required: true }]}><Input placeholder="e.g. RAK Bank" /></Form.Item></Col>
                        <Col span={12}><Form.Item label="Account number" rules={[{ required: true }]}><Input placeholder="0332729247001" /></Form.Item></Col>
                        <Col span={12}><Form.Item label="IBAN" rules={[{ required: true }]}><Input placeholder="AE67 0400 ..." /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
}

// ── Upload block helper ────────────────────────────────────────────────────

function UploadBlock({ icon, title, desc, uploaded, onUpload }: { icon: string; title: string; desc: string; uploaded: boolean; onUpload: () => void }) {
    return (
        <div style={{
            background: uploaded ? '#f0fdf4' : '#FAFAFA',
            border: `1px solid ${uploaded ? '#86efac' : '#E4E7EC'}`,
            borderRadius: 8, padding: '12px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
        }}>
            <div style={{ width: 34, height: 34, borderRadius: 6, background: '#fff', border: '1px solid #E4E7EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <Text strong style={{ display: 'block', marginBottom: 2 }}>{title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{uploaded ? '✅ Uploaded successfully' : desc}</Text>
            </div>
            <Button
                size="small"
                type={uploaded ? 'default' : 'primary'}
                danger={!uploaded}
                icon={uploaded ? <CheckOutlined /> : <UploadOutlined />}
                onClick={onUpload}
                loading={false}
            >
                {uploaded ? 'Uploaded' : 'Upload'}
            </Button>
        </div>
    );
}
