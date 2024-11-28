import { createClient } from '@/utils/supabase/client';

// export default async function Proxy() {
//     const supabase = await createClient();
//     const { data: notes } = await supabase.from("proxy").select();
//
//     return <pre>{JSON.stringify(notes, null, 2)}</pre>
// }

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ country: string }>
}) {
    const country = (await params).country
    console.log(params)
    return <div>My Post: {country}</div>
}