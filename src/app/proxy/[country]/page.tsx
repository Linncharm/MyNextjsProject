import { createClient } from '@/utils/supabase/client';

export default async function Proxy({params}:{
    params:Promise<{country:string}>
}) {
    const country = (await params).country
    const supabase = await createClient();
    const { data: notes } = await supabase.from("proxy").select();

    return (
        <div>
            <pre>{JSON.stringify(notes, null, 2)}</pre>
            <div> The route path is : {country} </div>
        </div>
    )
}

