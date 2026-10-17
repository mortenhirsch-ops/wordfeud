#!/usr/bin/env python3
"""Build a conservative Danish word list from the pinned official COR release."""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path
import re
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = 'https://ordregister.dk/files/cor1.5.1.0.tsv'
# Only letters supported by the current Danish rack and board; no normalization
# of punctuation, capitalization, accents or multiword entries into new words.
PLAYABLE = re.compile(r'[a-pr-vx-zæøå]{2,15}')
EXCLUDED_CLASSES = {'prop', 'fork', 'iflerord'}


def select_words(source):
    words = set()
    for line, row in enumerate(csv.reader(io.StringIO(source), delimiter='\t'), 1):
        if len(row) != 6:
            raise ValueError(f'Unexpected COR schema at line {line}')
        cor_id, lemma, gloss, grammar, form, status = row
        if status not in {'N', 'K', 'U'}:
            raise ValueError(f'Unexpected norm status at line {line}: {status}')
        if (status == 'N' and grammar.split('.')[0] not in EXCLUDED_CLASSES
                and PLAYABLE.fullmatch(form)):
            words.add(form)
    if not words:
        raise ValueError('No words selected; refusing to overwrite dictionary')
    return sorted(words)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, help='Previously downloaded COR TSV')
    args = parser.parse_args()
    if args.source:
        data = args.source.read_bytes()
    else:
        with urlopen(SOURCE_URL, timeout=60) as response:
            data = response.read()
    words = select_words(data.decode('utf-8-sig'))
    path = ROOT / 'index.html'
    html = path.read_text(encoding='utf-8')
    literal = json.dumps('\n'.join(words), ensure_ascii=False)
    html, count = re.subn(r'^const DICT_RAW = .*;$', lambda _: f'const DICT_RAW = {literal};',
                          html, flags=re.MULTILINE)
    if count != 1:
        raise ValueError('Expected exactly one DICT_RAW block')
    footer = (f'Ordbog: {len(words):,} ordformer fra Retskrivningsordbogen 5.1 '
              '(COR 1.5.1.0, Dansk Sprognævn). Forsigtigt filtreret: kun eksplicit '
              'normerede former; ingen navne, forkortelser, udtryksdele eller '
              'automatisk dannede former. Ikke verificeret mod Wordfeuds interne '
              'facitliste; enkelte afvigelser kan forekomme.').replace(f'{len(words):,}', f'{len(words):,}'.replace(',', '.'))
    html, count = re.subn(r'<div>Ordbog:.*?</div>', lambda _: f'<div>{footer}</div>', html)
    if count != 1:
        raise ValueError('Expected exactly one dictionary footer')
    manifest = {
        'source_url': SOURCE_URL,
        'version': 'COR 1.5.1.0 / Retskrivningsordbogen 5.1 (2025)',
        'source_sha256': hashlib.sha256(data).hexdigest(),
        'word_count': len(words),
        'words_sha256': hashlib.sha256('\n'.join(words).encode()).hexdigest(),
        'norm_status': ['N'],
        'excluded_classes': sorted(EXCLUDED_CLASSES),
        'allowed_form_regex': PLAYABLE.pattern,
        'verified_against_wordfeud_server': False,
    }
    path.write_text(html, encoding='utf-8')
    (ROOT / 'dictionary-manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Built {len(words):,} unique word forms')


if __name__ == '__main__':
    main()
