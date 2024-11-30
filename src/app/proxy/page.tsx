'use client'

import Image from "next/image";
import styles from "./page.module.css";
import {Button, Table, Tooltip} from 'antd';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Menu , message} from 'antd';
import { columns, items } from "@/app/proxy/[country]/data";
import {CopyOutlined} from "@ant-design/icons";

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
                setIsLoading(false);
            }
        };

        fetchCountries();
    }, [supabase]);

    // 从数据库获取路由信息。路径
    const handleMenuClick = (e: { key: string }) => {
        setSelectedKey(e.key); // 更新选中的 key
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
                // 一定要将 supabase 的表设置为 public
                // 从 Supabase 查询数据
                const { data, error } = await supabase
                    .from("router")
                    .select("path") // 只查询所需字段，优化性能
                    .eq(type, e.key)
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
                        items={items}
                        onClick={handleMenuClick}
                    />
                    <Table
                        className={styles.table}
                        dataSource={countries}
                        columns={generateColumns(columns)}
                        pagination={false}
                        rowKey="id"
                        scroll={{ y: 628 }}
                    />
                </div>
            </main>
            {contextHolder} {/* Render the message context holder here */}
        </div>
    );
}
