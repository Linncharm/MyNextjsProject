"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { Button, Table, Tooltip, message } from 'antd';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Menu } from 'antd';
import { columns, items } from "@/app/proxy/[country]/data";
import { Simulate } from "react-dom/test-utils";
import { CopyOutlined } from '@ant-design/icons';
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
            let type: string = 'country';
            if (e.key === 'china' || e.key === 'japan' || e.key === 'us' || e.key === 'usa') {
                type = 'country';
            }
            if (e.key === 'http' || e.key === 'socks4' || e.key === 'socks5' || e.key === 'https') {
                type = 'protocol';
            }
            if (e.key === 'http-anonymous' || e.key === 'http-high' || e.key === 'http-transparent' || e.key === 'socks4-very-high' || e.key === 'socks5-very-high') {
                type = 'anonymity';
            }

            try {
                const { data, error } = await supabase
                    .from("router")
                    .select("path")
                    .eq(type, e.key)
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

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Free Proxy Server List</h1>
                <div className={styles.subtilte}>
                    <h3>Welcome to your go-to source for the best free proxy server list. We offer a wide range of reliable and secure free proxies, including free web proxies and proxy servers, all available to meet your online needs. Our free proxy list is regularly updated to ensure you have access to the latest free proxy sites and hosts. Whether you need an online proxy free of charge or a secure proxy server, we’ve got you covered with the best options available.</h3>
                </div>
                <div className={styles.card}>
                    <h3>Use Free Proxies with DICloak Browser. Stay Secure and Anonymous!</h3>
                    <Button
                        className={styles.cardButton}
                        href={"https://dicloak.com/download"}
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
                        items={dynamicItems}
                        onClick={handleMenuClick}
                        onOpenChange={onOpenChange}
                    />

                    <Table
                        className={styles.table}
                        dataSource={countries}
                        columns={generateColumns(columns)}
                        rowKey="id"
                        pagination={false}
                        scroll={{ y: 500 }}
                    />
                </div>
            </main>
            {contextHolder} {/* Render the message context holder here */}
        </div>
    );
}
