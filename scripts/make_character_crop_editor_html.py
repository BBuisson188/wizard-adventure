#!/usr/bin/env python3
"""Build a self-contained visual crop-box editor for character sheets."""

from __future__ import annotations

import argparse
import base64
import html
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PLAN = ROOT / "docs" / "crop-plan-character-sheets.json"
DEFAULT_OUT = ROOT / "docs" / "character-crop-editor.html"


def data_uri(path: Path) -> str:
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a self-contained visual crop-box editor.")
    parser.add_argument("--plan", default=str(DEFAULT_PLAN))
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    args = parser.parse_args()

    plan_path = Path(args.plan)
    out_path = Path(args.out)
    if not plan_path.is_absolute():
        plan_path = ROOT / plan_path
    if not out_path.is_absolute():
        out_path = ROOT / out_path

    plan = json.loads(plan_path.read_text(encoding="utf-8"))
    sheet_images = {sheet: data_uri(ROOT / sheet) for sheet in plan["sheets"]}
    payload = {
        "plan": plan,
        "sheetImages": sheet_images,
    }

    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Wizard Adventures Character Crop Editor</title>
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
    }}
    .toolbar {{
      position: sticky;
      top: 0;
      z-index: 20;
      display: grid;
      grid-template-columns: 1fr auto auto auto auto;
      gap: 10px;
      align-items: center;
      padding: 12px;
      background: #111827;
      border-bottom: 1px solid rgba(255,255,255,.18);
    }}
    select, button, input {{
      border: 1px solid rgba(255,255,255,.25);
      background: #1f2937;
      color: #f8fafc;
      border-radius: 6px;
      padding: 8px 10px;
      font: inherit;
    }}
    button {{ cursor: pointer; }}
    button:hover {{ background: #334155; }}
    label {{ color: #cbd5e1; font-size: 13px; }}
    .wrap {{
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      min-height: calc(100vh - 58px);
    }}
    .stageOuter {{
      overflow: auto;
      padding: 18px;
      background: #0b1120;
    }}
    .stage {{
      position: relative;
      width: 1448px;
      height: 1086px;
      transform-origin: top left;
      border: 1px solid rgba(255,255,255,.28);
      background: #334155;
    }}
    .sheet {{
      position: absolute;
      inset: 0;
      width: 1448px;
      height: 1086px;
      user-select: none;
      -webkit-user-drag: none;
    }}
    .box {{
      position: absolute;
      border: 3px solid #ff1744;
      background: rgba(255, 23, 68, .08);
      box-shadow: 0 0 0 1px rgba(255,255,255,.9) inset;
      cursor: move;
    }}
    .box.selected {{
      border-color: #38bdf8;
      background: rgba(56,189,248,.12);
      z-index: 5;
    }}
    .box span {{
      position: absolute;
      left: 0;
      top: -22px;
      max-width: 260px;
      padding: 2px 5px;
      background: #ff1744;
      color: white;
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
    }}
    .box.selected span {{ background: #0284c7; }}
    .handle {{
      position: absolute;
      width: 14px;
      height: 14px;
      right: -8px;
      bottom: -8px;
      border: 2px solid white;
      background: #38bdf8;
      cursor: nwse-resize;
    }}
    aside {{
      border-left: 1px solid rgba(255,255,255,.18);
      background: #111827;
      padding: 14px;
      overflow: auto;
    }}
    h1 {{ margin: 0; font-size: 18px; }}
    h2 {{ margin: 12px 0 8px; font-size: 16px; }}
    .hint {{ color: #cbd5e1; font-size: 13px; line-height: 1.4; }}
    .fields {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 10px 0;
    }}
    .fields label {{ display: grid; gap: 4px; }}
    textarea {{
      width: 100%;
      height: 330px;
      resize: vertical;
      border: 1px solid rgba(255,255,255,.2);
      background: #020617;
      color: #dbeafe;
      border-radius: 6px;
      padding: 8px;
      font: 12px Consolas, monospace;
    }}
    .targetList {{
      max-height: 240px;
      overflow: auto;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 6px;
    }}
    .targetItem {{
      padding: 7px 8px;
      color: #dbeafe;
      border-bottom: 1px solid rgba(255,255,255,.08);
      font-size: 12px;
      overflow-wrap: anywhere;
      cursor: pointer;
    }}
    .targetItem.active {{ background: #1e40af; color: white; }}
    .row {{ display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }}
    .warn {{ color: #fde68a; }}
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>Character Crop Editor</h1>
    <label>Sheet <select id="sheetSelect"></select></label>
    <label>Zoom <input id="zoom" type="range" min="35" max="120" value="65"></label>
    <button id="exportBtn">Update JSON</button>
    <button id="downloadBtn">Download JSON</button>
  </div>
  <div class="wrap">
    <div class="stageOuter">
      <div id="stage" class="stage">
        <img id="sheetImage" class="sheet" alt="">
      </div>
    </div>
    <aside>
      <p class="hint">
        Drag a box to move it. Drag the blue corner to resize it. Click a box or file name to select it.
        Use arrow keys to nudge the selected box by 1px; hold Shift for 10px.
      </p>
      <h2>Selected Box</h2>
      <div id="selectedName" class="hint">None selected</div>
      <div class="fields">
        <label>X <input id="xInput" type="number"></label>
        <label>Y <input id="yInput" type="number"></label>
        <label>W <input id="wInput" type="number"></label>
        <label>H <input id="hInput" type="number"></label>
      </div>
      <div class="row">
        <button id="copyBtn">Copy JSON</button>
        <button id="resetBtn">Reset From Loaded</button>
        <button id="importBtn">Import Textarea JSON</button>
        <button id="addBtn">Add Box</button>
        <button id="deleteBtn">Delete Box</button>
        <button id="clearSavedBtn">Clear Browser Autosave</button>
      </div>
      <label>New/selected target path <input id="targetPathInput" type="text" placeholder="assets/enemies/example/frame.png"></label>
      <p id="saveStatus" class="hint warn"></p>
      <h2>Targets</h2>
      <div id="targetList" class="targetList"></div>
      <h2>Exported crop-plan JSON</h2>
      <textarea id="jsonOut" spellcheck="false"></textarea>
    </aside>
  </div>

  <script>
    const initialData = {json.dumps(payload)};
    const storageKey = 'wizard-adventures-character-crop-plan-v1';
    let saved = null;
    try {{ saved = JSON.parse(localStorage.getItem(storageKey)); }} catch (_) {{}}
    let plan = saved || structuredClone(initialData.plan);
    const loadedPlan = structuredClone(initialData.plan);
    let currentSheet = Object.keys(plan.sheets)[0];
    let selectedTarget = null;
    let drag = null;

    const sheetSelect = document.getElementById('sheetSelect');
    const stage = document.getElementById('stage');
    const sheetImage = document.getElementById('sheetImage');
    const targetList = document.getElementById('targetList');
    const selectedName = document.getElementById('selectedName');
    const jsonOut = document.getElementById('jsonOut');
    const xInput = document.getElementById('xInput');
    const yInput = document.getElementById('yInput');
    const wInput = document.getElementById('wInput');
    const hInput = document.getElementById('hInput');

    for (const sheet of Object.keys(plan.sheets)) {{
      const opt = document.createElement('option');
      opt.value = sheet;
      opt.textContent = sheet;
      sheetSelect.appendChild(opt);
    }}

    function rectFor(target) {{
      return plan.sheets[currentSheet].targets[target];
    }}

    function setRect(target, rect) {{
      plan.sheets[currentSheet].targets[target] = rect.map(v => Math.max(0, Math.round(v)));
    }}

    function render() {{
      sheetImage.src = initialData.sheetImages[currentSheet];
      sheetImage.alt = currentSheet;
      stage.querySelectorAll('.box').forEach(el => el.remove());
      const targets = plan.sheets[currentSheet].targets;
      if (!selectedTarget || !(selectedTarget in targets)) selectedTarget = Object.keys(targets)[0];

      for (const [target, rect] of Object.entries(targets)) {{
        const [x, y, w, h] = rect;
        const box = document.createElement('div');
        box.className = 'box' + (target === selectedTarget ? ' selected' : '');
        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.width = w + 'px';
        box.style.height = h + 'px';
        box.dataset.target = target;
        box.innerHTML = `<span>${{target.split('/').pop()}}</span><div class="handle"></div>`;
        box.addEventListener('pointerdown', onBoxPointerDown);
        box.querySelector('.handle').addEventListener('pointerdown', onHandlePointerDown);
        stage.appendChild(box);
      }}
      renderTargetList();
      renderSelected();
      updateJson();
    }}

    function renderTargetList() {{
      targetList.innerHTML = '';
      for (const target of Object.keys(plan.sheets[currentSheet].targets)) {{
        const item = document.createElement('div');
        item.className = 'targetItem' + (target === selectedTarget ? ' active' : '');
        item.textContent = target;
        item.onclick = () => {{ selectedTarget = target; render(); }};
        targetList.appendChild(item);
      }}
    }}

    function renderSelected() {{
      if (!selectedTarget) return;
      selectedName.textContent = selectedTarget;
      const [x, y, w, h] = rectFor(selectedTarget);
      xInput.value = x; yInput.value = y; wInput.value = w; hInput.value = h;
      document.getElementById('targetPathInput').value = selectedTarget;
    }}

    function updateFromInputs() {{
      if (!selectedTarget) return;
      setRect(selectedTarget, [xInput.valueAsNumber, yInput.valueAsNumber, wInput.valueAsNumber, hInput.valueAsNumber]);
      render();
    }}

    [xInput, yInput, wInput, hInput].forEach(input => input.addEventListener('change', updateFromInputs));

    function stagePoint(e) {{
      const rect = stage.getBoundingClientRect();
      const scale = rect.width / 1448;
      return {{
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale
      }};
    }}

    function onBoxPointerDown(e) {{
      if (e.target.classList.contains('handle')) return;
      e.preventDefault();
      selectedTarget = e.currentTarget.dataset.target;
      const p = stagePoint(e);
      const [x, y, w, h] = rectFor(selectedTarget);
      drag = {{ type: 'move', target: selectedTarget, startX: p.x, startY: p.y, rect: [x, y, w, h] }};
      e.currentTarget.setPointerCapture(e.pointerId);
      render();
    }}

    function onHandlePointerDown(e) {{
      e.preventDefault();
      e.stopPropagation();
      const box = e.currentTarget.closest('.box');
      selectedTarget = box.dataset.target;
      const p = stagePoint(e);
      const [x, y, w, h] = rectFor(selectedTarget);
      drag = {{ type: 'resize', target: selectedTarget, startX: p.x, startY: p.y, rect: [x, y, w, h] }};
      box.setPointerCapture(e.pointerId);
      render();
    }}

    window.addEventListener('pointermove', e => {{
      if (!drag) return;
      const p = stagePoint(e);
      const dx = p.x - drag.startX;
      const dy = p.y - drag.startY;
      let [x, y, w, h] = drag.rect;
      if (drag.type === 'move') {{
        x += dx; y += dy;
      }} else {{
        w = Math.max(20, w + dx);
        h = Math.max(20, h + dy);
      }}
      setRect(drag.target, [x, y, w, h]);
      render();
    }});

    window.addEventListener('pointerup', () => {{ drag = null; }});

    window.addEventListener('keydown', e => {{
      if (!selectedTarget || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      const step = e.shiftKey ? 10 : 1;
      let [x, y, w, h] = rectFor(selectedTarget);
      if (e.key === 'ArrowLeft') x -= step;
      else if (e.key === 'ArrowRight') x += step;
      else if (e.key === 'ArrowUp') y -= step;
      else if (e.key === 'ArrowDown') y += step;
      else return;
      e.preventDefault();
      setRect(selectedTarget, [x, y, w, h]);
      render();
    }});

    function updateJson() {{
      jsonOut.value = JSON.stringify(plan, null, 2);
      try {{
        localStorage.setItem(storageKey, jsonOut.value);
        document.getElementById('saveStatus').textContent = 'Autosaved in this browser. Use Download JSON to save a file.';
      }} catch (_) {{
        document.getElementById('saveStatus').textContent = 'Autosave failed. Use Copy JSON or Download JSON.';
      }}
    }}

    sheetSelect.addEventListener('change', () => {{
      currentSheet = sheetSelect.value;
      selectedTarget = null;
      render();
    }});

    document.getElementById('zoom').addEventListener('input', e => {{
      stage.style.transform = `scale(${{e.target.value / 100}})`;
    }});

    document.getElementById('exportBtn').onclick = updateJson;
    document.getElementById('copyBtn').onclick = async () => {{
      updateJson();
      await navigator.clipboard.writeText(jsonOut.value);
    }};
    document.getElementById('downloadBtn').onclick = () => {{
      updateJson();
      const blob = new Blob([jsonOut.value], {{ type: 'application/json' }});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'crop-plan-character-sheets.json';
      a.click();
      URL.revokeObjectURL(a.href);
    }};
    document.getElementById('resetBtn').onclick = () => {{
      plan = structuredClone(loadedPlan);
      selectedTarget = null;
      render();
    }};
    document.getElementById('addBtn').onclick = () => {{
      const input = document.getElementById('targetPathInput');
      const target = input.value.trim() || `assets/crops/new_crop_${{Date.now()}}.png`;
      plan.sheets[currentSheet].targets[target] = [40, 40, 140, 180];
      selectedTarget = target;
      render();
    }};
    document.getElementById('deleteBtn').onclick = () => {{
      if (!selectedTarget) return;
      if (!confirm('Delete crop box for ' + selectedTarget + '?')) return;
      delete plan.sheets[currentSheet].targets[selectedTarget];
      selectedTarget = null;
      render();
    }};
    document.getElementById('targetPathInput').addEventListener('change', e => {{
      if (!selectedTarget) return;
      const next = e.target.value.trim();
      if (!next || next === selectedTarget) return;
      const rect = rectFor(selectedTarget);
      delete plan.sheets[currentSheet].targets[selectedTarget];
      plan.sheets[currentSheet].targets[next] = rect;
      selectedTarget = next;
      render();
    }});
    document.getElementById('importBtn').onclick = () => {{
      try {{
        const imported = JSON.parse(jsonOut.value);
        if (!imported.sheets) throw new Error('Missing sheets object');
        plan = imported;
        currentSheet = Object.keys(plan.sheets)[0];
        sheetSelect.innerHTML = '';
        for (const sheet of Object.keys(plan.sheets)) {{
          const opt = document.createElement('option');
          opt.value = sheet;
          opt.textContent = sheet;
          sheetSelect.appendChild(opt);
        }}
        sheetSelect.value = currentSheet;
        selectedTarget = null;
        render();
      }} catch (err) {{
        alert('Could not import JSON: ' + err.message);
      }}
    }};
    document.getElementById('clearSavedBtn').onclick = () => {{
      localStorage.removeItem(storageKey);
      document.getElementById('saveStatus').textContent = 'Browser autosave cleared.';
    }};

    stage.style.transform = 'scale(.65)';
    render();
  </script>
</body>
</html>
"""
    out_path.write_text(doc, encoding="utf-8")
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
