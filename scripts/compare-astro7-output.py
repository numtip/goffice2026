#!/usr/bin/env python3
"""เทียบผลลัพธ์ที่บิลด์ได้ ระหว่างสแตกเดิม (Astro 4) กับสแตกใหม่ (Astro 7)
ใช้เป็นหลักฐานตามที่ Jev แนะนำ (rollout=preview_first): ก่อน deploy ต้องเทียบกับของเดิมก่อน
"""

from __future__ import annotations

import html as htmllib
import pathlib
import re
import sys
from collections import Counter

OLD = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/goffice-baseline/dist")
NEW = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "dist")

TAG = re.compile(r"<[^>]+>")
SCRIPT = re.compile(r"<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>", re.S)


def visible_text(source: str) -> str:
    text = SCRIPT.sub(" ", source)
    text = TAG.sub(" ", text)
    text = htmllib.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def pages(root: pathlib.Path) -> dict[str, str]:
    return {str(p.relative_to(root)): p.read_text(encoding="utf-8", errors="replace")
            for p in root.rglob("*.html")}


old, new = pages(OLD), pages(NEW)
print(f"หน้า HTML: เดิม {len(old)} · ใหม่ {len(new)}")

only_old = sorted(set(old) - set(new))
only_new = sorted(set(new) - set(old))
print(f"หายไปจากของใหม่: {len(only_old)} หน้า {only_old[:5]}")
print(f"เพิ่มมาใหม่: {len(only_new)} หน้า {only_new[:5]}")

text_diff, raw_diff, word_join = [], 0, []
for rel in sorted(set(old) & set(new)):
    if old[rel] != new[rel]:
        raw_diff += 1
    a, b = visible_text(old[rel]), visible_text(new[rel])
    if a != b:
        text_diff.append(rel)
        # หาจุดต่างแรกแบบสั้น ๆ เพื่อดูว่าเป็น "คำติดกัน" หรือเนื้อหาต่างจริง
        i = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
        word_join.append((rel, a[max(0, i - 40):i + 40], b[max(0, i - 40):i + 40]))

print(f"\nหน้าที่ HTML ดิบต่างกัน: {raw_diff}")
print(f"หน้าที่ 'เนื้อความที่มองเห็น' ต่างกัน: {len(text_diff)}")
for rel, a, b in word_join[:8]:
    print(f"  {rel}\n     เดิม: …{a}…\n     ใหม่: …{b}…")

print("\n--- ขนาด CSS ---")
for label, root in (("เดิม", OLD), ("ใหม่", NEW)):
    css = sorted(root.rglob("*.css"))
    total = sum(p.stat().st_size for p in css)
    print(f"  {label}: {len(css)} ไฟล์ · {total/1024:.1f} KB")

print("\n--- ตรวจคลาสที่ใช้ใน HTML ว่ามีนิยามใน CSS ไหม (ความเสี่ยง Tailwind 4 เปลี่ยนชื่อคลาส) ---")
for label, root in (("เดิม", OLD), ("ใหม่", NEW)):
    css_text = " ".join(p.read_text(encoding="utf-8", errors="replace") for p in root.rglob("*.css"))
    defined = set(re.findall(r"\.((?:[\w-]|\\.)+)", css_text))
    defined = {d.replace("\\", "") for d in defined}
    used = Counter()
    for p in list(root.rglob("*.html"))[:200]:
        src = p.read_text(encoding="utf-8", errors="replace")
        for m in re.finditer(r'class="([^"]+)"', src):
            for tok in m.group(1).split():
                used[tok] += 1
    missing = {c: n for c, n in used.items() if c not in defined}
    print(f"  {label}: คลาสที่ใช้ {len(used)} แบบ · ไม่พบนิยามใน CSS {len(missing)} แบบ")
    for cls, n in sorted(missing.items(), key=lambda kv: -kv[1])[:12]:
        print(f"      {cls} (ใช้ {n} ครั้ง)")
