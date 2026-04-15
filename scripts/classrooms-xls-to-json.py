#!/usr/bin/env python3
"""Convert ClassroomAttributes.xls (XML Spreadsheet format) to classrooms.json."""

import json
import re
import sys
from datetime import date

XLS_PATH = sys.argv[1] if len(sys.argv) > 1 else "../ClassroomAttributes.xls"
OUT_PATH = sys.argv[2] if len(sys.argv) > 2 else "src/lib/classrooms.json"

# Column indices (0-based)
COL_BUILDING_NAME = 0
COL_ROOM = 1
COL_REGISTRAR_CODE = 2
COL_FLOOR = 3
COL_AREA = 4
COL_CAPACITY = 5
COL_ROOM_TYPE = 6
COL_CONTROLLED = 7
COL_USED = 8
COL_OVERFLOW = 9
COL_FLOOR_TYPE = 10
COL_SEATING_TYPE = 11
COL_ADA = 12
COL_PROJECTION_BOOTH = 13
COL_BOARDS = 14
COL_SIMULTANEOUS = 15
COL_ACOUSTICS = 16
COL_VENTILATION = 17
COL_WINDOWS = 18
COL_DARKENABILITY = 19
COL_COVERINGS = 20
COL_LIGHTING = 21
COL_LECTERN = 22
COL_INSTRUCTOR_TABLES = 23
COL_CLOCK = 24
COL_WHEELCHAIR = 25


def parse_worksheet(ws_content):
    """Parse rows from a single worksheet XML content."""
    row_pattern = r"<Row[^>]*>(.*?)</Row>"
    rows_xml = re.findall(row_pattern, ws_content, re.DOTALL)

    rows = []
    for row_xml in rows_xml:
        cell_pattern = r"<Cell(?:\s[^>]*)?>.*?</Cell>"
        cells_xml = re.findall(cell_pattern, row_xml, re.DOTALL)

        cells = []
        for cell_xml in cells_xml:
            idx_match = re.search(r'ss:Index="(\d+)"', cell_xml)
            if idx_match:
                target_idx = int(idx_match.group(1)) - 1
                while len(cells) < target_idx:
                    cells.append("")

            data_match = re.search(r"<Data[^>]*>(.*?)</Data>", cell_xml, re.DOTALL)
            value = data_match.group(1) if data_match else ""
            value = value.replace("&#10;", "\n").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
            cells.append(value)

        rows.append(cells)
    return rows


def parse_xls(path):
    """Parse XML Spreadsheet format, return (sheet1_rows, sheet2_rows)."""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    ws_pattern = r"<Worksheet[^>]*>(.*?)</Worksheet>"
    ws_matches = re.findall(ws_pattern, content, re.DOTALL)

    sheet1 = parse_worksheet(ws_matches[0]) if len(ws_matches) > 0 else []
    sheet2 = parse_worksheet(ws_matches[1]) if len(ws_matches) > 1 else []
    return sheet1, sheet2


def strip_html(text):
    """Remove HTML tags from text, keeping the text content."""
    if not text:
        return text
    cleaned = re.sub(r"<[^>]+>", "", text)
    # Collapse whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def parse_media_equipment(rows):
    """Parse the Media Equipment sheet into a dict keyed by registrar code."""
    if not rows:
        return {}
    # Columns: 0=Building, 1=Room, 2=Registrar Code, 3=Floor, 4=Area, 5=Capacity,
    # 6=Room Type, 7=Controlled, 8=Used, 9=Media Control, 10=Players,
    # 11=Inputs, 12=VDC, 13=Voice Amplification, 14=Projector, 15=Screen Type,
    # 16=Screen Width, 17=Video Display, 18=Zoom Capable, 19=Podcasting,
    # 20=i>clicker, 21=Close Caption/Assisted Listening, 22=Network
    media = {}
    for row in rows[1:]:  # skip header
        reg_code = safe_get(row, 2)
        if not reg_code or reg_code == "Registrar Code":
            continue
        equipment = []
        # Collect equipment from various columns
        inputs = safe_get(row, 11)
        if inputs:
            for inp in inputs.split("\n"):
                inp = inp.strip()
                if inp:
                    equipment.append(inp)
        projector = safe_get(row, 14)
        if projector and projector.lower() not in ("none", "n/a", ""):
            equipment.append(f"Projector: {projector}")
        screen_type = safe_get(row, 15)
        if screen_type and screen_type.lower() not in ("none", "n/a", ""):
            equipment.append(f"Screen: {screen_type}")
        screen_width = safe_get(row, 16)
        if screen_width and screen_width.lower() not in ("none", "n/a", ""):
            equipment.append(f"Screen Width: {screen_width}")
        video_display = safe_get(row, 17)
        if video_display and video_display.lower() not in ("none", "n/a", ""):
            equipment.append(f"Display: {video_display}")
        voice_amp = safe_get(row, 13)
        if voice_amp and voice_amp.lower() not in ("none", "n/a", ""):
            # Strip HTML tags (the XLS has <a> mailto links in this field)
            voice_clean = strip_html(voice_amp)
            equipment.append(f"Voice Amp: {voice_clean}")
        zoom = safe_get(row, 18)
        podcasting = safe_get(row, 19)
        iclicker = safe_get(row, 20)
        captions = safe_get(row, 21)

        media[reg_code] = {
            "media_control": safe_get(row, 9) or None,
            "equipment": equipment,
            "zoom_capable": parse_bool(zoom) if zoom else None,
            "podcasting": parse_bool(podcasting) if podcasting else None,
            "iclicker": parse_bool(iclicker) if iclicker else None,
            "assisted_listening": strip_html(captions.strip()) if captions.strip() else None,
        }
    return media


def safe_get(row, idx, default=""):
    return row[idx].strip() if idx < len(row) and row[idx] else default


def parse_bool(val):
    v = val.strip().lower()
    if v in ("yes", "true", "1"):
        return True
    if v in ("no", "false", "0"):
        return False
    return None


def parse_int(val):
    v = val.strip()
    if not v:
        return None
    # Extract first number
    m = re.search(r"\d+", v)
    return int(m.group()) if m else None


def parse_float(val):
    v = val.strip()
    if not v:
        return None
    m = re.search(r"[\d.]+", v)
    return float(m.group()) if m else None


def clean_multiline(val):
    """Clean up multiline text, normalize whitespace."""
    if not val:
        return None
    lines = [l.strip() for l in val.split("\n") if l.strip()]
    return "\n".join(lines) if lines else None


def make_id(registrar_code):
    """Make a URL-safe ID from registrar code."""
    return registrar_code.lower().replace(" ", "-")


def extract_seating_short(seating_type):
    """Extract short label from seating type string like 'M - Movable'."""
    if not seating_type:
        return None
    # Try to get the full name after the code
    m = re.match(r"[A-Z]+ - (.+)", seating_type)
    if m:
        return m.group(1).strip()
    return seating_type.strip()


def compute_features(row_data):
    """Compute a list of feature tags from room attributes (Chinese)."""
    features = []
    if row_data.get("ada_accessible"):
        features.append("无障碍")
    if row_data.get("projection_booth"):
        features.append("投影室")
    if row_data.get("boards"):
        features.append("黑板/白板")
    if row_data.get("has_windows") and row_data.get("window_count", 0) and row_data["window_count"] > 0:
        features.append("有窗户")
    if row_data.get("lectern"):
        features.append("讲台")
    if row_data.get("overflow_capable"):
        features.append("可溢出")
    if row_data.get("wheelchair_spaces") and row_data["wheelchair_spaces"] > 0:
        features.append("轮椅位")
    if row_data.get("simultaneous_board_projection"):
        features.append("板书+投影同时")
    return features


############################
# Chinese translation maps #
############################

ROOM_TYPE_ZH = {
    "Classroom": "普通教室",
    "Lecture Hall": "阶梯教室",
    "Conference Room": "会议室",
    "Conference Room Service": "会议室服务",
    "Assembly": "集会厅",
    "Class Laboratory": "教学实验室",
    "Open Lab - Restricted": "开放实验室（受限）",
    "Scholarly Activity": "学术活动室",
}

SEATING_TYPE_ZH = {
    "Movable": "可移动座椅",
    "Fixed and Numbered": "固定编号座位",
    "Fixed": "固定座位",
    "Flexible": "灵活座椅",
    "N/A": "无",
}

FLOOR_TYPE_ZH = {
    "Tile": "瓷砖",
    "Carpet": "地毯",
    "Cement": "水泥",
    "C/C - Cement/Carpet": "水泥/地毯",
    "C/T - Cement/Tile": "水泥/瓷砖",
    "C/C/T - Cement/Carpet/Tile": "水泥/地毯/瓷砖",
    "N/A": "无",
}

VENTILATION_ZH = {
    "Good": "良好",
    "Poor": "较差",
    "N/A": "无",
    "Unknown": "未知",
}

DARKENABILITY_ZH = {
    "Excellent": "极佳",
    "Good": "良好",
    "Fair": "一般",
    "Poor": "较差",
    "N/A": "无",
}

MEDIA_CONTROL_ZH = {
    "Touchscreen": "触摸屏",
    "Touchscreen with Annotation": "触摸屏（带标注）",
    "Pushbutton": "按钮式",
    "None": "无",
    "N/A": "无",
}

INSTRUCTOR_TABLES_ZH = {
    "1 (Standard)": "1张（标准）",
    "1 (Station)": "1张（工作站）",
    "2 (Standard)": "2张（标准）",
    "1 (Height-Adjustable)": "1张（可调高度）",
    "N/A": "无",
}


def translate_acoustics(val):
    if not val:
        return None
    parts = []
    for line in val.split("\n"):
        line = line.strip()
        if line.startswith("G -"):
            parts.append("良好")
        elif line.startswith("F -"):
            parts.append("一般")
        elif line.startswith("P -"):
            parts.append("较差")
        elif line.startswith("REV"):
            parts.append("有回声")
        elif line.startswith("Mech"):
            parts.append("有机械噪音")
        elif line.startswith("Buzz"):
            parts.append("有嗡鸣声")
        elif line == "N/A":
            parts.append("无")
        else:
            parts.append(line)
    return "，".join(parts) if parts else None


def translate_coverings(val):
    if not val:
        return None
    parts = []
    for line in val.split("\n"):
        line = line.strip()
        if line.startswith("B -"):
            parts.append("百叶窗")
        elif line.startswith("S -"):
            parts.append("遮光帘")
        elif line.startswith("C -"):
            parts.append("窗帘")
        elif line == "N/A":
            parts.append("无")
        else:
            parts.append(line)
    return "、".join(parts) if parts else None


def translate_lighting(val):
    if not val:
        return None
    parts = []
    for line in val.split("\n"):
        line = line.strip()
        tokens = []
        if "FL" in line:
            tokens.append("日光灯")
        if "LED" in line:
            tokens.append("LED")
        if "IN" in line:
            tokens.append("白炽灯")
        if "Dimmable" in line:
            tokens.append("可调光")
        parts.append("".join(tokens) if tokens else line)
    return "，".join(parts) if parts else None


def translate_clock(val):
    if not val:
        return None
    parts = []
    for line in val.split("\n"):
        line = line.strip()
        if line.startswith("A -"):
            parts.append("指针式")
        elif line.startswith("D -"):
            parts.append("数字式")
        elif line.startswith("NA"):
            parts.append("无")
        else:
            parts.append(line)
    # deduplicate
    return "、".join(dict.fromkeys(parts)) if parts else None


def translate_lectern(val):
    if not val:
        return None
    parts = []
    for line in val.split("\n"):
        line = line.strip()
        if line.startswith("TT-M"):
            parts.append("桌面式（固定）")
        elif line.startswith("TT"):
            parts.append("桌面式")
        elif line.startswith("FS-P"):
            parts.append("落地式（固定）")
        elif line.startswith("FS"):
            parts.append("落地式")
        else:
            parts.append(line)
    return "、".join(dict.fromkeys(parts)) if parts else None


def assign_booking_channel(controlled, room_type_en):
    """Assign a booking channel based on room type (English) and registrar control."""
    if controlled:
        return "registrar"
    elif room_type_en in ("Conference Room", "Conference Room Service"):
        return "department"
    elif room_type_en == "Open Lab - Restricted":
        return "restricted"
    else:
        return "department"


BOOKING_SYSTEMS = [
    {
        "id": "registrar",
        "name": "教务处教室预约服务",
        "short_name": "教务处",
        "color": "#2563EB",
        "method": "在线表单\nhttps://sa-web.ucsd.edu/forms/reg/classroomspace/classroomSpaceRequestForm.aspx",
        "contact": "Registrar-Scheduling@ucsd.edu",
        "timeline": "1. 填写在线表单\n2. 等待确认（约1周）\n注意：最多提前3周申请",
        "applicable_to": "校内组织和部门\n仅限会议用途",
        "rate_overview": "免费",
        "notes": "限制：不能有食物、不能有外部演讲者、不能有资金交易\n黑名单期：开学第一周、Finals、假期、Break",
    },
    {
        "id": "department",
        "name": "院系/部门管理",
        "short_name": "院系管理",
        "color": "#7C3AED",
        "method": "联系对应建筑/部门管理方",
        "contact": "联系各楼宇管理部门",
        "timeline": "联系部门确认可用性和流程",
        "applicable_to": "校内组织、部门（因场地而异）",
        "rate_overview": "因场地而异",
        "notes": "这些教室由各学院/部门独立管理，预约流程各不相同",
    },
    {
        "id": "restricted",
        "name": "受限区域",
        "short_name": "受限",
        "color": "#DC2626",
        "method": "部门内部管理，不对外开放预约",
        "contact": "联系对应部门",
        "timeline": "N/A",
        "applicable_to": "仅限指定部门/课程使用",
        "rate_overview": "N/A",
        "notes": "受限区域，不接受外部预约",
    },
]


def main():
    sheet1, sheet2 = parse_xls(XLS_PATH)
    if not sheet1:
        print("No data found in XLS file")
        sys.exit(1)

    # Parse media equipment from second sheet
    media_data = parse_media_equipment(sheet2)
    print(f"Media equipment entries: {len(media_data)}")

    # Skip header row
    rows = sheet1
    header = rows[0]
    data_rows = rows[1:]

    # Filter out any rows that look like repeated headers
    data_rows = [r for r in data_rows if safe_get(r, COL_BUILDING_NAME) != "Building Name" and safe_get(r, COL_REGISTRAR_CODE) != "Registrar Code"]

    classrooms = {}  # building_code -> { spaces: [] }
    room_types_set = set()
    seating_types_set = set()
    total = 0

    for row in data_rows:
        building_name = safe_get(row, COL_BUILDING_NAME)
        room_num = safe_get(row, COL_ROOM)
        registrar_code = safe_get(row, COL_REGISTRAR_CODE)

        if not registrar_code or not building_name:
            continue

        # Extract building code from registrar code
        parts = registrar_code.split(" ", 1)
        building_code = parts[0] if parts else registrar_code

        # Skip the header-like "Registrar" entry
        if building_code == "Registrar":
            continue

        floor_val = safe_get(row, COL_FLOOR)
        area_val = safe_get(row, COL_AREA)
        capacity_val = safe_get(row, COL_CAPACITY)
        room_type = safe_get(row, COL_ROOM_TYPE)
        seating_raw = safe_get(row, COL_SEATING_TYPE)
        seating_type = extract_seating_short(seating_raw) or seating_raw
        boards = clean_multiline(safe_get(row, COL_BOARDS))
        acoustics = clean_multiline(safe_get(row, COL_ACOUSTICS))
        ventilation = safe_get(row, COL_VENTILATION) or None
        lighting = clean_multiline(safe_get(row, COL_LIGHTING))
        lectern = safe_get(row, COL_LECTERN) or None
        instructor_tables = safe_get(row, COL_INSTRUCTOR_TABLES) or None
        clock = safe_get(row, COL_CLOCK) or None
        floor_type_raw = safe_get(row, COL_FLOOR_TYPE)
        floor_type = extract_seating_short(floor_type_raw) or floor_type_raw or None
        window_count = parse_int(safe_get(row, COL_WINDOWS))
        darkenability = safe_get(row, COL_DARKENABILITY) or None
        coverings = safe_get(row, COL_COVERINGS) or None

        room_type_zh = ROOM_TYPE_ZH.get(room_type, room_type or "未知")
        seating_type_zh = SEATING_TYPE_ZH.get(seating_type, seating_type or "未知")
        if room_type_zh:
            room_types_set.add(room_type_zh)
        if seating_type_zh and seating_type_zh != "无":
            seating_types_set.add(seating_type_zh)

        room_data = {
            "id": make_id(registrar_code),
            "registrar_code": registrar_code,
            "building_name": building_name,
            "room": room_num,
            "floor": parse_int(floor_val),
            "area_sqft": parse_int(area_val),
            "capacity": parse_int(capacity_val),
            "room_type": ROOM_TYPE_ZH.get(room_type, room_type or "未知"),
            "controlled_by_registrar": parse_bool(safe_get(row, COL_CONTROLLED)),
            "used": parse_bool(safe_get(row, COL_USED)),
            "overflow_capable": parse_bool(safe_get(row, COL_OVERFLOW)),
            "floor_type": FLOOR_TYPE_ZH.get(floor_type, floor_type) if floor_type else None,
            "seating_type": SEATING_TYPE_ZH.get(seating_type, seating_type or "未知"),
            "ada_accessible": parse_bool(safe_get(row, COL_ADA)) if safe_get(row, COL_ADA).strip().lower() not in ("n/a", "") else safe_get(row, COL_ADA).strip().lower() == "yes",
            "projection_booth": parse_bool(safe_get(row, COL_PROJECTION_BOOTH)),
            "boards": boards,
            "simultaneous_board_projection": parse_bool(safe_get(row, COL_SIMULTANEOUS)),
            "acoustics": translate_acoustics(acoustics),
            "ventilation": VENTILATION_ZH.get(ventilation, ventilation) if ventilation else None,
            "window_count": window_count,
            "has_windows": window_count is not None and window_count > 0,
            "windows_darkenability": DARKENABILITY_ZH.get(darkenability, darkenability) if darkenability else None,
            "window_coverings": translate_coverings(coverings),
            "lighting": translate_lighting(lighting),
            "lectern": translate_lectern(lectern),
            "instructor_tables": INSTRUCTOR_TABLES_ZH.get(instructor_tables, instructor_tables) if instructor_tables else None,
            "clock": translate_clock(clock),
            "wheelchair_spaces": parse_int(safe_get(row, COL_WHEELCHAIR)),
        }

        # Fix ADA: if the value was "N/A", treat as None not False
        ada_raw = safe_get(row, COL_ADA).strip()
        if ada_raw.upper() == "N/A" or ada_raw == "":
            room_data["ada_accessible"] = None
        elif ada_raw.lower() == "yes":
            room_data["ada_accessible"] = True
        elif ada_raw.lower() == "no":
            room_data["ada_accessible"] = False

        # Merge media equipment data
        media = media_data.get(registrar_code, {})
        room_data["equipment"] = media.get("equipment", [])
        mc = media.get("media_control")
        room_data["media_control"] = MEDIA_CONTROL_ZH.get(mc, mc) if mc else None
        room_data["zoom_capable"] = media.get("zoom_capable")
        room_data["podcasting"] = media.get("podcasting")
        room_data["iclicker"] = media.get("iclicker")
        room_data["assisted_listening"] = media.get("assisted_listening")

        room_data["features"] = compute_features(room_data)
        room_data["booking_channel"] = assign_booking_channel(
            room_data.get("controlled_by_registrar"), room_type
        )

        # Add equipment-based features
        if room_data["zoom_capable"]:
            room_data["features"].append("支持Zoom")
        if room_data["podcasting"]:
            room_data["features"].append("可录播")
        if room_data["iclicker"]:
            room_data["features"].append("i>clicker")
        if room_data["equipment"]:
            room_data["features"].append("影音设备")

        if building_code not in classrooms:
            classrooms[building_code] = {"spaces": []}
        classrooms[building_code]["spaces"].append(room_data)
        total += 1

    # Sort buildings alphabetically, rooms by floor then room number
    sorted_classrooms = {}
    for code in sorted(classrooms.keys()):
        spaces = classrooms[code]["spaces"]
        spaces.sort(key=lambda s: (s["floor"] or 0, s["room"]))
        sorted_classrooms[code] = {"spaces": spaces}

    output = {
        "classrooms": sorted_classrooms,
        "booking_systems": BOOKING_SYSTEMS,
        "room_types": sorted(room_types_set),
        "seating_types": sorted(seating_types_set),
        "meta": {
            "total_classrooms": total,
            "total_buildings": len(sorted_classrooms),
            "source": "UCSD Registrar ClassroomAttributes",
            "last_updated": date.today().isoformat(),
        },
    }

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Generated {OUT_PATH}: {total} classrooms in {len(sorted_classrooms)} buildings")
    print(f"Room types: {sorted(room_types_set)}")
    print(f"Seating types: {sorted(seating_types_set)}")


if __name__ == "__main__":
    main()
