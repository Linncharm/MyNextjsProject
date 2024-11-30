import {Space} from "antd";
import {CopyOutlined} from "@ant-design/icons";

export const items = [
    {
        key: 'sub1',
        label: 'Country',
        children: [
            { key: 'us', label: 'US', type: 'country' },
            { key: 'china', label: 'China', type: 'country' },
            { key: 'japan', label: 'Japan', type: 'country' },
            { key: 'usa', label: 'USA', type: 'country' },
        ],
    },
    {
        key: 'sub2',
        label: 'Protocol',
        children: [
            { key: 'http', label: 'HTTP', type: 'protocol' },
            { key: 'socks4', label: 'Socks 4', type: 'protocol' },
            { key: 'socks5', label: 'Socks 5', type: 'protocol' },
            { key: 'https', label: 'HTTPS', type: 'protocol' },
        ],
    },
    {
        key: 'sub3',
        label: 'Anonymity Level',
        children: [
            { key: 'http_anonymous', label: 'Http (anonymous)', type: 'anonymity' },
            { key: 'http_high', label: 'Http (high)', type: 'anonymity' },
            { key: 'http_transparent', label: 'Http (transparent)', type: 'anonymity' },
            { key: 'socks4_very_high', label: 'Socks4 (very high)', type: 'anonymity' },
            { key: 'socks5_very_high', label: 'Socks5 (very high)', type: 'anonymity' },
        ],
    },
];


export const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'Country',
        dataIndex: 'country',
        key: 'country',
    },
    {
        title: 'Protocol',
        dataIndex: 'protocol',
        key: 'protocol',
    },
    {
        title: 'Anonymity Level',
        dataIndex: 'anonymity_level',
        key: 'anonymity'
    },
];