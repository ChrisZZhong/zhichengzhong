'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import styles from './patterns.module.css';

export interface PatternTopic {
  id: string;
  name: string;
  question: string;
  patterns: { slug: string; name: string; href: string; diagramHref: string }[];
}

export default function PatternCatalog({ topics }: { topics: PatternTopic[] }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const visibleTopics = topics.map(topic => ({
    ...topic,
    patterns: topic.patterns.filter(pattern =>
      [pattern.name, pattern.slug, topic.name].some(text => text.toLowerCase().includes(query)),
    ),
  })).filter(topic => topic.patterns.length > 0);
  const count = visibleTopics.reduce((total, topic) => total + topic.patterns.length, 0);

  return (
    <>
      <div className={styles.catalogControls}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search patterns</span>
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search patterns"
          />
        </label>
        <p role="status" className={styles.resultCount}>{count} {count === 1 ? 'pattern' : 'patterns'}</p>
      </div>
      {visibleTopics.length > 0 ? (
        <>
          <nav className={styles.topics} aria-label="Pattern topics">
            {visibleTopics.map(topic => <a key={topic.id} href={`#${topic.id}`}>{topic.name}</a>)}
          </nav>
          {visibleTopics.map(topic => (
            <section className={styles.topic} key={topic.id} id={topic.id} aria-labelledby={`${topic.id}-title`}>
              <h2 id={`${topic.id}-title`}>{topic.name}</h2>
              <p>{topic.question}</p>
              <ul className={styles.grid}>
                {topic.patterns.map(pattern => (
                  <li key={pattern.slug}>
                    <Link className={styles.card} href={pattern.href} prefetch={false}>
                      <Image
                        src={pattern.diagramHref}
                        alt=""
                        width={900}
                        height={320}
                        unoptimized
                        className={styles.cardImage}
                      />
                      <span className={styles.cardLabel}>
                        {pattern.name}
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      ) : <p className={styles.empty}>No patterns match your search.</p>}
    </>
  );
}
