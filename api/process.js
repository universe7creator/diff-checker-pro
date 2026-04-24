function computeLineDiff(leftLines, rightLines) {
  const result = [];
  let i = 0, j = 0;
  while (i < leftLines.length || j < rightLines.length) {
    if (i >= leftLines.length) { result.push({ type: 'add', text: rightLines[j] }); j++; }
    else if (j >= rightLines.length) { result.push({ type: 'remove', text: leftLines[i] }); i++; }
    else if (leftLines[i] === rightLines[j]) { result.push({ type: 'equal', text: leftLines[i] }); i++; j++; }
    else {
      result.push({ type: 'remove', text: leftLines[i] });
      result.push({ type: 'add', text: rightLines[j] });
      i++; j++;
    }
  }
  return result;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-License-Key');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { original, modified } = req.body || {};
    if (!original) return res.status(400).json({ error: 'original text is required' });
    if (!modified) return res.status(400).json({ error: 'modified text is required' });

    const leftLines = String(original).split('\n');
    const rightLines = String(modified).split('\n');
    const diff = computeLineDiff(leftLines, rightLines);

    const adds = diff.filter(d => d.type === 'add').length;
    const removes = diff.filter(d => d.type === 'remove').length;
    const changes = diff.filter(d => d.type !== 'equal').length;

    return res.status(200).json({ diff, stats: { adds, removes, changes } });
  } catch (err) {
    return res.status(500).json({ error: 'Diff computation failed', details: err.message });
  }
};
