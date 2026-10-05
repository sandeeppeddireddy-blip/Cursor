%dw 2.0

/**
 * Shared knowledge helpers for MCP tools.
 * Corpus: classpath://knowledge-index.json
 */
fun loadCorpus() =
  readUrl("classpath://knowledge-index.json", "application/json").documents

fun tokenize(text: String): Array<String> =
  (lower(text) splitBy /[^a-z0-9]+/)
    filter ((token) -> !isEmpty(token) and sizeOf(token) > 1)

fun firstIndex(haystack: String, term: String): Number =
  ((haystack find term)[0] default -1) as Number

fun snippetAround(body: String, terms: Array<String>): String = do {
  var lowerBody = lower(body)
  var indexes = terms map ((term) -> firstIndex(lowerBody, term)) filter ((i) -> i >= 0)
  var index = if (isEmpty(indexes)) -1 else min(indexes)
  ---
  if (index < 0)
    trim(if (sizeOf(body) > 280) body[0 to 279] else body)
  else do {
    var start = max([0, index - 80]) as Number
    var end = min([sizeOf(body) - 1, index + 199]) as Number
    var prefix = if (start > 0) "…" else ""
    var suffix = if (end < sizeOf(body) - 1) "…" else ""
    ---
    prefix ++ trim(body[start to end]) ++ suffix
  }
}

fun scoreDocument(doc, terms: Array<String>): Number =
  terms reduce ((term, acc = 0) -> do {
    var haystack = lower((doc.title default "") ++ "\n" ++ (doc.body default ""))
    var matches = sizeOf(haystack splitBy term) - 1
    var titleBoost = if (lower(doc.title default "") contains term) 4 else 0
    ---
    if (matches <= 0) acc else acc + matches + titleBoost
  })

fun searchKnowledge(query: String, limit: Number = 5) = do {
  var terms = tokenize(query)
  var scored =
    if (isEmpty(terms)) []
    else
      (loadCorpus() map ((doc) -> {
        id: doc.id,
        title: doc.title,
        path: doc.path,
        snippet: snippetAround(doc.body default "", terms),
        score: scoreDocument(doc, terms)
      }))
      filter ((hit) -> hit.score > 0)
      orderBy ((hit) -> -hit.score)
  var capped =
    if (isEmpty(scored)) []
    else if (sizeOf(scored) <= limit) scored
    else scored[0 to (limit as Number) - 1]
  ---
  {
    query: query,
    hitCount: sizeOf(capped),
    hits: capped
  }
}

fun getDocument(id: String) = do {
  var match = loadCorpus() filter ((doc) -> doc.id == id)
  ---
  if (isEmpty(match))
    { found: false, id: id }
  else do {
    var doc = match[0]
    ---
    {
      found: true,
      id: doc.id,
      title: doc.title,
      path: doc.path,
      body: doc.body
    }
  }
}

fun listDocuments() =
  {
    documents: loadCorpus() map ((doc) -> {
      id: doc.id,
      title: doc.title,
      path: doc.path
    })
  }
