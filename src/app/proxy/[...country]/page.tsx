// app/proxy-[country]/page.tsx
import { createClient } from "@/utils/supabase/server";

export default async function ProxyCountryPage({ params }: { params: { country: string } }) {
    const supabase = await createClient();

    // 从 Supabase 数据库中获取国家信息
    const { data, error } = await supabase
        .from("countries")
        .select("*")
        .eq("slug", params.country)
        .single();

    if (error) {
        console.error("Error fetching country data:", error);
        return <div>无法加载该国家的数据。</div>;
    }

    return (
        <div>
            <h1>访问的国家: {data.name}</h1>
            <p>更多关于 {data.name} 的信息...</p>
        </div>
    );
}
