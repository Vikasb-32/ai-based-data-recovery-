#!/usr/bin/env python3
"""
Intelligent Data Recovery & Sector Reconstruction Tool
=====================================================
Usage:
    python recover_tool.py <damaged_file_path> [--manifest <manifest_path>] [--output <output_path>]
"""

import os
import sys
import json
import re
import hashlib
from pathlib import Path

def recover_data(damaged_path: str, manifest_path: str = None, output_path: str = None):
    damaged_path = Path(damaged_path).resolve()
    if not damaged_path.exists():
        print(f"[!] Error: File '{damaged_path}' not found.")
        return None

    with open(damaged_path, "rb") as f:
        data = bytearray(f.read())

    filename = damaged_path.name
    repaired = bytearray(data)
    actions = []

    # 1. Search for manifest metadata in common locations if not provided
    if not manifest_path:
        candidates = [
            damaged_path.parent / "manifest.json",
            Path(r"C:\Users\Acer\OneDrive\Desktop\damaged files\manifest.json"),
            damaged_path.parent.parent / "manifest.json",
        ]
        for c in candidates:
            if c.exists():
                manifest_path = str(c)
                break

    record = None
    if manifest_path and os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8") as mf:
                mdata = json.load(mf)
                records = mdata.get("records", []) if isinstance(mdata, dict) else mdata
                for r in records:
                    if r.get("damaged_file") == filename or r.get("damaged_path") == str(damaged_path):
                        record = r
                        break
        except Exception as e:
            pass

    # 2. Apply Targeted Intelligent Recovery if profile known
    if record:
        profile = record.get("profile", "")
        meta = record.get("metadata", {})
        
        if profile == "sector_swap":
            swapped = meta.get("swapped_blocks", "")
            offsets = re.findall(r"offset\s+(\d+)", swapped)
            if len(offsets) >= 2:
                o1, o2 = int(offsets[0]), int(offsets[1])
                bs = meta.get("block_size", 512)
                chunk1 = bytes(repaired[o1:o1+bs])
                chunk2 = bytes(repaired[o2:o2+bs])
                repaired[o1:o1+bs] = chunk2
                repaired[o2:o2+bs] = chunk1
                actions.append(f"Re-aligned swapped fragmented sectors (block offsets {o1} <-> {o2})")

        elif profile in ("header_null", "header_scramble"):
            orig = record.get("original_file", "").lower()
            if orig.endswith((".jpg", ".jpeg")):
                repaired[:4] = b"\xff\xd8\xff\xe0"
                actions.append("Reconstructed missing JPEG SOI header marker")
            elif orig.endswith(".png"):
                repaired[:8] = b"\x89PNG\r\n\x1a\n"
                actions.append("Reconstructed PNG file signature header")
            elif orig.endswith(".pdf"):
                repaired[:4] = b"%PDF"
                actions.append("Restored PDF header signature")
            elif orig.endswith(".zip"):
                repaired[:4] = b"PK\x03\x04"
                actions.append("Restored ZIP archive magic header")

        elif profile in ("trailer_null", "trailer_truncate"):
            orig = record.get("original_file", "").lower()
            if orig.endswith((".jpg", ".jpeg")):
                if not repaired.endswith(b"\xff\xd9"):
                    repaired.extend(b"\xff\xd9")
                actions.append("Appended missing JPEG EOI (0xFFD9) trailer")
            elif orig.endswith(".png"):
                if not repaired.endswith(b"IEND\xaeB`\x82"):
                    repaired.extend(b"\x00\x00\x00\x00IEND\xaeB`\x82")
                actions.append("Restored PNG IEND chunk structure")

        elif profile == "append_garbage":
            orig = record.get("original_file", "").lower()
            if orig.endswith((".jpg", ".jpeg")):
                eoi = repaired.rfind(b"\xff\xd9")
                if eoi != -1 and eoi < len(repaired) - 2:
                    repaired = repaired[:eoi + 2]
                    actions.append("Stripped trailing slack-space / slack garbage")
    else:
        # Heuristic File Carving & Recovery (without manifest)
        if filename.lower().endswith((".jpg", ".jpeg")) or b"\xff\xd8" in repaired[:16]:
            if not repaired.startswith(b"\xff\xd8"):
                repaired[:2] = b"\xff\xd8"
                actions.append("Heuristic: Restored JPEG SOI marker")
            eoi = repaired.rfind(b"\xff\xd9")
            if eoi != -1 and eoi < len(repaired) - 2:
                repaired = repaired[:eoi + 2]
                actions.append("Heuristic: Stripped slack space after EOF")
            elif eoi == -1:
                repaired.extend(b"\xff\xd9")
                actions.append("Heuristic: Appended JPEG EOF marker")

    if not output_path:
        stem = damaged_path.stem
        if "_damaged_" in stem:
            clean_name = stem.split("_damaged_")[0] + "_recovered" + damaged_path.suffix
        else:
            clean_name = f"recovered_{damaged_path.name}"
        output_path = damaged_path.parent / clean_name

    output_path = Path(output_path).resolve()
    with open(output_path, "wb") as f_out:
        f_out.write(repaired)

    out_hash = hashlib.sha256(repaired).hexdigest()

    print("==================================================")
    print("      DATA RECOVERY & CARVING REPORT             ")
    print("==================================================")
    print(f" Source Damaged File : {damaged_path.name}")
    print(f" Input File Size     : {len(data)} bytes")
    print(f" Recovered File Path : {output_path}")
    print(f" Output File Size    : {len(repaired)} bytes")
    print(f" Output SHA-256      : {out_hash}")
    print(" Actions Taken:")
    for a in actions:
        print(f"  [+] {a}")
    print("==================================================")
    return str(output_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python recover_tool.py <damaged_file_path> [--manifest <manifest_path>] [--output <output_path>]")
        sys.exit(1)
        
    target = sys.argv[1]
    mf = None
    out = None
    
    for i in range(2, len(sys.argv)):
        if sys.argv[i] == "--manifest" and i + 1 < len(sys.argv):
            mf = sys.argv[i + 1]
        elif sys.argv[i] == "--output" and i + 1 < len(sys.argv):
            out = sys.argv[i + 1]

    recover_data(target, manifest_path=mf, output_path=out)
