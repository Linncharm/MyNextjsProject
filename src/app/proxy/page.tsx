'use client'

import dynamic from "next/dynamic";
import styles from "./page.module.css";
//import {Button, Tooltip, Select} from 'antd';
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";
import {Collapse, message} from 'antd';
import {columns, items} from "@/app/proxy/data";
import {qaData} from "@/app/proxy/qAndA"
import {CopyOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";

const Button = dynamic(() => import('antd/es/button'), {
    loading: () => <p>Loading Button...</p>,
});

const Select = dynamic(() => import('antd/es/select'), {
    loading: () => <p>Loading Select...</p>,
});

const Menu = dynamic(() => import('antd/es/menu'), {
    loading: () => <p>Loading Menu...</p>,
});

const Tooltip = dynamic(() => import('antd/es/tooltip'), {
    loading: () => <p>Loading Tooltip...</p>,
});

const Table = dynamic(() => import('antd/es/table'), {
    loading: () => <p>Loading Table...</p>,
});


export default function Home() {
    const [selectedFormat, setSelectedFormat] = useState("JSON"); // 用于存储选择的格式
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [countries, setCountries] = useState([]);
    const [selectedKey, setSelectedKey] = useState<string>('1'); // 维护选中的 key
    const supabase = createClient();

    // 使用 useMessage hook 创建消息实例
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        // 从数据库加载国家信息
        const fetchCountries = async () => {
            const { data, error } = await supabase.from("proxy").select('*');
            if (!error) {
                const processedData = data.map((item, index) => ({
                    ...item,
                    id: index + 1, // 自增 ID
                }));
                setCountries(processedData || []);
                //console.log('processedData:', processedData);
                setIsLoading(false);

                // 提取并去重国家
                const uniqueCountries = Array.from(new Set(processedData.map(item => item.country)));

                // 创建 children 数组
                items[0].children = uniqueCountries.map(country => ({
                    key: country,
                    label: country,
                    type: 'country',
                })); // 更新 items 的 children
            }
        };

        fetchCountries();
    }, [supabase]);

    // 从数据库获取路由信息。路径
    const handleMenuClick = (e: { key: string }) => {
        setSelectedKey(e.key); // 更新选中的 key
        const fetchProxyPath = async () => {
            try {
                // 一定要将 supabase 的表设置为 public
                // 从 Supabase 查询数据
                const { data, error } = await supabase
                    .from("router")
                    .select("path") // 只查询所需字段，优化性能
                    .eq("type", e.key) // 根据 key 查询
                    .single(); // 确保只返回一条记录

                // 处理错误
                if (error) {
                    console.error("查询失败：", error.message);
                    alert(`无法获取国家路径，错误信息：${error.message}`);
                    return;
                }

                // 确保 data 存在
                if (!data || !data.path) {
                    console.error("查询结果为空或缺少 'path' 字段");
                    alert(`无法获取有效的国家路径，请稍后重试。`);
                    return;
                }

                // 跳转到动态路由
                router.push(`/proxy/${data.path}`);
            } catch (err) {
                console.error("发生意外错误：", err);
                alert("发生意外错误，请稍后重试。");
            }
        };

        fetchProxyPath();
    };

    const handleCopy = (address: string) => {
        navigator.clipboard.writeText(address).then(() => {
            console.log('Address copied to clipboard!');
            messageApi.success('Address copied to clipboard!');
        }).catch(() => {
            messageApi.error('Failed to copy address.');
        });
    };

    const generateColumns = (columns) => {
        const newColumns = [...columns];
        const copyColumn = {
            title: 'Copy',
            dataIndex: 'copy',
            key: 'copy',
            render: (_, record) => (
                <Tooltip title="Click to copy address">
                    <CopyOutlined
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCopy(record.address || '')}
                    />
                </Tooltip>
            ),
        };

        const addressIndex = newColumns.findIndex(col => col.dataIndex === 'address');
        if (addressIndex !== -1) {
            newColumns.splice(addressIndex + 1, 0, copyColumn);
        } else {
            newColumns.push(copyColumn);
        }

        return newColumns;
    };

    const handleDownload = () => {
        let content;
        if (selectedFormat === "JSON") {
            content = JSON.stringify(countries, null, 2); // 格式化为 JSON
        } else if (selectedFormat === "CSV") {
            const headers = Object.keys(countries[0]).join(",") + "\n"; // 获取表头
            const rows = countries.map(row => Object.values(row).join(",")).join("\n"); // 获取数据行
            content = headers + rows; // 拼接表头和数据行
        } else if (selectedFormat === "TXT") {
            content = countries.map(row =>
                `id: ${row.id}\n` +
                `address: ${row.address}\n` +
                `country: ${row.country}\n` +
                `protocol: ${row.protocol}\n` +
                `anonymity_level: ${row.anonymity_level}\n` +
                `ping: ${row.ping}\n`
            ).join("\n"); // 使用换行符分隔每个代理信息
        } else {
            return; // 不支持的格式
        }

        const blob = new Blob([content], { type: selectedFormat === "JSON" ? "application/json" : "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `proxies.${selectedFormat.toLowerCase()}`; // 设置下载文件名
        a.click();
        URL.revokeObjectURL(url); // 释放内存
    };

    if (isLoading) {
        return (
            <div className={styles.isLoading}>
                <span>Loading...</span>
            </div>
        );
    }

    const customExpandIcon = ({ isActive }) => (
        isActive ? <MinusOutlined style={{ fontSize: '16px', color: '#000000' ,marginRight:'10px',marginTop:'10px' }} />
            : <PlusOutlined style={{ fontSize: '16px', color: '#000000' ,marginRight:'10px',marginTop:'10px'}} />
    );

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Free Proxy Server List</h1>
                <div className={styles.subtilte}>
                    <h3>Welcome to your go-to source for the best free proxy server list. We offer a wide range of
                        reliable and secure free proxies, including free web proxies and proxy servers, all available to
                        meet your online needs. Our free proxy list is regularly updated to ensure you have access to
                        the latest free proxy sites and hosts. Whether you need an online proxy free of charge or a
                        secure proxy server, we’ve got you covered with the best options available.</h3>
                </div>
                <div className={styles.card}>
                    <h3>Use Free Proxies with DICloak Browser. Stay Secure and Anonymous!</h3>
                    <Button
                        className={styles.cardButton}
                        onClick={() => window.open('https://dicloak.com/download', '_blank')} // 在新标签页打开链接
                    >
                        Download DICloak Browser
                    </Button>
                </div>
                <div className={styles.content}>
                    <Menu
                        className={styles.menu}
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        selectedKeys={[selectedKey]}
                        mode="inline"
                        theme="dark"
                        items={items}
                        onClick={handleMenuClick}
                    />
                    <div className={styles.table}>
                        <div className={styles.download}>
                            <div style={{padding: '10px,', margin: '10px 15px 30px 20px'}}>
                                <h2>Download our free proxy list in:</h2>
                            </div>
                            <div className={styles.downloadGroup}>
                                <Select
                                    defaultValue="JSON"
                                    style={{ width: 180 }}
                                    onChange={setSelectedFormat} // 更新选择的格式
                                    options={[
                                        {value: 'JSON', label: 'JSON'},
                                        {value: 'CSV', label: 'CSV'},
                                        {value: 'TXT', label: 'TXT'},
                                    ]}
                                >

                                </Select>
                                <Button onClick={handleDownload}>
                                    Download
                                </Button>
                            </div>

                        </div>
                        <Table
                            dataSource={countries}
                            columns={generateColumns(columns)}
                            pagination={{
                                position: ['bottomCenter'],
                                //pageSize: 30,
                            }}
                            rowKey="id"
                            scroll={{ y: 628 }}
                        />
                    </div>
                </div>
                <div className={styles.bottomCard}>
                    <h1
                        style={{
                            textAlign: 'left',
                            fontWeight: 'bold',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'color 0.3s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#13c798')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                        onClick={() => window.open('https://dicloak.com/download', '_blank')} // 在新标签页打开链接
                    >
                        Guide to Using a Free Proxy with DICloak Antidetect Browser
                        <span style={{marginRight: '10px'}}> {/* 图标与文本之间的间距 */}
                            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="-5 -5 24 24"
                                 stroke-linecap="round" stroke-linejoin="round" className="ml-2 inline-block"
                                 height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path
                                d="M7 7h10v10"></path><path d="M7 17 17 7"></path>
                            </svg>
                        </span>
                    </h1>
                    <h4 style={{margin: '20px 0', lineHeight: '1.5', color: '#bfb9b9'}}>
                        Our website offers a variety of free proxy types to suit your needs. You can easily download our
                        free proxy list in TXT, CSV, or JSON format for offline access.
                    </h4>
                    <h4 style={{margin: '20px 0', lineHeight: '1.5', color: '#a29e9e'}}>
                    Explore our free online proxy options to keep your browsing private and bypass geo-restrictions
                        with ease. Stay anonymous and secure your personal data with our reliable proxy servers. Join
                        thousands of users who trust us to find the best free proxies, including free web proxies and
                        proxy servers, available today.
                    </h4>
                </div>
                <div className={styles.questionAndAnswer}>
                    <div className={styles.questionTitle}>
                        <h1>Frequently Asked Questions</h1>
                    </div>
                    <div className={styles.questionContent}>
                        <Collapse
                            expandIcon={customExpandIcon}
                            expandIconPosition={'end'}
                        >
                            {qaData.map((qa, index) => (
                                <Collapse.Panel
                                    header={<h1
                                        style={{fontSize: '20px', margin: 0}}>{qa.question}</h1>} // 使用 h1 标签作为 header
                                    key={index}
                                    style={{backgroundColor: '#f0f0f0'}}
                                >
                                    <h3 style={{margin: 0 ,color:'#777575'}}>{qa.answer}</h3> {/* 使用 h3 标签作为内容 */}
                                </Collapse.Panel>
                            ))}
                        </Collapse>
                    </div>
                </div>
            </main>
            {contextHolder} {/* Render the message context holder here */}
        </div>
    );
}
