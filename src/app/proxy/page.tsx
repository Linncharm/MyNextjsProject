"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { Button , Table } from 'antd';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils//supabase/client";


import { Menu } from 'antd';
import type { MenuProps } from 'antd';

import {columns} from "@/app/proxy/data";

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        key: 'sub1',
        label: 'Country',
        children: [
            { key: '5', label: 'US' },
            { key: '6', label: 'China' },
            { key: '7', label: 'Japan' },
            { key: '8', label: 'USA' },
        ],
    },
    {
        key: 'sub2',
        label: 'Protocol',
        children: [
            { key: '9', label: 'HTTP' },
            { key: '10', label: 'Socks 4' },
            { key: '11', label: 'Socks 5' },
            { key: '12', label: 'HTTPS' },
        ],
    },
    {
        key: 'sub3',
        label: 'Anonymity Level',
        children: [
            { key: '13', label: 'Http (anonymous)' },
            { key: '14', label: 'Http (high)' },
            { key: '15', label: 'Http (transparent)' },
            { key: '16', label: 'Socks4 (very high)' },
            { key: '17', label: 'Socks5 (very high)' },


],
    },
];

export default function Home() {

    const router = useRouter();
    const [countries, setCountries] = useState([]);
    const supabase = createClient();

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
            }
        };


        fetchCountries();
    }, [supabase]);

    const handleMenuClick = (e: { key: string }) => {
        router.push(`/proxy/${e.key}`); // 跳转到动态路由
    };

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
                    <Button className={styles.cardButton}>Download DICloak Browser</Button>
                </div>
                <div className={styles.content}>
                    <Menu
                        className={styles.menu}
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        mode="inline"
                        theme="dark"
                        items={items}
                        onClick={handleMenuClick}
                    />
                    <Table className={styles.table} dataSource={countries} columns={columns} rowKey="id"/>
                </div>
            </main>
        </div>
    );
}