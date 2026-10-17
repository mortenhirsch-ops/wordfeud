import hashlib
import importlib.util
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('dictionary', ROOT / 'scripts/update_dictionary.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class DictionaryTests(unittest.TestCase):
    def test_rejects_uncertain_forms_without_rewriting_them(self):
        entries = [
            ('hund', 'sb.fk.sg.ubest', 'N'),
            ('hund', 'sb.fk.sg.ubest', 'N'),
            ('hunds', 'sb.fk.sg.ubest.gen', 'K'),
            ('grønts', 'adj', 'U'),
            ('København', 'prop', 'N'),
            ('mælkevejen', 'prop', 'N'),
            ('ai', 'fork', 'N'),
            ('listetæer', 'iflerord', 'N'),
            ('fx.', 'fork', 'N'),
            ('gå på', 'vb', 'N'),
            ('ab-', 'sb.sms', 'N'),
            ('café', 'sb', 'N'),
            ('quiz', 'sb', 'N'),
            ('wow', 'udråbsord', 'N'),
            ('a', 'sb', 'N'),
            ('a' * 16, 'sb', 'N'),
            ('ør', 'adj', 'N'),
        ]
        source = '\n'.join(f'COR.00001.110.01\tlemma\t\t{g}\t{f}\t{n}' for f, g, n in entries)
        self.assertEqual(module.select_words(source), ['hund', 'ør'])

    def test_unknown_schema_or_status_stops_import(self):
        for source in ['unexpected\tformat', 'id\tlemma\t\tsb\thund\tX']:
            with self.assertRaises(ValueError):
                module.select_words(source)

    def test_embedded_dictionary_matches_manifest(self):
        html = (ROOT / 'index.html').read_text()
        literal = re.search(r'^const DICT_RAW = (.*);$', html, re.M)[1]
        raw = json.loads(literal)
        words = raw.split('\n')
        manifest = json.loads((ROOT / 'dictionary-manifest.json').read_text())
        self.assertEqual(len(words), manifest['word_count'])
        self.assertEqual(words, sorted(set(words)))
        self.assertTrue(all(module.PLAYABLE.fullmatch(w) for w in words))
        self.assertEqual(hashlib.sha256(raw.encode()).hexdigest(), manifest['words_sha256'])
        self.assertTrue({'hund', 'hunden', 'ladeboks', 'bakeoff', 'scroll'} <= set(words))
        self.assertTrue({'københavn', 'gdpr'}.isdisjoint(words))
        # Same spelling is retained when an independent normative analysis exists.
        self.assertTrue({'hunds', 'mælkevejen'} <= set(words))


if __name__ == '__main__':
    unittest.main()
