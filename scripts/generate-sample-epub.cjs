const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createSampleEpub() {
  const zip = new JSZip();

  // 1. mimetype (must be first, uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  // 3. OEBPS/chapter1.xhtml
  zip.file(
    'OEBPS/chapter1.xhtml',
    `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="id">
<head>
  <title>Bab 1: Titik Awal di Wonokromo</title>
  <style>
    body { font-family: serif; line-height: 1.6; margin: 5%; }
    h1 { font-weight: normal; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; text-indent: 1.5em; }
    .lead { font-size: 1.1em; text-indent: 0; }
  </style>
</head>
<body>
  <h1>Bab 1: Titik Awal di Wonokromo</h1>
  <p class="lead">Orang memanggil aku: Minke. Namaku sendiri... sementara tak perlu kusebutkan. Bukan karena gila misteri. Aku seorang terpelajar H.B.S.</p>
  <p>Suatu hari kawan sekolahku, Robert Suurhof, mengajakku ke sebuah tempat di pinggiran Surabaya—Wonokromo. Sebuah perkebunan luas di mana berdiri rumah kayu megah milik seorang Nyai.</p>
  <p>Dunia bergerak cepat di pengujung abad ke-19 ini. Ilmu pengetahuan dan teknologi modern membukakan tabir peradaban baru bagi bangsaku, bangsa Hindia yang lama tertidur dalam bayang-bayang.</p>
</body>
</html>`
  );

  // 4. OEBPS/chapter2.xhtml
  zip.file(
    'OEBPS/chapter2.xhtml',
    `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="id">
<head>
  <title>Bab 2: Di Bawah Pesona Annelies</title>
  <style>
    body { font-family: serif; line-height: 1.6; margin: 5%; }
    h1 { font-weight: normal; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; text-indent: 1.5em; }
    blockquote { border-left: 2px solid #888; margin-left: 1em; padding-left: 1em; font-style: italic; }
  </style>
</head>
<body>
  <h1>Bab 2: Di Bawah Pesona Annelies</h1>
  <p>Di tangga beranda rumah besar itu, berdirilah seorang gadis peranakan Eropa. Kulitnya halus seperti pualam, matanya bening memancarkan kelembutan yang sekaligus menyimpan kerapuhan.</p>
  <blockquote>&ldquo;Seorang terpelajar harus sudah berbuat adil sejak dalam pikiran, apalagi dalam perbuatan.&rdquo;</blockquote>
  <p>Kata-kata itu terngiang dalam benakku saat mata kami pertama kali bertatapan. Nama gadis itu Annelies Mellema, putri dari Nyai Ontosoroh.</p>
</body>
</html>`
  );

  // 5. OEBPS/chapter3.xhtml
  zip.file(
    'OEBPS/chapter3.xhtml',
    `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="id">
<head>
  <title>Bab 3: Pandangan Sang Nyai</title>
  <style>
    body { font-family: serif; line-height: 1.6; margin: 5%; }
    h1 { font-weight: normal; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; text-indent: 1.5em; }
  </style>
</head>
<body>
  <h1>Bab 3: Pandangan Sang Nyai</h1>
  <p>Nyai Ontosoroh bukanlah perempuan pribumi biasa sebagaimana dipandang rendah oleh kaum kolonial. Ia mengelola perusahaan pertanian besar Boerderij Buitenzorg dengan kecakapan dan ketegasan yang mengagumkan.</p>
  <p>Ketika aku berbicara dengannya dalam bahasa Belanda yang fasih, ia menatapku dengan sorot mata penuh penilaian tajam, namun hangat dan bersahabat.</p>
  <p>&ldquo;Kau terpelajar, Minke,&rdquo; ucapnya perlahan. &ldquo;Gunakan ilmumu untuk melihat kebenaran dengan matamu sendiri, bukan dengan mata yang dipinjamkan kepadamu.&rdquo;</p>
</body>
</html>`
  );

  // 6. OEBPS/toc.ncx
  zip.file(
    'OEBPS/toc.ncx',
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:nusa-reader-sample-01"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>Bumi Manusia (Cuplikan)</text>
  </docTitle>
  <navMap>
    <navPoint id="navPoint-1" playOrder="1">
      <navLabel><text>Bab 1: Titik Awal di Wonokromo</text></navLabel>
      <content src="chapter1.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-2" playOrder="2">
      <navLabel><text>Bab 2: Di Bawah Pesona Annelies</text></navLabel>
      <content src="chapter2.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-3" playOrder="3">
      <navLabel><text>Bab 3: Pandangan Sang Nyai</text></navLabel>
      <content src="chapter3.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`
  );

  // 7. OEBPS/content.opf
  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>Bumi Manusia (Cuplikan Bab)</dc:title>
    <dc:creator opf:role="aut">Pramoedya Ananta Toer</dc:creator>
    <dc:publisher>Hasta Mitra</dc:publisher>
    <dc:language>id</dc:language>
    <dc:identifier id="BookID" opf:scheme="UUID">urn:uuid:nusa-reader-sample-01</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter3" href="chapter3.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="chapter1"/>
    <itemref idref="chapter2"/>
    <itemref idref="chapter3"/>
  </spine>
</package>`
  );

  const buffer = await zip.generateAsync({ type: 'nodebuffer', mimeType: 'application/epub+zip' });
  const outPath = path.resolve(__dirname, '../public/sample.epub');
  fs.writeFileSync(outPath, buffer);
  console.log('Successfully generated sample.epub at:', outPath, 'Size:', buffer.length, 'bytes');
}

createSampleEpub().catch(console.error);
