# v6.1 Release QA

## Answer-position audit
The game now balances correct-answer positions deterministically per chapter at runtime after all options are finalized.
Expected Ch4–8 distribution from case choice counts:
- Chapter 4: 27 choices → A 7 / B 7 / C 7 / D 6
- Chapter 5: 25 choices → A 7 / B 6 / C 6 / D 6
- Chapter 6: 16 choices → A 4 / B 4 / C 4 / D 4
- Chapter 7: 12 choices → A 3 / B 3 / C 3 / D 3
- Chapter 8: 10 choices → A 3 / B 3 / C 2 / D 2

At runtime inspect `window.DT_ANSWER_AUDIT` in the browser console for actual chapter counts.
Ch4–8 choice steps are expanded to at least four plausible options before balancing.

## Static checks
All JavaScript files pass `node --check`.

## Manual browser smoke test recommended
New Career → first welcome → Case 001 → coffee side quest → day end → next morning → one Ch4+ case.
Verify mobile at ~390px width and desktop at 1440px.
