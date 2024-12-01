import os
import requests
import random  # 导入 random 模块
from bs4 import BeautifulSoup
from supabase import create_client, Client

def create_supabase_client():
    print("正在连接到 Supabase...")
    url: str = os.getenv("SUPABASE_URL")  # 请替换为您的 Supabase URL
    key: str = os.getenv("SUPABASE_KEY")  # 请替换为您的 Supabase Key
    client = create_client(url, key)
    print("成功连接到 Supabase。")
    return client

def clean_protocol(protocol):
    return protocol.split('(')[0].strip()

def get_country_full_name(country_code):
    country_names = {
        "US": "United States",
        "GB": "United Kingdom",
        "CN": "China",
        "RU": "Russia",
        "BR": "Brazil",
        "JP": "Japan",
        "HK": "Hong Kong",
        "CO": "Colombia",
        "SG": "Singapore",
        "MX": "Mexico",
    }
    return country_names.get(country_code, country_code)

def get_anonymity_description(anonymity_code):
    anonymity_descriptions = {
        "NOA": "Non-anonymous proxy",
        "ANM": "Anonymous proxy server",
        "HIA": "High anonymous proxy"
    }
    return anonymity_descriptions.get(anonymity_code, anonymity_code)

def scrape_proxies(country_code):
    print(f"正在抓取 {country_code} 的代理...")
    url = f"https://spys.one/free-proxy-list/{country_code}/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
        'Accept-Language': 'en,zh-CN;q=0.9,zh;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Cookie': '_ga=GA1.1.76419804.1733020290; cf_clearance=0TKnqjxg7srWI9IwJCoooGQJ098.ua1g.pFu30ZSnC0-1733020290-1.2.1.1-G_mjrQEpXyFXEuMWxISJRBV5Le79PifOzPbfD5cSq492Qmg9e1SoFW3uAji2gWXKeyuxRFnBQOU4UpS0I6JE8G62okqywJ0UjrCzRrmiGbyA2IdETzun9I_Sutbu5xFccsHP7huxX0DkXuC9.loa05Y6RyrJkZ5t2bK1Kg0cnG_yzd6WMGZ5JuVYDMBiFtujEY.ITefmgXN6st3wJhs1zYrZsMvtS.RWDoV6bblIxUu_jb3LLB0rEsPq.o2WvFzXsm5UsH8d.v2tsQMSEJuJ5Nhh6NQAzyeeAQ5bAeVu41ZTNuUVwpcN7e.l.HCn6vaoXsiS6yXVP9_VpWUUGNwdMetvU5r1guA6tMgqJCqSe3qf8lAAuZjLdiK2YI9CrjSpgnJCBF1L75GS8ZpjwctB5A; _ga_XWX5S73YKH=GS1.1.1733020290.1.1.1733020297.0.0.0; FCNEC=%5B%5B%22AKsRol_8yrzrCdZ8bcadpieJL-UMM3vYDWYAJcFxreVFae7EDU6YBjLjc-8s1iq7iM0oVpkvSYAzZgWMkE42g79npNHJp0BM4mf7T8xMsSbxdL6EAPcgN12UIV4glzs79wfRx3IObBTu-8vL8hb9imbxUJH-Ulijkg%3D%3D%22%5D%5D'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"请求失败，国家: {country_code}, 错误: {e}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    select = soup.find('select', {'id': 'xpp'})

    if select is None:
        print("未找到选择器，请检查页面结构。")
        return []

    option_value = select.find_all('option')[3]['value']

    try:
        response = requests.get(url, params={'xpp': option_value}, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"请求失败，国家: {country_code}, 错误: {e}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    proxy_rows = soup.select('tr.spy1xx, tr.spy1x')

    proxies = []
    for row in proxy_rows[2:]:
        columns = row.find_all('td')
        if len(columns) < 9:
            continue

        ip_port = columns[0].find('font', class_='spy14').text.strip()
        proxy_type = clean_protocol(columns[1].text.strip())
        anonymity_code = columns[2].text.strip()
        latency = columns[5].text.strip()

        proxies.append({
            'ip_port': ip_port,
            'Type': proxy_type,
            'Anonymity': get_anonymity_description(anonymity_code),
            'Country': get_country_full_name(country_code),
            'Ping': latency,
        })

    print(f"成功抓取 {len(proxies)} 个代理。")
    return proxies

def replace_or_update_in_supabase(data):
    supabase = create_supabase_client()

    print("正在清空代理表中的数据...")
    supabase.rpc('clear_proxy_table').execute()
    print("代理表已清空。id已重置")

    print("正在更新代理表中的数据...")
    for index, proxy in enumerate(data):
        supabase.table('proxy').upsert({
            'address': proxy['ip_port'],
            'country': proxy['Country'],
            'protocol': proxy['Type'],
            'anonymity_level': proxy['Anonymity'],
            'ping': proxy['Ping']
        }).execute()
        print(f"更新或插入第 {index + 1} 条数据：{proxy['ip_port']}")

    print("所有数据更新完成。")

if __name__ == "__main__":
    country_list = ["US", "GB", "CN", "RU", "BR", "JP", "HK", "CO", "SG", "MX"]
    all_proxies = []

    for country in country_list:
        proxies = scrape_proxies(country)
        all_proxies.extend(proxies)

    # 随机打乱代理数据
    random.shuffle(all_proxies)

    if len(all_proxies) == 0:
        print("未找到任何代理。")
        exit()
    # 将数据更新到 Supabase
    replace_or_update_in_supabase(all_proxies)