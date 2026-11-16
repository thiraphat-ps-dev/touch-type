# Touch Type · พิมพ์สัมผัส

Learn to touch type in **Thai (Kedmanee)** and **English (QWERTY)** in the browser.

- **Lessons row by row.** Home row first, then the top, bottom and number rows, Shift, common words and sentences. Each lesson only uses keys you have already learned. Pass with 95% accuracy.
- **No need to switch your system keyboard.** Keys are read by position (`KeyboardEvent.code`), so the same key types "f" in English and "ด" in Thai.
- **On-screen keyboard and hints.** The next key lights up with the finger to use, which Shift to hold, and the name of Thai vowels and tone marks (for example ไม้โท, สระอู).
- **Built for Thai script.** A wrong key holds the cursor, so marks never land on the wrong letter, and letters with their marks are drawn as one cluster.
- **Weak keys.** Per-key accuracy and speed are tracked; the weak-keys drill is built from the keys you miss or reach slowly.
- **1-minute test**, a per-key accuracy heatmap and recent history.
- Thai or English interface. Data stays in the browser (localStorage).

Speed is shown in WPM, counting five characters as one word, for both languages.

## Develop

```sh
npm install
npm run dev     # http://localhost:5173
npm test        # engine and content tests (Vitest)
npm run build
```

Built with React, [thira-ui](https://github.com/thiraphat-ps-dev/thira-ui) and the [Thira Sans](https://github.com/thiraphat-ps-dev/thira-sans) font. No backend.

## Limits

- Needs a physical keyboard. The on-screen layout is US ANSI; other physical layouts still work by position.
- Pattachote and other Thai layouts are not included yet.
