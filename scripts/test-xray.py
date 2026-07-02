#!/usr/bin/env python3
"""
test-xray.py — Test proxy URIs against api.telegram.org via the xray container.

Usage:
  python3 /root/scripts/test-xray.py /path/to/proxy-list.txt

  The proxy list is a plain-text file, one URI per line (vless/ss/trojan).
  The script backs up /opt/xray/config.json, tests each URI, deploys the
  fastest working config, and prints a full summary.

Requirements:
  - Docker running with container monno-xray on network monno
  - alpine/curl:latest image available locally
"""
import json, subprocess, time, sys, base64
from urllib.parse import urlparse, parse_qs, unquote

CONTAINER    = "monno-xray"
NETWORK      = "monno"
CONFIG_PATH  = "/opt/xray/config.json"
BACKUP_PATH  = "/opt/xray/config.json.bak"
TEST_URL     = "https://api.telegram.org"
TEST_TIMEOUT = 20
GOOD_CODES   = ('200', '301', '302', '307', '308')

INBOUNDS = [
    {
        "tag": "socks-in", "listen": "0.0.0.0", "port": 1080,
        "protocol": "socks",
        "settings": {"auth": "noauth", "udp": True},
        "sniffing": {"enabled": True, "destOverride": ["http", "tls"]}
    },
    {
        "tag": "http-in", "listen": "0.0.0.0", "port": 1081,
        "protocol": "http",
        "sniffing": {"enabled": True, "destOverride": ["http", "tls"]}
    }
]

ROUTING = {
    "domainStrategy": "AsIs",
    "rules": [
        {"type": "field",
         "domain": ["domain:telegram.org", "domain:t.me", "geosite:telegram"],
         "outboundTag": "proxy"},
        {"type": "field", "ip": ["geoip:private"], "outboundTag": "direct"},
        {"type": "field", "network": "tcp,udp", "outboundTag": "proxy"}
    ]
}


def qp(params, key, default=None):
    v = params.get(key, [default])
    return unquote(v[0]) if v[0] is not None else default


def parse_vless(uri):
    parsed   = urlparse(uri)
    uid      = parsed.username
    host     = parsed.hostname
    port     = parsed.port or 443
    params   = parse_qs(parsed.query)
    network  = qp(params, 'type', 'tcp')
    security = qp(params, 'security', 'none')
    sni      = qp(params, 'sni') or host
    fp       = qp(params, 'fp', 'chrome')
    alpn_raw = qp(params, 'alpn', '')
    alpn     = unquote(alpn_raw).split(',') if alpn_raw else ['h2']
    path     = qp(params, 'path', '/')
    mode     = qp(params, 'mode', 'auto')
    extra_raw = qp(params, 'extra', '')
    flow     = qp(params, 'flow', '')
    ws_host  = qp(params, 'host') or host

    outbound = {
        "protocol": "vless", "tag": "proxy",
        "settings": {
            "vnext": [{"address": host, "port": port,
                        "users": [{"id": uid, "encryption": "none", "flow": flow}]}]
        },
        "streamSettings": {
            "network": network, "security": security,
            "sockopt": {"domainStrategy": "UseIPv4v6"}
        }
    }
    if security == 'tls':
        outbound["streamSettings"]["tlsSettings"] = {
            "serverName": sni, "fingerprint": fp, "alpn": alpn
        }
    if network == 'xhttp':
        xhttp = {"path": path, "mode": mode, "host": ws_host}
        if extra_raw:
            try:
                xhttp["extra"] = json.loads(extra_raw)
            except Exception:
                pass
        outbound["streamSettings"]["xhttpSettings"] = xhttp
    elif network == 'ws':
        outbound["streamSettings"]["wsSettings"] = {
            "path": path, "headers": {"Host": ws_host}
        }
    return outbound


def parse_ss(uri):
    raw = uri.replace('ss://', '', 1).split('#')[0]
    if '@' in raw:
        b64, hostpart = raw.rsplit('@', 1)
        padding = (4 - len(b64) % 4) % 4
        try:
            decoded  = base64.b64decode(b64 + '=' * padding).decode()
            method, password = decoded.split(':', 1)
        except Exception:
            method, password = 'chacha20-ietf-poly1305', b64
        hostpart = hostpart.split('?')[0]
        host, port_s = (hostpart.rsplit(':', 1) if ':' in hostpart else (hostpart, '443'))
        port = int(port_s)
    else:
        padding = (4 - len(raw) % 4) % 4
        decoded  = base64.b64decode(raw + '=' * padding).decode()
        method_pass, hostpart = decoded.rsplit('@', 1)
        method, password = method_pass.split(':', 1)
        host, port_s = hostpart.rsplit(':', 1)
        port = int(port_s)
    return {
        "protocol": "shadowsocks", "tag": "proxy",
        "settings": {
            "servers": [{"address": host, "port": port,
                          "method": method, "password": password}]
        },
        "streamSettings": {"network": "tcp"}
    }


def parse_trojan(uri):
    parsed   = urlparse(uri)
    password = parsed.username
    host     = parsed.hostname
    port     = parsed.port or 443
    params   = parse_qs(parsed.query)
    network  = qp(params, 'type', 'tcp')
    security = qp(params, 'security', 'tls')
    sni      = qp(params, 'sni') or host
    fp       = qp(params, 'fp', 'random')
    path     = qp(params, 'path', '/')
    ws_host  = qp(params, 'host') or host

    outbound = {
        "protocol": "trojan", "tag": "proxy",
        "settings": {
            "servers": [{"address": host, "port": port, "password": password}]
        },
        "streamSettings": {
            "network": network, "security": security,
            "sockopt": {"domainStrategy": "UseIPv4v6"}
        }
    }
    if security == 'tls':
        outbound["streamSettings"]["tlsSettings"] = {
            "serverName": sni, "fingerprint": fp
        }
    if network == 'ws':
        outbound["streamSettings"]["wsSettings"] = {
            "path": path, "headers": {"Host": ws_host}
        }
    return outbound


def uri_to_config(uri):
    try:
        if   uri.startswith('vless://'):   ob = parse_vless(uri)
        elif uri.startswith('ss://'):      ob = parse_ss(uri)
        elif uri.startswith('trojan://'):  ob = parse_trojan(uri)
        else:                              return None
    except Exception as e:
        print(f"  PARSE ERROR: {e}")
        return None
    return {
        "log": {"loglevel": "warning"},
        "inbounds": INBOUNDS,
        "outbounds": [ob, {"protocol": "freedom", "tag": "direct"}],
        "routing": ROUTING
    }


def deploy_and_test(config):
    with open(CONFIG_PATH, 'w') as f:
        json.dump(config, f, indent=2)
    subprocess.run(['docker', 'restart', CONTAINER], capture_output=True, check=True)
    time.sleep(4)
    r = subprocess.run(
        ['docker', 'run', '--rm', '--network', NETWORK,
         'alpine/curl:latest', '-s', '-o', '/dev/null',
         '-w', '%{http_code} %{time_total}s',
         '--socks5-hostname', f'{CONTAINER}:1080',
         '--max-time', str(TEST_TIMEOUT),
         TEST_URL],
        capture_output=True, text=True, timeout=TEST_TIMEOUT + 15
    )
    return r.stdout.strip()


if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(1)

with open(sys.argv[1]) as f:
    uris = [l.strip() for l in f if l.strip()]

subprocess.run(['cp', CONFIG_PATH, BACKUP_PATH], check=True)
print(f"Backed up current config → {BACKUP_PATH}\n")

results = []
for i, uri in enumerate(uris):
    label = uri.split('#')[-1] if '#' in uri else f"config-{i+1}"
    proto = uri.split('://')[0]
    print(f"[{i+1}/{len(uris)}] {proto} | {label}", flush=True)
    cfg = uri_to_config(uri)
    if cfg is None:
        print("  SKIP")
        results.append((label, proto, "SKIP", float('inf'), uri))
        continue
    try:
        out     = deploy_and_test(cfg)
        parts   = out.split()
        code    = parts[0] if parts else "000"
        latency = float(parts[1].rstrip('s')) if len(parts) > 1 else float('inf')
        print(f"  → {out}")
        results.append((label, proto, code, latency, uri))
    except Exception as e:
        print(f"  ERROR: {e}")
        results.append((label, proto, "ERR", float('inf'), uri))

working = sorted(
    [(l, pr, c, t, u) for l, pr, c, t, u in results if c in GOOD_CODES],
    key=lambda x: x[3]
)

print("\n══════════════════════════════════════════")
print("  RESULTS")
print("══════════════════════════════════════════")
for label, proto, code, t, _ in results:
    ok = "✓" if code in GOOD_CODES else "✗"
    ts = f"{t:.2f}s" if t != float('inf') else "  --"
    print(f"  {ok} {code} {ts:7s}  {proto:10s}  {label}")

if working:
    best = working[0]
    print(f"\n  BEST: {best[0]} ({best[1]}) — {best[3]:.2f}s")
    with open(CONFIG_PATH, 'w') as f:
        json.dump(uri_to_config(best[4]), f, indent=2)
    subprocess.run(['docker', 'restart', CONTAINER], capture_output=True)
    print(f"  Deployed & restarted {CONTAINER}")
else:
    print("\n  No working configs — restoring backup")
    subprocess.run(['cp', BACKUP_PATH, CONFIG_PATH])
    subprocess.run(['docker', 'restart', CONTAINER], capture_output=True)

print("══════════════════════════════════════════")
