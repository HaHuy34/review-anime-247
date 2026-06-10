import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

export const getEpisodesByAnime = async (animeId: string) => {
  const q = query(collection(db, "episodes"), where("animeId", "==", animeId));
  const snapshot = await getDocs(q);

  const episodes = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as any[];

  return episodes.sort((a, b) => (a.episode || 0) - (b.episode || 0));
};

export const addEpisode = async (data: any) => {
  return addDoc(collection(db, "episodes"), data);
};

export const updateEpisode = async (id: string, data: any) => {
  return updateDoc(doc(db, "episodes", id), data);
};

export const deleteEpisode = async (id: string) => {
  return deleteDoc(doc(db, "episodes", id));
};
