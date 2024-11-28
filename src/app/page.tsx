import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Test1</h1>
                <h2>Test2</h2>
                <div className={styles.card}>
                    <h3>Test3</h3>
                    <button className={styles.cardButton}>test4</button>
                </div>
                <div className={styles.content}>
                    <p>1111</p>
                    <p>1111</p>
                </div>
            </main>
        </div>
    );
}