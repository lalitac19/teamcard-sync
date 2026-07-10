import { useState, useEffect, useCallback } from 'react';

import {
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Flex,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Statistic,
    Table,
    Tag,
    Typography,
    Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CloudUploadOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    InboxOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
    ReloadOutlined,
    SettingOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// ── Types ────────────────────────────────────────────────────────────────────

interface Config {
    baseUrl: string;
    clientId: string;
    clientSecret: string;
    partnerCif: string;
    channelId: string;
    docChannel: string;
    uuid: string;
}

interface SupportCase {
    gits_name?: string;
    gits_casenumber?: string;
    gits_helpsupportid?: string;
    gits_cif?: string;
    gits_initiatoremail?: string;
    gits_description?: string;
    gits_remarks?: string;
    statuscode?: number;
    'statuscode@OData.Community.Display.V1.FormattedValue'?: string;
    gits_requestsubtype?: { gits_title?: string };
    gits_financialaccount?: { msfsi_number?: string };
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
    1:         { label: 'Open',          color: 'blue',   icon: <ClockCircleOutlined /> },
    449930000: { label: 'Approved',      color: 'green',  icon: <CheckCircleOutlined /> },
    449930001: { label: 'Rejected',      color: 'red',    icon: <CloseCircleOutlined /> },
    449930002: { label: 'Closed',        color: 'default',icon: <CheckCircleOutlined /> },
    449930003: { label: 'Clarification', color: 'orange', icon: <ExclamationCircleOutlined /> },
};

const statusTag = (code?: number, label?: string) => {
    const s = STATUS_MAP[code ?? -1] ?? { label: label ?? 'Unknown', color: 'default', icon: null };
    return <Tag color={s.color} icon={s.icon}>{s.label}</Tag>;
};

// ── Views ─────────────────────────────────────────────────────────────────────

type View = 'dashboard' | 'cases' | 'new-case' | 'detail' | 'settings';

const STORAGE_KEY = 'peko_ruya_config';

// ── Main component ────────────────────────────────────────────────────────────

export default function RuyaSupport() {
    const [view, setView] = useState<View>('dashboard');
    const [config, setConfig] = useState<Config>({
        baseUrl: '', clientId: '', clientSecret: '',
        partnerCif: '', channelId: '1010', docChannel: '3', uuid: '20275',
    });
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [tokenExpiry, setTokenExpiry] = useState<number>(0);
    const [cases, setCases] = useState<SupportCase[]>([]);
    const [filteredCases, setFilteredCases] = useState<SupportCase[]>([]);
    const [currentCase, setCurrentCase] = useState<SupportCase | null>(null);
    const [loading, setLoading] = useState(false);
    const [authStatus, setAuthStatus] = useState('');
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [successModal, setSuccessModal] = useState(false);
    const [lastCreated, setLastCreated] = useState<SupportCase | null>(null);

    const [newCaseForm] = Form.useForm();
    const [settingsForm] = Form.useForm();
    const [reopenForm] = Form.useForm();

    // Load config from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const cfg: Config = JSON.parse(saved);
            setConfig(cfg);
            settingsForm.setFieldsValue(cfg);
        }
    }, [settingsForm]);

    // Apply filters whenever cases/search/status changes
    useEffect(() => {
        const s = searchText.toLowerCase();
        setFilteredCases(
            cases.filter(c => {
                const matchSearch =
                    !s ||
                    (c.gits_casenumber ?? '').toLowerCase().includes(s) ||
                    (c.gits_cif ?? '').toLowerCase().includes(s) ||
                    (c.gits_description ?? '').toLowerCase().includes(s) ||
                    (c.gits_initiatoremail ?? '').toLowerCase().includes(s);
                const matchStatus = !statusFilter || String(c.statuscode) === statusFilter;
                return matchSearch && matchStatus;
            })
        );
    }, [cases, searchText, statusFilter]);

    // ── Auth ──────────────────────────────────────────────────────────────────

    const authenticate = useCallback(async (cfg: Config = config) => {
        if (!cfg.baseUrl || !cfg.clientId || !cfg.clientSecret) {
            setAuthStatus('⚠ Missing credentials');
            return null;
        }
        setAuthStatus('Authenticating…');
        try {
            const res = await fetch(`${cfg.baseUrl}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: cfg.clientId,
                    client_secret: cfg.clientSecret,
                    grant_type: 'client_credentials',
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAccessToken(data.access_token);
            setTokenExpiry(Date.now() + (data.expires_in ?? 3600) * 1000);
            setAuthStatus('✓ Authenticated');
            return data.access_token as string;
        } catch (e: any) {
            setAuthStatus(`✗ Auth failed: ${e.message}`);
            message.error(`Authentication failed: ${e.message}`);
            return null;
        }
    }, [config]);

    const ensureToken = useCallback(async (): Promise<string | null> => {
        if (accessToken && Date.now() < tokenExpiry - 60000) return accessToken;
        return authenticate();
    }, [accessToken, tokenExpiry, authenticate]);

    // ── Fetch cases ───────────────────────────────────────────────────────────

    const refreshCases = useCallback(async () => {
        if (!config.baseUrl) {
            message.info('Configure API settings first');
            setView('settings');
            return;
        }
        setLoading(true);
        try {
            const token = await ensureToken();
            if (!token) return;
            const select = 'gits_name,gits_casenumber,gits_cif,gits_initiatoremail,gits_remarks,statuscode,gits_description,gits_helpsupportid';
            const expand = 'gits_requestsubtype($select=gits_title),gits_financialaccount($select=msfsi_number)';
            const filter = config.partnerCif
                ? `gits_customer_account/gits_cifid eq '${config.partnerCif}'`
                : '';
            let url = `${config.baseUrl}/ruya/HelpAndSupport/1.0/EnquireRequest?$select=${encodeURIComponent(select)}&$expand=${encodeURIComponent(expand)}`;
            if (filter) url += `&$filter=${encodeURIComponent(filter)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Prefer: 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
                },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCases(data.value ?? []);
            message.success(`Loaded ${(data.value ?? []).length} case(s)`);
        } catch (e: any) {
            message.error(`Failed to load cases: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [config, ensureToken]);

    // ── Create case ───────────────────────────────────────────────────────────

    const submitNewCase = async (values: any) => {
        const body: any = {
            gits_name: 'Help & Support',
            gits_origin: parseInt(values.origin ?? '1010'),
            'gits_customer_account@odata.bind': `/accounts(gits_cifid='${values.cif}')`,
            gits_cif: values.cif,
            'gits_requesttype@odata.bind': `/gits_servicerequesttypes(gits_servicerequesttype_id='${values.reqType}')`,
            'gits_requestsubtype@odata.bind': `/gits_servicerequestsubtypes(gits_subtypeid='${values.reqSubType}')`,
            gits_description: values.description,
            gits_mobilenumber: values.mobile,
            gits_email: values.email,
        };
        if (values.eid) body.gits_emiratesid = values.eid;
        if (values.trade) body.gits_tradelicensenumber = values.trade;
        if (values.financial) body['gits_financialaccount@odata.bind'] = `/msfsi_financialproducts(msfsi_number='${values.financial}')`;

        try {
            const token = await ensureToken();
            if (!token) return;
            const res = await fetch(
                `${config.baseUrl}/ruya/HelpAndSupport/1.0/CreateRequest?$select=gits_casenumber,gits_cif,gits_helpsupportid`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        Prefer: 'return=representation',
                    },
                    body: JSON.stringify(body),
                }
            );
            if (!res.ok) {
                const err = await res.text();
                throw new Error(`HTTP ${res.status}: ${err}`);
            }
            const data = await res.json();
            setLastCreated(data);
            setSuccessModal(true);
            newCaseForm.resetFields();
            newCaseForm.setFieldValue('origin', '1010');
            refreshCases();
        } catch (e: any) {
            message.error(`Failed to create case: ${e.message}`);
        }
    };

    // ── Reopen case ───────────────────────────────────────────────────────────

    const reopenCase = async (values: any) => {
        if (!currentCase?.gits_casenumber) return;
        try {
            const token = await ensureToken();
            if (!token) return;
            const res = await fetch(
                `${config.baseUrl}/ruya/HelpAndSupport/1.0/UpdateRequest(gits_casenumber='${currentCase.gits_casenumber}')?$select=gits_casenumber,statuscode`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        Prefer: 'return=representation',
                        'If-Match': '*',
                    },
                    body: JSON.stringify({ statuscode: 1, gits_description: values.description, gits_approvereject: null }),
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            message.success(`Case ${currentCase.gits_casenumber} reopened successfully`);
            reopenForm.resetFields();
            refreshCases();
        } catch (e: any) {
            message.error(`Failed to reopen case: ${e.message}`);
        }
    };

    // ── Upload docs ───────────────────────────────────────────────────────────

    const uploadDocuments = async () => {
        if (!fileList.length || !currentCase) return;
        let success = 0;
        for (const file of fileList) {
            try {
                const b64 = await fileToBase64(file.originFileObj as File);
                const token = await ensureToken();
                if (!token) continue;
                const body = {
                    arg1: {
                        channelId: config.docChannel || '3',
                        uuid: config.uuid || '20275',
                        documentKey: 'CAS',
                        documentValue: currentCase.gits_casenumber,
                        document: { documentType: '1', fileName: file.name, documentBody: b64 },
                    },
                };
                const res = await fetch(`${config.baseUrl}/cco/1.0/applicantdocupload`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                success++;
            } catch (e: any) {
                message.error(`Failed to upload ${file.name}: ${e.message}`);
            }
        }
        if (success) {
            message.success(`${success} file(s) uploaded`);
            setFileList([]);
        }
    };

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    // ── Save config ───────────────────────────────────────────────────────────

    const saveConfig = async (values: Config) => {
        const cfg = { ...values, baseUrl: values.baseUrl.replace(/\/$/, '') };
        setConfig(cfg);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
        settingsForm.setFieldsValue(cfg);
        message.success('Configuration saved');
        await authenticate(cfg);
        refreshCases();
    };

    // ── Stats ─────────────────────────────────────────────────────────────────

    const countByStatus = (code: number) => cases.filter(c => c.statuscode === code).length;

    // ── Cases table columns ───────────────────────────────────────────────────

    const columns: ColumnsType<SupportCase> = [
        {
            title: 'Case #',
            dataIndex: 'gits_casenumber',
            render: (v: string) => <Text strong className="text-brandColor cursor-pointer">{v ?? '—'}</Text>,
        },
        { title: 'CIF', dataIndex: 'gits_cif', render: (v: string) => v ?? '—' },
        {
            title: 'Sub-type',
            render: (_: any, r: SupportCase) => r.gits_requestsubtype?.gits_title ?? '—',
        },
        {
            title: 'Description',
            dataIndex: 'gits_description',
            render: (v: string) => <Text ellipsis={{ tooltip: v }} style={{ maxWidth: 240 }}>{v ?? '—'}</Text>,
        },
        {
            title: 'Status',
            dataIndex: 'statuscode',
            render: (code: number, r: SupportCase) => statusTag(code, r['statuscode@OData.Community.Display.V1.FormattedValue']),
        },
        { title: 'Email', dataIndex: 'gits_initiatoremail', render: (v: string) => v ?? '—' },
        {
            title: '',
            render: (_: any, r: SupportCase) => (
                <Button size="small" onClick={() => { setCurrentCase(r); setView('detail'); }}>
                    View
                </Button>
            ),
        },
    ];

    // ── Render ────────────────────────────────────────────────────────────────

    const navTabs: { key: View; label: string; icon: React.ReactNode; badge?: number }[] = [
        { key: 'dashboard', label: 'Dashboard',   icon: <FileTextOutlined /> },
        { key: 'cases',     label: 'All Cases',   icon: <FileTextOutlined />, badge: countByStatus(1) + countByStatus(449930003) },
        { key: 'new-case',  label: 'New Case',    icon: <PlusOutlined /> },
        { key: 'settings',  label: 'API Settings',icon: <SettingOutlined /> },
    ];

    return (
        <div>
            {/* ── Top tab bar ── */}
            <Flex align="center" justify="space-between" style={{
                background: '#fff', borderBottom: '1px solid #E4E7EC',
                marginBottom: 20, flexWrap: 'wrap', gap: 8,
            }}>
                <Flex>
                    {navTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setView(tab.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '12px 18px', border: 'none', background: 'transparent',
                                borderBottom: view === tab.key ? '2px solid #FF3A3A' : '2px solid transparent',
                                color: view === tab.key ? '#FF3A3A' : '#595959',
                                fontWeight: view === tab.key ? 600 : 400,
                                fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap',
                                fontFamily: 'Roboto, system-ui, sans-serif',
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.badge ? (
                                <span style={{ background: '#FF3A3A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, marginLeft: 2 }}>
                                    {tab.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </Flex>
                <Flex gap={8} style={{ paddingRight: 16 }}>
                    <Button icon={<ReloadOutlined />} size="small" onClick={refreshCases} loading={loading}>Refresh</Button>
                    <Button icon={<PlusOutlined />} type="primary" danger size="small" onClick={() => setView('new-case')}>New Case</Button>
                </Flex>
            </Flex>

            {/* Content area */}
            <div>

                    {/* ── DASHBOARD ── */}
                    {view === 'dashboard' && (
                        <>
                            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                                {[
                                    { label: 'Open', value: countByStatus(1), color: '#3B82F6', bg: '#EFF6FF', icon: <ClockCircleOutlined /> },
                                    { label: 'Clarification', value: countByStatus(449930003), color: '#F59E0B', bg: '#FFFBEB', icon: <QuestionCircleOutlined /> },
                                    { label: 'Rejected', value: countByStatus(449930001), color: '#EF4444', bg: '#FEF2F2', icon: <CloseCircleOutlined /> },
                                    { label: 'Approved', value: countByStatus(449930000), color: '#10B981', bg: '#ECFDF5', icon: <CheckCircleOutlined /> },
                                    { label: 'Closed', value: countByStatus(449930002), color: '#6B7280', bg: '#F9FAFB', icon: <CheckCircleOutlined /> },
                                    { label: 'Total', value: cases.length, color: '#0A2540', bg: '#F0F4FF', icon: <FileTextOutlined /> },
                                ].map(s => (
                                    <Col key={s.label} xs={12} sm={8} md={8} lg={4}>
                                        <Card bodyStyle={{ padding: '16px 18px' }}>
                                            <Flex align="center" justify="center" style={{
                                                width: 36, height: 36, borderRadius: 10,
                                                background: s.bg, color: s.color, marginBottom: 10,
                                            }}>{s.icon}</Flex>
                                            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.6px', display: 'block' }}>{s.label}</Text>
                                            <Statistic value={s.value} valueStyle={{ fontSize: 28, fontWeight: 800, color: s.color }} />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            <Card
                                title={<Text strong>Recent Cases</Text>}
                                extra={<Button size="small" onClick={() => setView('cases')}>View all</Button>}
                            >
                                <Table
                                    dataSource={cases.slice(0, 8)}
                                    columns={columns}
                                    rowKey="gits_casenumber"
                                    size="small"
                                    pagination={false}
                                    loading={loading}
                                    locale={{ emptyText: <Empty description="No cases loaded — configure API settings and refresh" /> }}
                                    onRow={r => ({ onClick: () => { setCurrentCase(r); setView('detail'); } })}
                                />
                            </Card>
                        </>
                    )}

                    {/* ── ALL CASES ── */}
                    {view === 'cases' && (
                        <>
                            <Flex gap={12} style={{ marginBottom: 16 }} wrap="wrap">
                                <Input.Search
                                    placeholder="Search by case #, CIF, description…"
                                    style={{ maxWidth: 360 }}
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                    allowClear
                                />
                                <Select
                                    placeholder="All Statuses"
                                    style={{ width: 180 }}
                                    allowClear
                                    value={statusFilter || undefined}
                                    onChange={v => setStatusFilter(v ?? '')}
                                    options={[
                                        { value: '1', label: 'Open' },
                                        { value: '449930000', label: 'Approved' },
                                        { value: '449930001', label: 'Rejected' },
                                        { value: '449930002', label: 'Closed' },
                                        { value: '449930003', label: 'Clarification' },
                                    ]}
                                />
                                <Button onClick={() => { setSearchText(''); setStatusFilter(''); }}>Clear</Button>
                            </Flex>
                            <Card title={<Text strong>Cases</Text>} extra={<Text type="secondary">{filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}</Text>}>
                                <Table
                                    dataSource={filteredCases}
                                    columns={columns}
                                    rowKey="gits_casenumber"
                                    size="small"
                                    loading={loading}
                                    locale={{ emptyText: <Empty description="No cases found" /> }}
                                    onRow={r => ({ onClick: () => { setCurrentCase(r); setView('detail'); }, style: { cursor: 'pointer' } })}
                                    pagination={{ pageSize: 10, showSizeChanger: false }}
                                />
                            </Card>
                        </>
                    )}

                    {/* ── NEW CASE ── */}
                    {view === 'new-case' && (
                        <div style={{ maxWidth: 760 }}>
                            <Card title={<Text strong>Create New Support Case</Text>}>
                                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '10px 14px', marginBottom: 20, color: '#1E40AF', fontSize: 13 }}>
                                    Creates a new Help &amp; Support request via <code style={{ background: '#DBEAFE', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>POST /ruya/HelpAndSupport/1.0/CreateRequest</code>
                                </div>
                                <Form form={newCaseForm} layout="vertical" onFinish={submitNewCase} initialValues={{ origin: '1010' }}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="cif" label="Customer CIF" rules={[{ required: true }]} extra="9-digit CIF issued during customer onboarding">
                                                <Input placeholder="e.g. 300103046" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="reqType" label="Request Type ID" rules={[{ required: true }]} extra="Service request type ID">
                                                <Input placeholder="e.g. SRT-01028" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="reqSubType" label="Request Sub-Type ID" rules={[{ required: true }]} extra="Service request sub-type ID">
                                                <Input placeholder="e.g. SRST-01144" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="mobile" label="Customer Mobile" rules={[{ required: true }]}>
                                                <Input placeholder="e.g. 54498451" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="email" label="Customer Email" rules={[{ required: true, type: 'email' }]}>
                                                <Input placeholder="customer@example.com" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="eid" label="Emirates ID">
                                                <Input placeholder="e.g. 878946565" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="trade" label="Trade Licence No.">
                                                <Input placeholder="e.g. 45641236" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="financial" label="Financial Account" extra="Optional — link to specific account">
                                                <Input placeholder="e.g. 3001093060000001" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="origin" label="Origin Channel ID" rules={[{ required: true }]}>
                                                <Input placeholder="e.g. 1010" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item name="description" label="Description / Concern" rules={[{ required: true }]}>
                                                <TextArea rows={4} placeholder="Describe the customer's issue in detail…" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Flex justify="flex-end" gap={10}>
                                        <Button onClick={() => { newCaseForm.resetFields(); newCaseForm.setFieldValue('origin', '1010'); }}>Reset</Button>
                                        <Button type="primary" danger htmlType="submit" icon={<PlusOutlined />}>Create Case</Button>
                                    </Flex>
                                </Form>
                            </Card>
                        </div>
                    )}

                    {/* ── CASE DETAIL ── */}
                    {view === 'detail' && currentCase && (
                        <>
                            <Button icon={<ArrowLeftOutlined />} type="text" style={{ marginBottom: 16, color: '#64748B' }} onClick={() => setView('cases')}>
                                Back to Cases
                            </Button>
                            <Row gutter={20} align="top">
                                <Col xs={24} lg={15} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    <Card
                                        title={
                                            <Flex justify="space-between" align="center">
                                                <div>
                                                    <Text strong style={{ fontSize: 16 }}>{currentCase.gits_casenumber ?? '—'}</Text>
                                                    <div><Text type="secondary" style={{ fontSize: 12 }}>{currentCase.gits_helpsupportid ?? ''}</Text></div>
                                                </div>
                                                {statusTag(currentCase.statuscode, currentCase['statuscode@OData.Community.Display.V1.FormattedValue'])}
                                            </Flex>
                                        }
                                    >
                                        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                                            {[
                                                { label: 'Customer CIF', value: currentCase.gits_cif },
                                                { label: 'Initiator Email', value: currentCase.gits_initiatoremail },
                                                { label: 'Request Sub-type', value: currentCase.gits_requestsubtype?.gits_title },
                                                { label: 'Financial Account', value: currentCase.gits_financialaccount?.msfsi_number },
                                            ].map(f => (
                                                <Col span={12} key={f.label}>
                                                    <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>{f.label}</Text>
                                                    <Text>{f.value ?? '—'}</Text>
                                                </Col>
                                            ))}
                                        </Row>
                                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 6 }}>Description / Remarks</Text>
                                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: 14, fontSize: 13.5, lineHeight: 1.6 }}>
                                            {currentCase.gits_description ?? currentCase.gits_remarks ?? '—'}
                                        </div>
                                    </Card>

                                    {/* Reopen card */}
                                    <Card title={<Text strong>Case Actions</Text>}>
                                        {(currentCase.statuscode === 449930001 || currentCase.statuscode === 449930003) && (
                                            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#92400E', fontSize: 13 }}>
                                                {currentCase.statuscode === 449930001
                                                    ? 'This case was Rejected. You can reopen it by providing additional information.'
                                                    : 'Clarification is required. Please provide additional details to reopen the case.'}
                                            </div>
                                        )}
                                        <Form form={reopenForm} onFinish={reopenCase}>
                                            <Form.Item name="description" label={<Text strong>Updated Description / Response</Text>} rules={[{ required: true }]}>
                                                <TextArea rows={3} placeholder="Provide your response or updated description…" />
                                            </Form.Item>
                                            <Flex justify="flex-end">
                                                <Button
                                                    type="primary"
                                                    danger
                                                    icon={<ReloadOutlined />}
                                                    htmlType="submit"
                                                    disabled={currentCase.statuscode === 449930000 || currentCase.statuscode === 449930002}
                                                >
                                                    Reopen Case
                                                </Button>
                                            </Flex>
                                        </Form>
                                    </Card>
                                </Col>

                                <Col xs={24} lg={9} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {/* Document upload */}
                                    <Card title={<Text strong>Documents</Text>} extra={<Text type="secondary" style={{ fontSize: 12 }}>Upload supporting files</Text>}>
                                        <Dragger
                                            multiple
                                            fileList={fileList}
                                            beforeUpload={() => false}
                                            onChange={({ fileList: fl }) => setFileList(fl)}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        >
                                            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                                            <p style={{ fontSize: 13 }}>Drag &amp; drop files here, or <Text style={{ color: '#FF3A3A' }}>browse</Text></p>
                                            <p style={{ fontSize: 11.5, color: '#94A3B8' }}>PDF, JPG, PNG up to 10 MB</p>
                                        </Dragger>
                                        {fileList.length > 0 && (
                                            <Flex justify="flex-end" style={{ marginTop: 12 }}>
                                                <Button type="primary" danger icon={<CloudUploadOutlined />} size="small" onClick={uploadDocuments}>
                                                    Upload {fileList.length} File{fileList.length > 1 ? 's' : ''}
                                                </Button>
                                            </Flex>
                                        )}
                                    </Card>

                                    {/* Timeline */}
                                    <Card title={<Text strong>Status Timeline</Text>}>
                                        {[
                                            { title: 'Case Created', desc: 'Case submitted to bank for review' },
                                            { title: 'Acknowledgement Email Sent', desc: 'Automated notification dispatched' },
                                            { title: `Status: ${currentCase['statuscode@OData.Community.Display.V1.FormattedValue'] ?? 'Unknown'}`, desc: 'Current state of the request' },
                                            ...(currentCase.statuscode === 449930001 || currentCase.statuscode === 449930003
                                                ? [{ title: 'Awaiting Customer Response', desc: 'Reopen case to provide additional information' }]
                                                : []),
                                        ].map((item, i, arr) => (
                                            <Flex key={i} gap={12} style={{ marginBottom: i < arr.length - 1 ? 0 : 0 }}>
                                                <Flex vertical align="center" style={{ flexShrink: 0 }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === arr.length - 1 ? '#FF3A3A' : '#E2E8F0', marginTop: 4 }} />
                                                    {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: '#E2E8F0', margin: '4px 0', minHeight: 24 }} />}
                                                </Flex>
                                                <div style={{ paddingBottom: 16 }}>
                                                    <Text strong style={{ fontSize: 13 }}>{item.title}</Text>
                                                    <br />
                                                    <Text type="secondary" style={{ fontSize: 11.5 }}>{item.desc}</Text>
                                                </div>
                                            </Flex>
                                        ))}
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* ── SETTINGS ── */}
                    {view === 'settings' && (
                        <div style={{ maxWidth: 680 }}>
                            <Card title={<Text strong>API Configuration</Text>} style={{ marginBottom: 20 }}>
                                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 14px', marginBottom: 20, color: '#92400E', fontSize: 13 }}>
                                    Credentials are stored in your browser's local session only and never transmitted to third parties.
                                </div>
                                <Form form={settingsForm} layout="vertical" onFinish={saveConfig} initialValues={config}>
                                    <Form.Item name="baseUrl" label="Base URL" extra="e.g. https://uat-emw.ruyabank.ae">
                                        <Input placeholder="https://uat-emw.ruyabank.ae" />
                                    </Form.Item>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="clientId" label="Client ID">
                                                <Input placeholder="ABCD12345" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="clientSecret" label="Client Secret">
                                                <Input.Password placeholder="••••••••" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="partnerCif" label="Partner CIF (gits_cif)" extra="Your fintech partner CIF from onboarding">
                                                <Input placeholder="e.g. 300103046" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="channelId" label="Channel ID (gits_origin)">
                                                <Input placeholder="e.g. 1010" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="docChannel" label="Channel ID for Documents">
                                                <Input placeholder="e.g. 3" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="uuid" label="UUID (Document API)">
                                                <Input placeholder="e.g. 20275" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Divider />
                                    <Flex align="center" gap={12}>
                                        <Button type="primary" danger htmlType="submit">Save &amp; Authenticate</Button>
                                        <Button onClick={() => authenticate()} loading={authStatus === 'Authenticating…'}>Test Connection</Button>
                                        <Text type="secondary" style={{ fontSize: 12 }}>{authStatus}</Text>
                                    </Flex>
                                </Form>
                            </Card>

                            <Card title={<Text strong>API Reference Summary</Text>}>
                                <Table
                                    size="small"
                                    pagination={false}
                                    dataSource={[
                                        { key: 1, name: 'Create Case',      method: 'POST',  endpoint: '/ruya/HelpAndSupport/1.0/CreateRequest' },
                                        { key: 2, name: 'Fetch Cases',      method: 'GET',   endpoint: '/ruya/HelpAndSupport/1.0/EnquireRequest' },
                                        { key: 3, name: 'Upload Document',  method: 'POST',  endpoint: '/cco/1.0/applicantdocupload' },
                                        { key: 4, name: 'Reopen Case',      method: 'PATCH', endpoint: '/ruya/HelpAndSupport/1.0/UpdateRequest(...)' },
                                        { key: 5, name: 'Get Token',        method: 'POST',  endpoint: '/token' },
                                    ]}
                                    columns={[
                                        { title: '#', dataIndex: 'key', width: 40 },
                                        { title: 'Name', dataIndex: 'name' },
                                        {
                                            title: 'Method', dataIndex: 'method',
                                            render: (m: string) => {
                                                const colors: Record<string, string> = { POST: 'green', GET: 'blue', PATCH: 'orange' };
                                                return <Tag color={colors[m] ?? 'default'}>{m}</Tag>;
                                            },
                                        },
                                        { title: 'Endpoint', dataIndex: 'endpoint', render: (v: string) => <code style={{ fontSize: 11, background: '#F1F5F9', padding: '1px 5px', borderRadius: 4 }}>{v}</code> },
                                    ]}
                                />
                            </Card>
                        </div>
                    )}
            </div>

            {/* ── Success modal ── */}
            <Modal
                open={successModal}
                title="Case Created Successfully"
                onCancel={() => setSuccessModal(false)}
                footer={[
                    <Button key="close" onClick={() => setSuccessModal(false)}>Close</Button>,
                    <Button key="view" type="primary" danger onClick={() => {
                        setSuccessModal(false);
                        if (lastCreated?.gits_casenumber) {
                            const found = cases.find(c => c.gits_casenumber === lastCreated.gits_casenumber);
                            if (found) { setCurrentCase(found); setView('detail'); }
                        }
                    }}>View Case</Button>,
                ]}
            >
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#065F46', fontSize: 13 }}>
                    The support case has been created and an acknowledgement email has been triggered.
                </div>
                <Row gutter={[12, 12]}>
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', display: 'block' }}>Case Number</Text>
                        <Text strong style={{ fontSize: 22, color: '#FF3A3A' }}>{lastCreated?.gits_casenumber ?? '—'}</Text>
                    </Col>
                    <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', display: 'block' }}>CIF</Text>
                        <Text>{lastCreated?.gits_cif ?? '—'}</Text>
                    </Col>
                    <Col span={24}>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', display: 'block' }}>Case ID</Text>
                        <Text style={{ fontSize: 12 }}>{lastCreated?.gits_helpsupportid ?? '—'}</Text>
                    </Col>
                </Row>
            </Modal>
        </div>
    );
}
