"""Package only a fully verified candidate. Run from the source package."""
from pathlib import Path
import hashlib, json, zipfile

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "manifest.json").read_text())
version = manifest["version"]
suite = json.loads((root / "suite-report.json").read_text())
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
required = {"navigation", "runtime", "editing-preview", "beta-audit", "typing-compatibility", "compatibility", "input-comfort", "composition-ownership", "panes-comfort", "upstream-coexistence", "popout", "swift-coexistence", "vim", "edit-performance", "theme-narrow"}
checks = [
    (suite.get("passed") is True, "Runtime suite must pass"),
    (suite.get("version") == version, "Runtime suite version must match candidate"),
    (suite.get("mainJsSha256") == digest(root / "main.js"), "main.js hash must match"),
    (suite.get("stylesSha256") == digest(root / "styles.css"), "styles.css hash must match"),
    (required == {item["name"] for item in suite["reports"]}, "All final suites are required"),
    (all(not item["failures"] for item in suite["reports"]), "All assertions must pass"),
    ("Status: complete" in (root / "COMPLETION-AUDIT.md").read_text(), "Completion audit is not complete"),
]
for passed, message in checks:
    if not passed:
        raise SystemExit("Packaging blocked: " + message)
release_files = ["main.js", "manifest.json", "styles.css", "README.md", "LICENSE", "NOTICE.md", "Examples.md", "CHANGELOG.md", "VERIFICATION.md", "COMPATIBILITY.md", "PLATFORM-AUDIT.md", "MOBILE-CHECKLIST.md", "TYPING-INTEGRATION.md", "COMPLETION-AUDIT.md", "suite-report.json"]
archives = []
for source in [False, True]:
    target = root.parent / ("latex-standard-delimiters-" + version + ("-source" if source else "") + ".zip")
    files = [f for f in root.rglob("*") if f.is_file() and "node_modules" not in f.parts and ".git" not in f.parts and "__pycache__" not in f.parts] if source else [root / name for name in release_files]
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
        for file in files:
            archive.write(file, "latex-standard-delimiters/" + str(file.relative_to(root)))
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None
        assert hashlib.sha256(archive.read("latex-standard-delimiters/main.js")).hexdigest() == suite["mainJsSha256"]
        assert json.loads(archive.read("latex-standard-delimiters/manifest.json"))["version"] == version
    archives.append({"file": target.name, "sha256": digest(target)})
report = {"version": version, "mainJsSha256": suite["mainJsSha256"], "stylesSha256": suite["stylesSha256"], "runtimeChecks": sum(item["count"] for item in suite["reports"]), "archives": archives}
(root.parent / "release-verification.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
