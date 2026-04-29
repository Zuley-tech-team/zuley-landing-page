import { useEffect, type ReactNode } from 'react';

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
}

const SITE_NAME = 'Zuley';
const SITE_URL = 'https://zuley.in';

const setMetaBySelector = (selector: string, value: string) => {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute('content', value);
  }
};

export function PageMeta({ title, description, path, children }: PageMetaProps) {
  useEffect(() => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${SITE_URL}${normalizedPath}`;

    document.title = `${title} | ${SITE_NAME}`;

    setMetaBySelector('meta[name="description"]', description);
    setMetaBySelector('meta[property="og:title"]', `${title} | ${SITE_NAME}`);
    setMetaBySelector('meta[property="og:description"]', description);
    setMetaBySelector('meta[property="og:url"]', canonicalUrl);
    setMetaBySelector('meta[name="twitter:title"]', `${title} | ${SITE_NAME}`);
    setMetaBySelector('meta[name="twitter:description"]', description);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
  }, [title, description, path]);

  return <>{children}</>;
}

export default PageMeta;
