import json
from pathlib import Path

nb_path = Path(__file__).resolve().parents[1] / 'new_analysis.ipynb'
backup_path = nb_path.with_suffix('.ipynb.bak')

print(f"Notebook: {nb_path}")

with nb_path.open('r', encoding='utf-8') as f:
    nb = json.load(f)

# Backup
with backup_path.open('w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2, ensure_ascii=False)

print(f"Backup written to {backup_path}")

changed = 0
for cell in nb.get('cells', []):
    # Some files store id at top-level or in metadata; handle both
    top_id = cell.pop('id', None)
    meta = cell.setdefault('metadata', {})
    if 'id' not in meta:
        if top_id is not None:
            meta['id'] = top_id
            changed += 1
        else:
            # If neither exists, create a synthetic id to ensure uniqueness
            import uuid
            meta['id'] = str(uuid.uuid4())
            changed += 1

with nb_path.open('w', encoding='utf-8') as f:
    json.dump(nb, f, indent=4, ensure_ascii=False)

print(f"Updated notebook written. Cells updated: {changed}")
