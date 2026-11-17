import json

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction

from .models import Annotation, Chapter, Label, POSLabel, Sentence, Word


def normalize_sentence(sentence):
    if sentence is None:
        return None

    if isinstance(sentence, str):
        text = sentence
        labels = []
        pos = []
    else:
        text = sentence.get('text') or ''
        labels = list(sentence.get('labels') or [])
        pos = list(sentence.get('POS') or [])

    text = ' '.join(text.split())
    if not text:
        return None

    words = text.split(' ')
    labels = [str(l).strip() or 'O' for l in labels[:len(words)]]
    labels += ['O'] * (len(words) - len(labels))
    pos = [str(p).strip() for p in pos[:len(words)]]
    pos += [''] * (len(words) - len(pos))

    return {'text': text, 'labels': labels, 'POS': pos}


def normalize_content(content):
    chapters = []
    for chapter in content or []:
        pages = []
        for page in chapter.get('pages') or []:
            if isinstance(page, (str, dict)):
                page = [page]
            sentences = [normalize_sentence(s) for s in page]
            pages.append([s for s in sentences if s])
        new_chapter = dict(chapter)
        new_chapter['pages'] = pages
        chapters.append(new_chapter)
    return chapters


def read_book_json(book):
    if not book.book_file or not book.book_file.name:
        return None
    with default_storage.open(book.book_file.name, 'rb') as f:
        return json.loads(f.read().decode('utf-8'))


def write_book_json(book, data):
    name = book.book_file.name
    if default_storage.exists(name):
        default_storage.delete(name)
    saved = default_storage.save(name, ContentFile(json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8')))
    if saved != name:
        book.book_file.name = saved
        book.save(update_fields=['book_file'])


def _labels(names, label_type):
    found = {l.text: l for l in Label.objects.filter(text__in=names)}
    for name in names:
        if name not in found:
            found[name], _ = Label.objects.get_or_create(text=name, defaults={'type': label_type})
    return found


@transaction.atomic
def save_sentences(book, content):
    Sentence.objects.filter(book=book).delete()

    chapters = {c.index: c for c in Chapter.objects.filter(book=book)}
    pending = []

    for chapter_index, chapter in enumerate(content):
        chapter_obj = chapters.get(chapter_index)
        for page_index, page in enumerate(chapter['pages']):
            for sentence_index, sentence in enumerate(page):
                pending.append((Sentence(
                    text=sentence['text'],
                    book=book,
                    chapter=chapter_obj,
                    page=page_index,
                    sentence_index=sentence_index,
                ), sentence))

    Sentence.objects.bulk_create([p[0] for p in pending], batch_size=500)

    word_texts = set()
    ner_names = set()
    pos_names = set()
    for _, sentence in pending:
        for word, label, pos in zip(sentence['text'].split(' '), sentence['labels'], sentence['POS']):
            if label != 'O':
                word_texts.add(word[:100])
                ner_names.add(label)
            if pos:
                word_texts.add(word[:100])
                pos_names.add(pos)

    words = {w.text: w for w in Word.objects.filter(text__in=word_texts)}
    new_words = [Word(text=t) for t in word_texts if t not in words]
    Word.objects.bulk_create(new_words, batch_size=500, ignore_conflicts=True)
    if new_words:
        words = {w.text: w for w in Word.objects.filter(text__in=word_texts)}

    ner_labels = _labels(ner_names, 'NER')
    pos_labels = _labels(pos_names, 'POS')

    annotations = []
    pos_rows = []
    for sentence_obj, sentence in pending:
        for word_index, (word, label, pos) in enumerate(zip(sentence['text'].split(' '), sentence['labels'], sentence['POS'])):
            if label != 'O':
                annotations.append(Annotation(sentence=sentence_obj, word_index=word_index, text=words[word[:100]], label=ner_labels[label]))
            if pos:
                pos_rows.append(POSLabel(sentence=sentence_obj, word_index=word_index, text=words[word[:100]], label=pos_labels[pos]))

    Annotation.objects.bulk_create(annotations, batch_size=500)
    POSLabel.objects.bulk_create(pos_rows, batch_size=500)

    return len(pending)
