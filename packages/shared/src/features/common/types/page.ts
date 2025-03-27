export interface AppPageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}
