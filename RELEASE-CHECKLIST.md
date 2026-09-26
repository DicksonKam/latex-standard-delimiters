# 0.3.0 release gate — verified

npm run check passes 19 unit tests, TypeScript, version consistency and production build. All 195 actual-app checks pass, including repeated-edit performance and actual Minimal/narrow-pane checks. Final evidence records version 0.3.0, observed host 1.13.7 and matching main.js/styles.css hashes.

README, VERIFICATION, COMPATIBILITY, PLATFORM-AUDIT, TYPING-INTEGRATION, MOBILE-CHECKLIST and COMPLETION-AUDIT describe scope and limitations. package-release.py validates suite/version/hash requirements and verifies both ZIPs before emitting archive hashes. The archived 0.2.0 release is unchanged. Main-vault files were not modified. GitHub beta publication is now authorized; see RELEASING.md for the subsequent release process.
