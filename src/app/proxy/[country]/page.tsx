// app/proxy-[country]/page.tsx
import { createClient } from "@/utils/supabase/server";

export default async function ProxyCountryPage({ params }: { params: { filter: string } }) {
    const supabase = await createClient();

    // 从 Supabase 数据库中获取国家信息
    const { data, error } = await supabase
        .from("proxy")
        .select("*")
        .eq(`${params.filter}`, params.filter)
        .single();

    if (error) {
        console.error("Error fetching country data:", error);
        return <div>无法加载该国家的数据。</div>;
    }

    return (
        <div>
            <h1>访问的地址: {data.address}</h1>
            <p>协议为：{data.protocol}</p>
        </div>
    );
}
