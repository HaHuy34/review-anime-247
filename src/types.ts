export interface DbEpisode {
  name: string; // e.g: "Tập 136"
  src: string;  // Dailymotion embed link
}

export interface AnimeSeries {
  id: string; // Matches series key like "Dragon Ball Z (1989)"
  title: string;
  vietnameseTitle?: string;
  subtitle: string;
  epCount: number;
  orderNum: number;
  icon: string;
  badgeText: string;
  description: string;
  shopeeLink: string;
  episodes: DbEpisode[];
}
