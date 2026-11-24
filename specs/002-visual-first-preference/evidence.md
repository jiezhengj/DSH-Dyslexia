

## E-PUB . 0.2.24

- tag `v0.2.24`, run `45413812999` (success), shasum `728bd22f40b893db00c4f3109ddd9360d307cd66`, 33 files.
- CI: `check-bundle: @jiezhengj/dsh-dyslexia@0.2.24 | client.js 790821 bytes | sources sha256:e735880491501f8df7a1dc29a3ff0e2e | all 67 checks passed`; `run-harness: ... all 325 checks passed (/usr/bin/google-chrome)`.

## E-INS . 0.2.24

- Installed into profile `desktop` from the registry after the `0.2.23` removal.
- Read in a throw-away profile (`look`, since deleted) through `dsh web`, in both themes:
  - Settings shows its own navigation entry (Chinese: the plugin page name) beside General / Models / Built-in plugins / Agent presets, instead of a row inside General.
  - Light, off: track `rgba(0, 0, 0, 0.12)`, thumb `rgb(255, 255, 255)`. Light, on: track `rgb(249, 250, 251)`, thumb `rgb(15, 17, 21)`.
  - Dark, off: track `rgba(255, 255, 255, 0.16)`, thumb `rgb(173, 178, 184)`. Dark, on: track `rgb(249, 250, 251)`, thumb `rgb(15, 17, 21)`.
  - Clicking writes `visualFirst: false` / `true` into the profile patch file and the row reports the save.
