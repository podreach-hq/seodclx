import JSZip from 'jszip';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Receive base64-encoded zip from frontend
    const { zipBase64 } = req.body;
    if (!zipBase64) {
      return res.status(400).json({ error: 'No zip data provided' });
    }

    // Decode base64 to buffer
    const zipBuffer = Buffer.from(zipBase64, 'base64');

    // Load zip
    const zip = await JSZip.loadAsync(zipBuffer);

    // Extract all CSV files
    const files = {};
    const csvFiles = Object.keys(zip.files).filter(name =>
      name.toLowerCase().endsWith('.csv') && !zip.files[name].dir
    );

    for (const filename of csvFiles) {
      const content = await zip.files[filename].async('string');
      // Normalize filename to key: "Queries.csv" → "queries"
      const key = filename.replace(/\.csv$/i, '').toLowerCase().replace(/\s+/g, '_');
      files[key] = content;
    }

    if (Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No CSV files found in zip' });
    }

    return res.status(200).json({ files });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
