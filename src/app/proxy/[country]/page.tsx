"use client"

import Image from "next/image";
import styles from "./page.module.css";
import {Button, Table, Tooltip, message, Select, Collapse} from 'antd';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Menu } from 'antd';
import { columns, items } from "@/app/proxy/[country]/data";
import { Simulate } from "react-dom/test-utils";
import {CopyOutlined, MinusOutlined, PlusOutlined} from '@ant-design/icons';
import { qaData} from "@/app/proxy/[country]/qAndA";

export default function Home({ params }: { params: {params:Promise<{country:string}>} }) {
    const getPath = async (): Promise<string | undefined> => {
        try {
            const { country } = await params;
            return country;
        } catch (e) {
            console.error("获取路径失败:", e);
            return undefined;
        }
    };

    const [openKeys, setOpenKeys] = useState(['sub1', 'sub2', 'sub3']); // 默认展开的目录项

    // 菜单项展开事件处理
    const onOpenChange = (keys: string[]) => {
        const latestOpenKey = keys.find(key => !openKeys.includes(key));
        setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    };

    const [countries, setCountries] = useState([]);
    const [selectedKey, setSelectedKey] = useState("1");
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    // 使用 useMessage hook 创建消息实例
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const path = getPath();
        const fetchProxies = async (type: string) => {
            try {
                const { data, error } = await supabase
                    .from("proxy")
                    .select("*")
                    .or(`country.eq.${type},protocol.eq.${type},anonymity_level.eq.${type}`);
                console.log("....", data, type);
                if (!error) {
                    const processedData = data.map((item, index) => ({
                        ...item,
                        id: index + 1,
                    }));
                    setCountries(processedData || []);
                } else {
                    console.error("加载国家信息失败:", error);
                }
            } catch (err) {
                console.error("加载国家信息时发生错误:", err);
            }
        };

        const fetchSelectedKey = async (path: string) => {
            try {
                const { data, error } = await supabase
                    .from("router")
                    .select("type")
                    .eq("path", path);

                if (error) {
                    console.error("数据库查询错误:", error);
                    return;
                }

                if (data && data.length > 0) {
                    setSelectedKey(data[0].type);
                    console.log("选中的键值:", data[0].type);
                    return data[0].type;
                } else {
                    console.warn("未找到匹配的路径");
                    setSelectedKey("1");
                    return;
                }
            } catch (err) {
                console.error("查询过程中出现错误:", err);
                setSelectedKey("1");
                return;
            }
        };

        const fetchData = async () => {
            try {
                const path = await getPath();
                if (path) {
                    const isSelectKey = await fetchSelectedKey(path);
                    if (isSelectKey) {
                        await fetchProxies(isSelectKey);
                    } else {
                        console.error("未返回有效的类型键值");
                    }
                } else {
                    console.error("未获取有效路径");
                }
            } catch (e) {
                console.error("数据加载失败:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [supabase]);

    const handleCopy = (address: string) => {
        navigator.clipboard.writeText(address).then(() => {
            console.log('Address copied to clipboard!');
            messageApi.success('Address copied to clipboard!');
        }).catch(() => {
            messageApi.error('Failed to copy address.');
        });
    };

    const handleMenuClick = (e: { key: string }) => {
        setSelectedKey(e.key);
        setOpenKeys([e.key]);
        const fetchProxyPath = async () => {
            try {
                const { data, error } = await supabase
                    .from("router")
                    .select("path")
                    .eq("type", e.key)
                    .single();

                if (error) {
                    console.error("查询失败：", error.message);
                    alert(`无法获取国家路径，错误信息：${error.message}`);
                    return;
                }

                if (!data || !data.path) {
                    console.error("查询结果为空或缺少 'path' 字段");
                    alert(`无法获取有效的国家路径，请稍后重试。`);
                    return;
                }

                router.push(`/proxy/${data.path}`);
            } catch (err) {
                console.error("发生意外错误：", err);
                alert("发生意外错误，请稍后重试。");
            }
        };

        fetchProxyPath();
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


        // 渲染菜单项
        const renderMenuItems = (items) => {
            return items.map((item) => {
                return {
                    ...item,
                    label: (
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span>{item.label}</span>
                            {/* 判断是否选中该菜单项 */}
                            {item.key === selectedKey && (
                                <span
                                    style={{
                                        marginRight: 75,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '20px', // 设置圆球的宽度
                                        height: '20px', // 设置圆球的高度
                                        borderRadius: '50%', // 设置为圆形
                                        backgroundColor: '#808080', // 设置灰色背景
                                        color: 'black', // 使 ✖ 符号为白色
                                        fontSize: '14px', // 设置 ✖ 符号的大小
                                        textAlign: 'center', // 让 ✖ 居中显示
                                        lineHeight: '20px', // 设置行高，使 ✖ 垂直居中
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // 防止触发菜单项点击事件
                                        router.push('/proxy'); // 跳转到 /proxy 页面
                                    }}
                                >
                                ✖
                                </span>
                            )}
                        </div>
                    ),
                    // 如果当前菜单项有子菜单，则递归处理
                    children: item.children ? renderMenuItems(item.children) : undefined,
                };
            });
        };

        const dynamicItems = renderMenuItems(items);


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
                        defaultOpenKeys={['sub1', 'sub2', 'sub3']}
                        selectedKeys={[selectedKey]}
                        mode="inline"
                        theme="dark"
                        items={dynamicItems}
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