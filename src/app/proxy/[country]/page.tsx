'use client'

import Image from "next/image";
import styles from "./page.module.css";
import { Button, Table } from 'antd';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Menu } from 'antd';
import { columns, items } from "@/app/proxy/[country]/data";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

export default function Home({ params }: { params: {params:Promise<{country:string}>} }) {
    const { country } = React.use(params);
    const [countries, setCountries] = useState([]);
    const [selectedKey, setSelectedKey] = useState("1"); // 维护选中的 key
    const [isLoading, setIsLoading] = useState(true); // 新增加载状态
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchProxies = async (type:string) => {
            try {
                const { data, error } = await supabase
                    .from("proxy")
                    .select("*")
                    .or(`country.eq.${type},protocol.eq.${type},anonymity_level.eq.${type}`);
                console.log("....",data,type)  //为默认值1？
                if (!error) {
                    const processedData = data.map((item, index) => ({
                        ...item,
                        id: index + 1, // 自增 ID
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
                    console.log("set type",data[0].type)
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

        // 获取初始数据
        const fetchData = async (path:string) => {
            console.log("params",params)
            console.log("!!!",path)
            try {
                const isSelectKey = await fetchSelectedKey(path);
                console.log("???",isSelectKey)
                console.log(selectedKey)
                if(isSelectKey){
                    await fetchProxies(isSelectKey);
                }else {
                    console.error("未返回有效的值")
                }
            }catch (e){
                console.error(e)
            }
            setIsLoading(false); // 数据加载完毕，更新加载状态
        };

        fetchData(country);
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
        if(isLoading){
            return (
                <div className={styles.isLoading}>
                    <span>Loading...</span>
                </div>
            )
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
                    <Button className={styles.cardButton}>Download DICloak Browser</Button>
                </div>
                <div className={styles.content}>
                    <Menu
                        className={styles.menu}
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1','sub2','sub3']}
                        selectedKeys={[ selectedKey]} // 将 selectedKey 传入 selectedKeys
                        mode="inline"
                        theme="dark"
                        items={items}
                        onClick={handleMenuClick}
                    />
                    <Table className={styles.table} dataSource={countries} columns={columns} rowKey="id" />
                </div>
            </main>
        </div>
    );
}
