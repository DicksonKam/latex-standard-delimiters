"""Package only a fully verified candidate. Run from the source package."""
from pathlib import Path
import hashlib, json, zipfile

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "manifest.json").read_text())
version = manifest["version"]
suite = json.loads((root / "suite-report.json").read_text())
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
required = {"navigation", "runtime", "editing-preview", "beta-audit", "typing-compatibility", "compatibility", "input-comfort", "composition-ownership", "panes-comfort", "upstream-coexistence", "popout", "swift-coexistence", "vim", "edit-performance", "theme-narrow", "container-editing", "container-variants", "euler-callout"}
stress = json.loads((root / "stress-suite-report.json").read_text())
native = json.loads((root / "native-daily-keyboard-report.json").read_text())
baseline = json.loads((root / "cross-section-baseline-report.json").read_text())
reading_perf = json.loads((root / "reading-revision-performance-report.json").read_text())
native_cross = json.loads((root / "native-cross-section-report.json").read_text())
reading_popout = json.loads((root / "reading-revision-popout-report.json").read_text())
checks = [
    (reading_popout.get("passed") is True and reading_popout.get("version") == version and reading_popout.get("mainJsSha256") == digest(root / "main.js") and len(reading_popout["results"]) >= 6 and all(item["passed"] for item in reading_popout["results"]), "Queued popout-close evidence must match and pass"),
    (reading_perf.get("passed") is True and reading_perf.get("version") == version and reading_perf.get("mainJsSha256") == digest(root / "main.js") and len(reading_perf["results"]) >= 17 and all(item["passed"] for item in reading_perf["results"]), "Reading revision performance and scroll evidence must match and pass"),
    (native_cross.get("passed") is True and native_cross.get("version") == version and native_cross.get("mainJsSha256") == digest(root / "main.js") and len(native_cross["results"]) >= 6 and all(item["passed"] for item in native_cross["results"]), "Trusted native cross-section edits must match and pass"),
    (baseline.get("version") == "0.4.4" and baseline.get("mainJsSha256") == "ad9db8104895e4fe5a61609baa3390ef9ff559d30f52fe9bc3c9324a090c9dd2" and any(item.get("name") == "Closing paragraph edit" and item.get("passed") is False and item.get("expected") == "3215" and item.get("actual") == "3214" for item in baseline["results"]), "Released-build failing regression must be recorded"),
    (native.get("version") == version and native.get("mainJsSha256") == digest(root / "main.js") and len(native["results"]) >= 9 and all(item["passed"] for item in native["results"]), "Native keyboard checks must match and pass"),
    (stress.get("passed") is True and all(item["count"] > 0 and not item["failures"] for item in stress["reports"]), "Stress suite must pass with nonempty checks"),
    (stress.get("version") == version and stress.get("mainJsSha256") == digest(root / "main.js"), "Stress evidence must match candidate"),
    ({item["name"] for item in stress["reports"]} == {"cross-section-editing", "boundary-stress", "daily-editing", "stress-rendering", "stress-lifecycle", "stress-volume"}, "All stress suites are required"),

    (suite.get("passed") is True, "Runtime suite must pass"),
    (suite.get("version") == version, "Runtime suite version must match candidate"),
    (suite.get("mainJsSha256") == digest(root / "main.js"), "main.js hash must match"),
    (suite.get("stylesSha256") == digest(root / "styles.css"), "styles.css hash must match"),
    (required == {item["name"] for item in suite["reports"]}, "All final suites are required"),
    (all(item["count"] > 0 and not item["failures"] for item in suite["reports"]), "All assertions must pass"),
    ("Local verification: complete" in (root / "COMPLETION-AUDIT.md").read_text(), "Local verification audit is not complete"),
]
for passed, message in checks:
    if not passed:
        raise SystemExit("Packaging blocked: " + message)
release_files = ["main.js", "manifest.json", "styles.css", "README.md", "LICENSE", "NOTICE.md", "Examples.md", "CHANGELOG.md", "VERIFICATION.md", "COMPATIBILITY.md", "PLATFORM-AUDIT.md", "DESKTOP-TESTING.md", "TYPING-INTEGRATION.md", "COMPLETION-AUDIT.md", "suite-report.json", "stress-suite-report.json", "STRESS-TESTING.md", "daily-editing-report.json", "boundary-stress-report.json", "cross-section-editing-report.json", "cross-section-baseline-report.json", "reading-revision-performance-report.json", "reading-revision-popout-report.json", "native-cross-section-report.json", "REVIEW-MILESTONE.md", "native-daily-keyboard-report.json"]
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
report = {"version": version, "mainJsSha256": suite["mainJsSha256"], "stylesSha256": suite["stylesSha256"], "runtimeChecks": sum(item["count"] for item in suite["reports"] + stress["reports"]), "archives": archives}
(root.parent / "release-verification.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
