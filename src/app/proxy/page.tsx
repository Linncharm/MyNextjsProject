'use client'

import Image from "next/image";
import styles from "./page.module.css";
import {Button, Table, Tooltip, Collapse, Select} from 'antd';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Menu , message} from 'antd';
import { columns, items } from "@/app/proxy/data";
import {qaData} from "@/app/proxy/qAndA"
import {CopyOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";

export default function Home() {
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
            }
        };

        fetchCountries();
    }, [supabase]);

    // 从数据库获取路由信息。路径
    const handleMenuClick = (e: { key: string }) => {
        setSelectedKey(e.key); // 更新选中的 key
        const fetchProxyPath = async () => {
            // let type: string = 'country';
            // if (e.key === 'china' || e.key === 'japan' || e.key === 'us' || e.key === 'usa') {
            //     type = 'country';
            // }
            // if (e.key === 'http' || e.key === 'socks4' || e.key === 'socks5' || e.key === 'https') {
            //     type = 'protocol';
            // }
            // if (e.key === 'http-anonymous' || e.key === 'http-high' || e.key === 'http-transparent' || e.key === 'socks4-very-high' || e.key === 'socks5-very-high') {
            //     type = 'anonymity';
            // }

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
                                    options={[
                                        {value: 'JSON', label: 'JSON'},
                                        {value: 'CSV', label: 'CSV'},
                                        {value: 'TXT', label: 'TXT'},
                                    ]}
                                >

                                </Select>
                                <Button>
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
