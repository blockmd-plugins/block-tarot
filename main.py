#!/usr/bin/env python3
"""Block Tarot Mode (block-tarot) plugin for Block (blockmd)."""

import json
import os
import re
import sys

if hasattr(sys.stdin, "reconfigure"):
    sys.stdin.reconfigure(encoding="utf-8")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

STORAGE_KEY = "tarot_pref"
SETTINGS_PAGE_SURFACE = "settings_page"
SUPPORTED_SURFACES = {SETTINGS_PAGE_SURFACE}
TITLEBAR_BUTTON_ID = "tarot-toggle"

CHINESE_TEXT = re.compile(
    r"[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff"
    r"\ufe10-\ufe1f\ufe30-\ufe4f\uff00-\uffef]"
)

ROOM_LABELS = {
    "writing": ("写作", "Writing"),
    "table": ("牌桌", "Table"),
    "daily": ("每日一牌", "Daily Card"),
    "deck": ("牌册", "Arcana Deck"),
}


class HostRPCError(RuntimeError):
    """JSON-RPC error returned by the Block host."""

    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message


class HostBridge:
    """Line-delimited JSON-RPC 2.0 bridge between plugin and Block host."""

    def __init__(self):
        self._seq = 1000

    def send(self, obj):
        sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")
        sys.stdout.flush()

    def call_host(self, method, params=None):
        self._seq += 1
        req_id = f"p-{self._seq}"
        self.send({"jsonrpc": "2.0", "id": req_id, "method": method, "params": params or {}})
        while True:
            line = sys.stdin.readline()
            if not line:
                raise RuntimeError("stdin closed while awaiting host response")
            line = line.strip()
            if not line:
                continue
            msg = json.loads(line)
            if str(msg.get("id")) == req_id:
                if msg.get("error"):
                    err = msg["error"]
                    raise HostRPCError(int(err.get("code", -32000)), str(err.get("message", "host error")))
                return msg.get("result", {})

    def serve(self, handler, localize_error):
        while True:
            line = sys.stdin.readline()
            if not line:
                break
            line = line.strip()
            if not line:
                continue
            req = json.loads(line)
            method = req.get("method")
            req_id = req.get("id")
            try:
                result = handler(self, method, req.get("params") or {})
                self.send({"jsonrpc": "2.0", "id": req_id, "result": result})
                if method == "plugin.shutdown":
                    break
            except Exception as exc:
                self.send({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32000, "message": localize_error(str(exc))},
                })


class TarotPlugin:
    """Controls Block's native Midnight Copperplate Tarot Mode."""

    def __init__(self):
        self.plugin_id = "block-tarot"
        self.locale = "zh"
        self.metric_tone = False
        self.cached_enabled = False
        self.cached_room = "writing"

    def _is_en(self):
        return str(self.locale or "").lower().startswith("en")

    def _tr(self, zh, en):
        return en if self._is_en() else zh

    def _localize_error(self, message):
        text = str(message or "").strip()
        if self._is_en() and CHINESE_TEXT.search(text):
            return "Operation failed"
        return text or self._tr("操作失败", "Operation failed")

    def _room_label(self, room):
        zh, en = ROOM_LABELS.get(str(room or "writing").lower(), ROOM_LABELS["writing"])
        return en if self._is_en() else zh

    def _fallback_state(self):
        return {
            "supported": False,
            "enabled": bool(self.cached_enabled),
            "room": self.cached_room or "writing",
            "collected": 0,
            "total": 22,
            "daily_drawn": False,
            "daily_note": "",
            "active_note": "",
        }

    def _normalize_state(self, raw):
        if not isinstance(raw, dict):
            return self._fallback_state()
        supported = bool(raw.get("supported", True))
        enabled = bool(raw.get("enabled", self.cached_enabled))
        room = str(raw.get("room") or "writing").strip().lower()
        if room not in ROOM_LABELS:
            room = "writing"
        total = int(raw.get("total") or 22)
        if total <= 0:
            total = 22
        collected = max(0, min(total, int(raw.get("collected") or 0)))
        self.cached_enabled = enabled
        self.cached_room = room
        return {
            "supported": supported,
            "enabled": enabled,
            "room": room,
            "collected": collected,
            "total": total,
            "daily_drawn": bool(raw.get("daily_drawn")),
            "daily_note": str(raw.get("daily_note") or "").strip(),
            "active_note": str(raw.get("active_note") or "").strip(),
        }

    def _get_state(self, bridge):
        try:
            res = bridge.call_host("host.ui.tarot_state", {})
            return self._normalize_state(res)
        except HostRPCError as exc:
            if exc.code in (-32601, -32005):
                return self._fallback_state()
            raise

    def _sync_titlebar_button(self, bridge, enabled):
        try:
            bridge.call_host(
                "host.titlebar.set_button",
                {"id": TITLEBAR_BUTTON_ID, "active": bool(enabled)},
            )
        except HostRPCError:
            pass

    def _refresh_surfaces(self, bridge):
        try:
            bridge.call_host("host.ui.refresh", {"surface": SETTINGS_PAGE_SURFACE})
        except HostRPCError:
            pass

    def _save_pref(self, bridge, enabled):
        self.cached_enabled = bool(enabled)
        try:
            bridge.call_host("host.storage.set", {"key": STORAGE_KEY, "value": {"enabled": self.cached_enabled}})
        except HostRPCError:
            pass

    def _set_tarot(self, bridge, enabled=None, toggle=False, room=""):
        params = {}
        if toggle:
            params["toggle"] = True
        elif enabled is not None:
            params["enabled"] = bool(enabled)
        if room:
            params["room"] = room

        try:
            res = bridge.call_host("host.ui.set_tarot", params)
            st = self._normalize_state(res)
            self._save_pref(bridge, st["enabled"])
            self._sync_titlebar_button(bridge, st["enabled"])
            return st, True
        except HostRPCError as exc:
            if exc.code in (-32601, -32005):
                next_on = (not self.cached_enabled) if toggle else (bool(enabled) if enabled is not None else True)
                self._save_pref(bridge, next_on)
                if room in ROOM_LABELS:
                    self.cached_room = room
                st = self._fallback_state()
                self._sync_titlebar_button(bridge, st["enabled"])
                return st, False
            raise

    def _build_page(self, st, status=""):
        enabled = bool(st["enabled"])
        collected = int(st["collected"])
        total = int(st["total"])
        daily_drawn = bool(st["daily_drawn"])

        control_items = [
            {
                "kind": "switch",
                "id": "tarot_enabled",
                "label": self._tr("开启塔罗模式（午夜铜版）", "Enable Tarot Mode (Midnight Copperplate)"),
                "value": enabled,
            },
            {
                "kind": "actions",
                "buttons": [
                    {
                        "id": "open_writing",
                        "label": self._tr("进入塔罗写作", "Open Tarot Writing"),
                        "variant": "primary",
                    },
                    {
                        "id": "open_table",
                        "label": self._tr("牌桌", "Table"),
                        "variant": "secondary",
                    },
                    {
                        "id": "open_daily",
                        "label": self._tr("每日一牌", "Daily Card"),
                        "variant": "secondary",
                    },
                    {
                        "id": "open_deck",
                        "label": self._tr("牌册", "Arcana Deck"),
                        "variant": "secondary",
                    },
                ],
            },
        ]

        daily_val = self._tr("已翻开", "Revealed") if daily_drawn else self._tr("未翻开", "Unopened")
        mode_val = self._tr("已开启", "Active") if enabled else self._tr("未开启", "Off")
        metrics = [
            {"label": self._tr("当前状态", "Status"), "value": mode_val},
            {"label": self._tr("大阿卡纳牌册", "Major Arcana"), "value": f"{collected} / {total}"},
            {"label": self._tr("今日一牌", "Daily Card"), "value": daily_val},
        ]
        if self.metric_tone:
            metrics[0]["tone"] = "accent" if enabled else "neutral"
            metrics[1]["tone"] = "accent" if collected > 0 else "neutral"
            metrics[2]["tone"] = "success" if daily_drawn else "neutral"

        overview_rows = [
            {
                "label": self._tr("当前房间", "Active Room"),
                "value": self._room_label(st["room"]),
            },
            {
                "label": self._tr("覆盖范围", "Scope"),
                "value": self._tr(
                    "写作羊皮纸、AI 显影牌、速记小窗与三仪式房间",
                    "Parchment editor, AI developing card, Quick Note skin, and 3 ritual rooms",
                ),
            },
            {
                "label": self._tr("快捷返回", "Quick Return"),
                "value": self._tr(
                    "仪式房间按 Esc 回到写作，顶栏随时退出回默认主题",
                    "Press Esc in ritual rooms to return to writing, or exit anytime from the topbar",
                ),
            },
        ]
        if not st["supported"]:
            overview_rows.append({
                "label": self._tr("宿主支持", "Host Support"),
                "value": self._tr(
                    "请升级至支持塔罗模式的 Block 桌面端",
                    "Update Block desktop to enable native Tarot Mode rendering",
                ),
            })

        return {
            "title": self._tr("塔罗模式", "Tarot Mode"),
            "status": status,
            "cards": [
                {
                    "id": "tarot-controls",
                    "title": self._tr("模式与仪式房间", "Mode & Ritual Rooms"),
                    "items": control_items,
                },
                {
                    "id": "tarot-overview",
                    "title": self._tr("牌册与状态", "Collection & Status"),
                    "items": [
                        {"kind": "metrics", "metrics": metrics},
                        {"kind": "kv", "rows": overview_rows},
                    ],
                },
            ],
        }

    def handle(self, bridge, method, params):
        if method == "plugin.initialize":
            self.plugin_id = str(params.get("plugin_id") or "block-tarot")
            self.locale = str(params.get("locale") or "zh")
            caps = set(params.get("ui_capabilities") or [])
            self.metric_tone = "metric_tone" in caps

            try:
                stored = bridge.call_host("host.storage.get", {"key": STORAGE_KEY})
                val = stored.get("value") if isinstance(stored, dict) else None
                if isinstance(val, dict) and "enabled" in val:
                    self.cached_enabled = bool(val["enabled"])
            except HostRPCError:
                pass

            st = self._get_state(bridge)
            self._sync_titlebar_button(bridge, st["enabled"])
            return {"ready": True}

        if method == "plugin.render":
            surface = str(params.get("surface") or SETTINGS_PAGE_SURFACE)
            if surface not in SUPPORTED_SURFACES:
                surface = SETTINGS_PAGE_SURFACE
            values = params.get("values")
            status = ""
            if isinstance(values, dict) and "tarot_enabled" in values:
                desired = bool(values.get("tarot_enabled"))
                st, live = self._set_tarot(bridge, enabled=desired)
                if live:
                    status = (
                        self._tr("已开启塔罗模式", "Tarot Mode enabled")
                        if st["enabled"]
                        else self._tr("已退出塔罗模式", "Tarot Mode disabled")
                    )
                else:
                    status = self._tr("已记录偏好设置", "Preference saved")
            else:
                st = self._get_state(bridge)
                self._sync_titlebar_button(bridge, st["enabled"])
            return {
                "page": self._build_page(st, status=status),
                "values": {"tarot_enabled": bool(st["enabled"])},
            }

        if method == "plugin.action":
            surface = str(params.get("surface") or SETTINGS_PAGE_SURFACE)
            if surface not in SUPPORTED_SURFACES:
                surface = SETTINGS_PAGE_SURFACE
            action_id = str(params.get("action_id") or "")
            room_map = {
                "open_writing": "writing",
                "open_table": "table",
                "open_daily": "daily",
                "open_deck": "deck",
            }
            if action_id in room_map:
                room = room_map[action_id]
                st, live = self._set_tarot(bridge, enabled=True, room=room)
                if live:
                    status = self._tr(
                        f"已进入{self._room_label(room)}",
                        f"Opened {self._room_label(room)}",
                    )
                    tone = "success"
                else:
                    status = self._tr(
                        "请在 Block 桌面端使用原生塔罗模式界面",
                        "Open in Block desktop to use native Tarot Mode",
                    )
                    tone = "info"
                return {
                    "ok": True,
                    "tone": tone,
                    "status": status,
                    "page": self._build_page(st, status=status),
                    "values": {"tarot_enabled": bool(st["enabled"])},
                }

            st = self._get_state(bridge)
            return {
                "ok": False,
                "tone": "warning",
                "status": self._tr("未知操作", "Unknown action"),
                "page": self._build_page(st),
                "values": {"tarot_enabled": bool(st["enabled"])},
            }

        if method == "plugin.command":
            cmd_id = str(params.get("command_id") or "")
            if cmd_id == "toggle_tarot":
                st, live = self._set_tarot(bridge, toggle=True)
                self._refresh_surfaces(bridge)
                if not live:
                    return {
                        "ok": True,
                        "tone": "info",
                        "status": self._tr(
                            "请升级 Block 桌面端以启用塔罗模式",
                            "Update Block desktop to enable Tarot Mode",
                        ),
                    }
                return {
                    "ok": True,
                    "tone": "info",
                    "status": (
                        self._tr("已进入塔罗模式", "Tarot Mode enabled")
                        if st["enabled"]
                        else self._tr("已回到 Ocean Paper", "Returned to Ocean Paper")
                    ),
                }

            cmd_rooms = {
                "open_table": "table",
                "open_daily": "daily",
                "open_deck": "deck",
            }
            if cmd_id in cmd_rooms:
                room = cmd_rooms[cmd_id]
                st, live = self._set_tarot(bridge, enabled=True, room=room)
                self._refresh_surfaces(bridge)
                if not live:
                    return {
                        "ok": True,
                        "tone": "info",
                        "status": self._tr(
                            "请升级 Block 桌面端以启用塔罗模式",
                            "Update Block desktop to enable Tarot Mode",
                        ),
                    }
                return {
                    "ok": True,
                    "tone": "info",
                    "status": self._tr(
                        f"已打开塔罗{self._room_label(room)}",
                        f"Opened Tarot {self._room_label(room)}",
                    ),
                }
            return {"ok": False, "tone": "warning", "status": self._tr("未知命令", "Unknown command")}

        if method == "plugin.event":
            event_name = str(params.get("event") or "")
            if event_name == "locale.changed" and params.get("locale"):
                self.locale = str(params["locale"])
                self._refresh_surfaces(bridge)
                return {"handled": True}
            if event_name == "theme.changed":
                if "tarot" in params:
                    enabled = bool(params.get("tarot"))
                    self._save_pref(bridge, enabled)
                    self._sync_titlebar_button(bridge, enabled)
                else:
                    st = self._get_state(bridge)
                    self._sync_titlebar_button(bridge, st["enabled"])
                self._refresh_surfaces(bridge)
            return {"handled": True}

        if method == "plugin.shutdown":
            return {"ok": True}

        raise RuntimeError(self._tr(f"不支持的方法：{method}", f"Unsupported method: {method}"))


def main():
    bridge = HostBridge()
    plugin = TarotPlugin()
    bridge.serve(plugin.handle, plugin._localize_error)


if __name__ == "__main__":
    main()
