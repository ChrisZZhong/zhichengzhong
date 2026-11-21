import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import {
  getPatternDiagramHref,
  getPatternHref,
  patternGroups,
  patternSourceUrl,
} from '@/lib/microservice-patterns';
import PatternCatalog from './PatternCatalog';
import PatternMap from './PatternMap';
import styles from './patterns.module.css';

const title = 'System Design Patterns';
const description = 'Explore microservice patterns for splitting services, managing data, and keeping systems running.';

export const metadata: Metadata = {
  title: `${title} | Zhicheng Zhong`,
  description,
};

const topics = patternGroups.map(({ id, name, question, patterns }) => ({
  id,
  name,
  question,
  patterns: patterns.map(({ slug, name }) => ({
    slug,
    name,
    href: getPatternHref(slug),
    diagramHref: getPatternDiagramHref(slug),
  })),
}));

export default function PatternCatalogPage() {
  return (
    <div className={styles.shell}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <PatternMap topics={topics} />
        <section id="pattern-catalog" className={styles.catalog} aria-labelledby="pattern-catalog-title">
          <h2 id="pattern-catalog-title">Browse patterns</h2>
          <PatternCatalog topics={topics} />
        </section>
        <footer className={styles.sourceFooter}>
          <a href={patternSourceUrl + 'index.html'} target="_blank" rel="noopener noreferrer">
            Reference catalog by Chris Richardson <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </div>
  );
}
