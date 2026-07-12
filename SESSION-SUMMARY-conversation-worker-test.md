# SESSION SUMMARY — eu-ai-act-conversation-worker-test
## AI Discovery Layer / Conversational Answer Layer — Build & Verification
## Date: 2026-07-12
---

# Objective for this session
Build and verify an experimental conversational answer layer on top of
the existing `/search` retrieval Worker, WITHOUT touching the frozen
production Worker (`eu-ai-act-search-api`) or binding any route on
`eu-ai-act-ready.eu`.

---

# Starting point
Production Worker `eu-ai-act-search-api` (verified against exact
deployed source, 118 lines):
- D1-backed keyword retrieval only
- No AI generation layer
- Two search paths: article-number match (`LIKE '%N%'` on id and
  text) and first-word-only match for any other query
- Fallback response for unmatched paths: plain text
  `"EU AI Act API Multi-Protocol Live"`

---

# What was built
New, separate Worker: **`eu-ai-act-conversation-worker-test`**
Deployed at: `eu-ai-act-conversation-worker-test.aipath512.workers.dev`
Bindings: `DB` (D1, same database as production: `eu-ai-act-db`),
`AI` (Workers AI)

Structure: clone of production `/search` logic, unchanged, with one
generation step added after D1 retrieval, using `env.AI.run()` to
turn retrieved chunks into a human-readable answer.

---

# Timeline of findings and fixes

## 1. Model deprecation (blocking bug)
**Found:** `env.AI.run()` calls initially used
`@cf/meta/llama-3.1-8b-instruct`, which Cloudflare deprecated on
2026-05-30 as part of a general model-catalog refresh. Confirmed via
live Observability logs: `AiError: 5028: This model was deprecated
on 2026-05-30.`
**Fixed:** Swapped to `@cf/zai-org/glm-4.7-flash` — Cloudflare's
recommended multilingual replacement, 131,072 token context window,
suited to the mixed Romanian/English regulatory text in this
database.

## 2. Output schema mismatch (blocking bug)
**Found:** After the model swap, `generated_answer` still came back
`null` with no error. Root cause: GLM-4.7-Flash returns an
OpenAI-style `choices[0].message.content` structure, not the old
model's flat `{ response: "..." }` shape.
**Fixed:** Updated extraction logic to read
`aiResponse.choices[0].message.content`.

## 3. Retrieval quality — confirmed pre-existing, NOT fixed today
Testing against the 5 real "Popular Askes" queries (the actual chip
queries used on the live frontend) confirmed the known limitation:
- Queries with a bare number (e.g. "Article 4", "Article 53") use
  `id/text LIKE '%N%'`, which matches any chunk whose ID or text
  contains that digit ANYWHERE — not specifically that article. This
  produced clearly wrong retrieval for "Article 4" (matched chunk-004,
  014, 024, 025 — none about AI literacy).
- Queries without a number collapse to a first-word-only search
  (`cleanQuery.split(" ")[0]`), so "What does Article 4 require..."
  and "How do I classify..." search on "what" / "how" respectively —
  near-meaningless matches.
- This logic is IDENTICAL to what's already live in production
  `eu-ai-act-search-api`. Not touched today. Affects both Workers
  equally.

## 4. AI grounding failure (serious, verified against raw DB content)
**Found:** Asked "What are Article 53 GPAI provider obligations?".
Retrieval returned chunk-053 (actually about Article 11, technical
documentation for high-risk systems — confirmed via direct D1 query)
alongside 3 other irrelevant chunks. The model answered fluently and
specifically about Article 53 — correct EU AI Act content, WRONG
SOURCE — fabricated from its own training knowledge rather than the
provided (wrong) excerpt. Verified word-for-word against raw
`chunk-053.text_content`: no overlap with the claims made.
Contrast: two earlier tests (Article 4, High-Risk Classification)
with similarly bad retrieval produced honest "the excerpts do not
contain the answer" responses. Article 53 case did not — a real,
demonstrated failure mode, not hypothetical.

**Fixed (partially):** Added a code-level grounding check — if the
query contains an article number, verify that "articolul N" literally
appears in at least one retrieved chunk's raw text BEFORE calling the
AI model. If not, skip generation entirely and return an explicit
explanation instead of risking fabrication.
Also strengthened the system prompt to require quoting a short
verbatim phrase (under 15 words) supporting every claim.

**Known remaining gap, NOT fixed today:** the check verifies the
number appears SOMEWHERE across the whole batch of retrieved chunks,
not specifically in the chunk being relied on for the answer. Tested
with "Article 6" query — check passed (article 6 mentioned in one of
the 4 chunks) but the model correctly self-identified that the
mention was a cross-reference, not the actual article text. The
model's own judgment caught this; the code check would not have.
This should not be relied on as a backstop.

## 5. Source links added
Added `article` and `source_url` fields per result, plus a top-level
`sources` array (Perplexity-style numbered citations), matching the
field names the production frontend (`js/app.js`) already expects
and falls back from.
**Bug found and fixed same session:** initial version always labeled
each chunk with the FIRST article number mentioned anywhere in its
text, which could be unrelated to the query (e.g. "Article 50" query
returned sources labeled "Article 60", "Article 9", "Article 6",
"Article 78" — Article 50 itself missing from the list, despite being
the actual subject of a correct, well-grounded answer).
**Fixed:** label a chunk with the QUERIED article number if that
specific number is found in its text; only fall back to
first-mention when the query has no article number. Verified fix:
re-ran the Article 50 query, `sources` now correctly includes
"Article 50" pointing at the two chunks that actually contain it.

**Known limitation, not fixed:** EUR-Lex does not offer clean
per-article anchor URLs for this regulation in a predictable format.
All source links currently point to the same full-document URL —
only the label differs. Not a true deep link to the specific
article/paragraph.

---

# Current status — end of session

| Component | Status |
|---|---|
| D1 binding | Verified working |
| Workers AI binding | Verified working |
| Model (GLM-4.7-Flash) | Verified working |
| Output parsing | Fixed and verified |
| Grounding check (batch-level) | Working for clear-cut cases, has known gap |
| Source link labeling | Fixed and verified for queried-article case |
| Source link deep-linking | Not possible with current EUR-Lex URL scheme |
| D1 retrieval quality | Not touched — same limitation as production |
| Route binding to eu-ai-act-ready.eu | Not done — isolated on workers.dev only |
| Production eu-ai-act-search-api | Untouched, frozen baseline intact |

---

# Recommended next steps (not started)
1. Fix D1 retrieval itself — likely needs real full-text search or
   at minimum article-number-aware WHERE clauses instead of
   substring LIKE matching. This affects production too.
2. Tighten the grounding check to validate per-cited-chunk, not
   per-batch.
3. Decide on a real per-article source-link scheme (own site pages
   vs. EUR-Lex anchors, if any exist) before this is user-facing.
4. Separate open item, unrelated to this session's AI work: 9 files
   referenced by `robots.txt`/`llms.txt` (entity-graph.public.jsonld,
   entity-model.json, glossary.json, authority.json, intents.json,
   governance.json, policy.json, ai-signals.json, ai-routes.json,
   ai-validation.json, /signals/) do not exist in the repo — content
   gap, not routing, confirmed via direct repo inspection.

---

# Files retained from this session
- `eu-ai-act-conversation-worker-test.js` — final deployed source
  (version `4ccac3c8` at time of writing)
- `verify-conversation-worker-test.md` — original 6-step manual
  verification checklist
- `popular-askes-test-urls.md` — the 5 real frontend query URLs used
  for retrieval-quality testing
- `session-resource-links.md` — consolidated reference links
