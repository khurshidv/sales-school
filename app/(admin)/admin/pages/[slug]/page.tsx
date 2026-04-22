import PageDetailClient from './PageDetailClient';

export default async function PageDetailRoute({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PageDetailClient slug={slug} />;
}
