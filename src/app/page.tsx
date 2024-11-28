import Image from "next/image";
import styles from "./page.module.css";
import { Button , Table } from 'antd';

import {
    AppstoreOutlined,
    MailOutlined,
} from '@ant-design/icons';

import { Menu } from 'antd';
import type { MenuProps } from 'antd';

import {dataSource,columns} from "@/app/data";

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        key: 'sub1',
        label: 'Navigation One',
        icon: <MailOutlined />,
        children: [
            { key: '5', label: 'Option 5' },
            { key: '6', label: 'Option 6' },
            { key: '7', label: 'Option 7' },
            { key: '8', label: 'Option 8' },
        ],
    },
    {
        key: 'sub2',
        label: 'Navigation Two',
        icon: <AppstoreOutlined />,
        children: [
            { key: '9', label: 'Option 9' },
            { key: '10', label: 'Option 10' },
        ],
    },
];

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Test1</h1>
                <h2>Test2</h2>
                <div className={styles.card}>
                    <h3>Test3</h3>
                    <Button className={styles.cardButton}>test4</Button>
                </div>
                <div className={styles.content}>
                    <Menu
                        className={styles.menu}
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        mode="inline"
                        theme="dark"
                        items={items}
                    />
                    <Table className={styles.table} dataSource={dataSource} columns={columns} />
                </div>
            </main>
        </div>
    );
}