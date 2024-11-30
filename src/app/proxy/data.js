import {Space} from "antd";

export const items = [
    {
        key: 'sub1',
        label: 'Country',
        children: [
            { key: 'United States', label: 'United States', type: 'country' },
            { key: 'China', label: 'China', type: 'country' },
            { key: 'Japan', label: 'Japan', type: 'country' },
            { key: 'United Kingdom', label: 'United Kingdom', type: 'country' },
            { key: 'Russia', label: 'Russia', type: 'country' },
            { key: 'Brazil', label: 'Brazil', type: 'country' },
            { key: 'Hong Kong', label: 'China ( Hong Kong )', type: 'country' },
            { key: 'Colombia', label: 'Colombia', type: 'country' },
            { key: 'Singapore', label: 'Singapore', type: 'country' },
            { key: 'Mexico', label: 'Mexico', type: 'country' },
        ]
    },
    {
        key: 'sub2',
        label: 'Protocol',
        children: [
            { key: 'HTTP', label: 'HTTP', type: 'protocol' },
            { key: 'SOCKS4', label: 'Socks4', type: 'protocol' },
            { key: 'SOCKS5', label: 'Socks5', type: 'protocol' },
            { key: 'HTTPS', label: 'HTTPS', type: 'protocol' },
        ],
    },
    {
        key: 'sub3',
        label: 'Anonymity Level',
        children: [
            { key: 'Non-anonymous proxy', label: 'Non-anonymous', type: 'anonymity' },
            { key: 'Anonymous proxy server', label: 'Anonymous proxy server', type: 'anonymity' },
            { key: 'High anonymous proxy', label: 'High anonymous', type: 'anonymity' },
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
    {
        title: 'Speed',
        dataIndex: 'ping',
        key: 'speed',
    }
];